import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {expect, test, type Page} from '@playwright/test';

import {
  alternates,
  DEFAULT_LOCALE,
  LOCALES,
  pageUrl,
  SITE_ORIGIN,
  splitLocale,
} from '../src/locales.mjs';
import {findPages, renderSitemap} from '../scripts/sitemap.mjs';
import {exportedPages} from './helpers';

// The sitemap and robots.txt that `npm run build` writes into out/. None of
// this knows the copy of a page: it reads the structure of the export.

type Entry = {loc: string; alternates: Array<{hreflang: string; href: string}>};

// Parses the sitemap with the browser's XML parser, which fails on any
// malformed markup, and returns its entries.
async function parseSitemap(page: Page, xml: string): Promise<Array<Entry>> {
  return page.evaluate(text => {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const problem = doc.getElementsByTagName('parsererror')[0];
    if (problem)
      throw new Error(
        `The sitemap is not well-formed XML: ${problem.textContent}`,
      );
    const root = doc.documentElement;
    if (
      root.localName !== 'urlset' ||
      root.namespaceURI !== 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ) {
      throw new Error('The root element is not a sitemap <urlset>.');
    }
    return Array.from(root.children).map(url => {
      if (url.localName !== 'url')
        throw new Error(`<${url.localName}> in <urlset>`);
      const [loc, ...rest] = Array.from(url.children);
      if (loc?.localName !== 'loc')
        throw new Error('A <url> does not start with <loc>.');
      return {
        loc: loc.textContent ?? '',
        alternates: rest.map(link => {
          if (
            link.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
            link.localName !== 'link' ||
            link.getAttribute('rel') !== 'alternate'
          ) {
            throw new Error(`Unexpected <${link.localName}> in a <url>.`);
          }
          return {
            hreflang: link.getAttribute('hreflang') ?? '',
            href: link.getAttribute('href') ?? '',
          };
        }),
      };
    });
  }, xml);
}

// What the pages of a sitemap say about each other, checked for any list of
// languages: every address is absolute and has the style of the site, each page
// lists itself and its other languages, every list is the same in all the
// languages of its page, and x-default is the default language.
function expectAlternatesToAgree(
  entries: Array<Entry>,
  locales: ReadonlyArray<string>,
) {
  const locs = entries.map(entry => entry.loc);
  expect(new Set(locs).size, 'an address is listed twice').toBe(locs.length);
  for (const loc of locs) {
    expect(loc.startsWith(`${SITE_ORIGIN}/`), loc).toBe(true);
    expect(loc, 'no query or fragment').not.toMatch(/[?#\s]/);
    // The home page of each language, `/` or `/es/`, is the only address that
    // may end in a slash.
    const homes = locales.map(locale => pageUrl('/', locale));
    expect(homes.includes(loc) || !loc.endsWith('/'), loc).toBe(true);
  }
  for (const entry of entries) {
    const path = entry.loc.slice(SITE_ORIGIN.length);
    const {locale, route} = splitLocale(path, locales);
    const hreflangs = entry.alternates.map(link => link.hreflang);
    expect(new Set(hreflangs).size, `${entry.loc} repeats a hreflang`).toBe(
      hreflangs.length,
    );
    expect(entry.alternates, `${entry.loc} lists itself`).toContainEqual({
      hreflang: locale,
      href: entry.loc,
    });
    for (const {hreflang, href} of entry.alternates) {
      expect(
        [...locales, 'x-default'],
        `${entry.loc}: hreflang ${hreflang}`,
      ).toContain(hreflang);
      // The address of an alternate is the address of that page in that language,
      // and the sitemap lists it.
      expect(href, `${entry.loc}: ${hreflang}`).toBe(
        pageUrl(route, hreflang === 'x-default' ? DEFAULT_LOCALE : hreflang),
      );
      expect(
        locs,
        `${entry.loc} lists ${href}, which is not in the sitemap`,
      ).toContain(href);
    }
    // The list is in the order of the languages, then x-default.
    const existsIn = entry.alternates
      .filter(link => link.hreflang !== 'x-default')
      .map(link => link.hreflang);
    expect(entry.alternates).toEqual(alternates(route, existsIn, locales));
  }
  // Each language of a page lists the same alternates: they point at each other.
  const byRoute = new Map<string, Array<Entry>>();
  for (const entry of entries) {
    const {route} = splitLocale(entry.loc.slice(SITE_ORIGIN.length), locales);
    byRoute.set(route, [...(byRoute.get(route) ?? []), entry]);
  }
  for (const [route, group] of byRoute) {
    for (const entry of group) {
      expect(entry.alternates, `${entry.loc} and ${group[0].loc}`).toEqual(
        group[0].alternates,
      );
      expect(
        group.length,
        `${route} lists ${entry.alternates.length} alternates`,
      ).toBe(
        entry.alternates.filter(link => link.hreflang !== 'x-default').length,
      );
    }
  }
}

test.describe('sitemap.xml', () => {
  test('is well-formed and lists every page of the export', async ({
    page,
    request,
  }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);
    const entries = await parseSitemap(page, await response.text());

    // An exported page is in the sitemap, and the other way round. A page that
    // asks for `noindex` is the one that may be missing.
    const listed = new Set(entries.map(entry => entry.loc));
    const exported = exportedPages();
    expect(exported.length).toBeGreaterThan(0);
    for (const path of exported) {
      const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
      const noindex = /<meta[^>]+name=["']?robots["']?[^>]*noindex/i.test(
        readFileSync(join('out', file), 'utf8'),
      );
      expect(
        listed.has(SITE_ORIGIN + path),
        noindex
          ? `${path} asks for noindex and is in the sitemap`
          : `${path} is in the export and not in the sitemap`,
      ).toBe(!noindex);
    }
    for (const loc of listed) {
      const path = loc.slice(SITE_ORIGIN.length);
      expect(exported, `${loc} is not a page of the export`).toContain(path);
    }

    // No 404 or 500 page, and one <url> for each page in each language.
    expect(entries.filter(entry => /\/(404|500)$/.test(entry.loc))).toEqual([]);
    expectAlternatesToAgree(entries, LOCALES);
  });

  test('has an English address for every page, and x-default points at it', async ({
    page,
    request,
  }) => {
    const entries = await parseSitemap(
      page,
      await (await request.get('/sitemap.xml')).text(),
    );
    for (const entry of entries) {
      const {route} = splitLocale(entry.loc.slice(SITE_ORIGIN.length), LOCALES);
      expect(
        entry.alternates.find(link => link.hreflang === 'x-default')?.href,
        entry.loc,
      ).toBe(pageUrl(route, DEFAULT_LOCALE));
    }
  });
});

test.describe('robots.txt', () => {
  test('lets every crawler in and points at the sitemap', async ({request}) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBe(true);
    const lines = (await response.text())
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    expect(lines).toContain('User-agent: *');
    expect(lines).toContain('Allow: /');
    // A `Disallow:` with a path closes part of the site. An empty one is allowed.
    expect(lines.filter(line => /^disallow:\s*\S/i.test(line))).toEqual([]);
    expect(lines).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
  });
});

// The real site has one language, so the rest of the code, for the day that it
// has more, is checked on a folder of empty pages. Adding a language to LOCALES
// must not need a change to the sitemap.
test.describe('sitemap of a site with two languages', () => {
  const locales = ['en', 'es'];
  let dir: string;

  test.beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'sitemap-'));
    const html = (head = '') =>
      `<!DOCTYPE html><html><head><title>t</title>${head}</head><body><h1>t</h1></body></html>`;
    const files: Record<string, string> = {
      'index.html': html(),
      'es/index.html': html(),
      'features.html': html(),
      'es/features.html': html(),
      'features/one.html': html(),
      'es/features/one.html': html(),
      // Only in English.
      'legal.html': html(),
      // Only in Spanish.
      'es/only-here.html': html(),
      // The error page, in both languages, and the scripts of the pages.
      '404.html': html(),
      'es/404.html': html(),
      '_next/static/chunk.html': html(),
      // A page that asks for noindex, in either order of the attributes.
      'hidden.html': html('<meta name="robots" content="noindex, nofollow"/>'),
      'es/hidden.html': html('<meta content="noindex" name="robots">'),
      // Only the English one asks, so the Spanish one stays.
      'half.html': html('<meta name="robots" content="noindex"/>'),
      'es/half.html': html('<meta name="robots" content="index,follow"/>'),
    };
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, name)), {recursive: true});
      writeFileSync(join(dir, name), content);
    }
  });
  test.afterAll(() => rmSync(dir, {recursive: true, force: true}));

  test('lists each language of a page, and only the ones that exist', async ({
    page,
  }) => {
    const pages = findPages(dir, locales);
    expect(Object.fromEntries(pages)).toEqual({
      '/': ['en', 'es'],
      '/features': ['en', 'es'],
      '/features/one': ['en', 'es'],
      '/half': ['es'],
      '/legal': ['en'],
      '/only-here': ['es'],
    });

    const entries = await parseSitemap(page, renderSitemap(pages, locales));
    expect(entries.map(entry => entry.loc)).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/es/`,
      `${SITE_ORIGIN}/features`,
      `${SITE_ORIGIN}/es/features`,
      `${SITE_ORIGIN}/features/one`,
      `${SITE_ORIGIN}/es/features/one`,
      `${SITE_ORIGIN}/es/half`,
      `${SITE_ORIGIN}/legal`,
      `${SITE_ORIGIN}/es/only-here`,
    ]);
    expectAlternatesToAgree(entries, locales);

    const byLoc = new Map(entries.map(entry => [entry.loc, entry.alternates]));
    // A page in two languages lists both, and x-default is the English one.
    expect(byLoc.get(`${SITE_ORIGIN}/es/features`)).toEqual([
      {hreflang: 'en', href: `${SITE_ORIGIN}/features`},
      {hreflang: 'es', href: `${SITE_ORIGIN}/es/features`},
      {hreflang: 'x-default', href: `${SITE_ORIGIN}/features`},
    ]);
    // The Spanish home page is the index of its folder, /es/, as / is the
    // English one, and the two list each other.
    expect(byLoc.get(`${SITE_ORIGIN}/es/`)).toContainEqual({
      hreflang: 'es',
      href: `${SITE_ORIGIN}/es/`,
    });
    // A page in one language lists that one, and no other.
    expect(byLoc.get(`${SITE_ORIGIN}/legal`)).toEqual([
      {hreflang: 'en', href: `${SITE_ORIGIN}/legal`},
      {hreflang: 'x-default', href: `${SITE_ORIGIN}/legal`},
    ]);
    // A page that has no English copy has no x-default to point at.
    expect(byLoc.get(`${SITE_ORIGIN}/es/only-here`)).toEqual([
      {hreflang: 'es', href: `${SITE_ORIGIN}/es/only-here`},
    ]);
  });

  // Next.js exports `pages/es/index.tsx` as `out/es.html`, which the server
  // puts at /es, not at /es/. The sitemap must not list a different address
  // from the one that serves the page, so it stops the build, and the message
  // says where the file goes.
  for (const [name, files] of Object.entries({
    'the home page of a language beside its folder': ['index.html', 'es.html'],
    'a page of a language in a folder of its own': [
      'index.html',
      'es/index.html',
      'es/one/index.html',
    ],
    'a language that LOCALES does not have': ['index.html', 'fr/index.html'],
  })) {
    test(`refuses ${name}`, async () => {
      const bad = mkdtempSync(join(tmpdir(), 'sitemap-bad-'));
      try {
        for (const file of files) {
          mkdirSync(dirname(join(bad, file)), {recursive: true});
          writeFileSync(join(bad, file), '<!DOCTYPE html><title>t</title>');
        }
        expect(() => findPages(bad, locales)).toThrow(/is served at/);
      } finally {
        rmSync(bad, {recursive: true, force: true});
      }
    });
  }
});
