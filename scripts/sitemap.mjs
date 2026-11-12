// Builds sitemap.xml and robots.txt from the static export in out/. No side
// effects on import: scripts/generate-sitemap.mjs runs it after `next build`,
// and tests/sitemap.spec.ts calls it on a folder of fixtures.
//
// The pages come from out/, not from src/pages/, so the sitemap lists what is
// published: a page that the export does not hold is not in it, and a page that
// a later build adds (another language, a dynamic route) is.
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative, sep} from 'node:path';

import {
  alternates,
  LOCALES,
  localePath,
  SITE_ORIGIN,
  splitLocale,
} from '../src/locales.mjs';

// Files of the export that are not pages that a reader should be sent to.
const NOT_PAGES = new Set(['/404', '/500']);

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      // _next holds the scripts and the data of the pages.
      if (!entry.name.startsWith('_')) yield* htmlFiles(path);
    } else if (entry.name.endsWith('.html')) {
      yield path;
    }
  }
}

// The address that a file of the export is served at: Netlify drops the
// extension (`out/features.html` is `/features`) and serves the index of a
// folder at the folder with a slash (`out/es/index.html` is `/es/`).
function pathOfFile(outDir, file) {
  const parts = relative(outDir, file).split(sep);
  const name = parts.pop().slice(0, -'.html'.length);
  return (
    '/' +
    parts.map(part => `${part}/`).join('') +
    (name === 'index' ? '' : name)
  );
}

// A page that asks to stay out of search results. The sitemap leaves it out;
// listing it would contradict the page.
export function isNoindex(html) {
  return [...html.matchAll(/<meta\s[^>]*>/gi)].some(
    ([tag]) =>
      /\bname\s*=\s*["']?(robots|googlebot)\b/i.test(tag) &&
      /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag),
  );
}

/**
 * The pages of the export, and the languages that each one exists in.
 *
 * @param {string} outDir
 * @param {ReadonlyArray<string>} [locales]
 * @returns {Map<string, Array<string>>} The route of each page, in order, and
 *   its languages, in the order of `locales`.
 */
export function findPages(outDir, locales = LOCALES) {
  /** @type {Map<string, Set<string>>} */
  const found = new Map();
  for (const file of htmlFiles(outDir)) {
    const served = pathOfFile(outDir, file);
    const {locale, route} = splitLocale(served, locales);
    if (NOT_PAGES.has(route) || isNoindex(readFileSync(file, 'utf8'))) {
      continue;
    }
    // The sitemap lists a page at the address that locales.mjs gives it, so a
    // file that the server puts anywhere else must stop the build: `out/es.html`
    // is served at `/es`, and `/es/` (the address of the Spanish home page)
    // would send a reader away from it. Only the home page of a language is
    // the index of a folder.
    if (
      localePath(route, locale) !== served ||
      (route !== '/' && route.endsWith('/'))
    ) {
      throw new Error(
        `${relative(outDir, file)} is served at ${served}, which is not an ` +
          'address of the site. A page is a file (out/features.html), except ' +
          'the home page of a language, which is out/<code>/index.html, with ' +
          'the code in LOCALES (src/locales.mjs).',
      );
    }
    if (!found.has(route)) found.set(route, new Set());
    found.get(route).add(locale);
  }
  return new Map(
    [...found.keys()]
      .sort()
      .map(route => [
        route,
        locales.filter(locale => found.get(route).has(locale)),
      ]),
  );
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * One <url> for each page in each language, and under it the alternates of the
 * page: the same list in every language of it.
 *
 * @param {Map<string, Array<string>>} pages The result of `findPages`.
 * @param {ReadonlyArray<string>} [locales]
 */
export function renderSitemap(pages, locales = LOCALES) {
  const urls = [];
  for (const [route, existsIn] of pages) {
    const links = alternates(route, existsIn, locales).map(
      ({hreflang, href}) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`,
    );
    for (const locale of existsIn) {
      const loc = escapeXml(SITE_ORIGIN + localePath(route, locale));
      urls.push(
        ['  <url>', `    <loc>${loc}</loc>`, ...links, '  </url>'].join('\n'),
      );
    }
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

// Everything may be crawled. The sitemap is where the languages are linked.
export function renderRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}
