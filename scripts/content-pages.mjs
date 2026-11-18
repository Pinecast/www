// Writes the page of each text in content/ (README.md, "Translated MDX
// pages"). `npm run build` and `npm run dev` run it first:
//
//   npm run content:pages
//
// The text of a translated MDX page is in content/<tag>/<route>.mdx: English
// in content/en/, which Lingo.dev translates into the folder of each other
// language (content/es-419/). The page in src/pages/ only gives a text its
// address and its props, so every one of them is the same three lines. This
// writes them from the files that are there, and git ignores them: it also
// writes src/pages/.gitignore, which lists them and itself.
//
// It stops the build, and writes nothing, when
// - a translation has no English text (delete the translation with it);
// - a file that it did not write has the address of a page that it would,
//   such as the MDX page that a text was moved from;
// - a translated page is not in TRANSLATED_ROUTES (src/locales.mjs), which the
//   links and the language links of the site read.
// It deletes a page that it wrote for a text that is gone. A folder of
// content/ for a language that is not in LOCALES (yet) gets no pages.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, join} from 'node:path';

import {
  DEFAULT_LOCALE,
  LOCALES,
  hasPage,
  languageTag,
  localePath,
} from '../src/locales.mjs';

const HEADER = '// Written by scripts/content-pages.mjs';

/**
 * Writes the pages of the texts in `<root>/content/` into `<root>/src/pages/`,
 * and deletes the ones that it wrote before for a text that is gone. Throws,
 * with every problem, before it writes anything.
 *
 * @param {string} root
 * @returns {{written: Array<string>, removed: Array<string>}} Paths in src/pages/.
 */
export function writeContentPages(root) {
  const pagesDir = join(root, 'src', 'pages');
  const english = new Set(
    textRoutes(join(root, 'content', languageTag(DEFAULT_LOCALE))),
  );
  /** @type {Map<string, string>} The source of each page, by its path in src/pages/. */
  const pages = new Map();
  const problems = [];
  for (const locale of LOCALES) {
    const tag = languageTag(locale);
    for (const route of textRoutes(join(root, 'content', tag))) {
      const text = `content/${tag}${route}.mdx`;
      if (
        !/^(\/[a-z0-9]+(-[a-z0-9]+)*)+$/.test(route) ||
        route.endsWith('/index')
      ) {
        problems.push(
          `${text}: name a text as its page, in lower case letters, digits ` +
            'and hyphens (an index page is not supported).',
        );
        continue;
      }
      if (!english.has(route)) {
        problems.push(
          `${text} has no English text, content/en${route}.mdx. Delete it, ` +
            'or put back the English.',
        );
        continue;
      }
      if (!hasPage(route, locale)) {
        problems.push(
          `${text}: add '${route}' to TRANSLATED_ROUTES.${locale} in ` +
            'src/locales.mjs.',
        );
      }
      const page = `${localePath(route, locale).slice(1)}.tsx`;
      for (const other of addressesOf(page)) {
        const file = join(pagesDir, other);
        if (existsSync(file) && !isWritten(file)) {
          problems.push(
            `src/pages/${other} has the address of ${text}. Delete it: ` +
              'this script writes that page.',
          );
        }
      }
      pages.set(page, pageSource(page, text, locale, route));
    }
  }
  if (problems.length) {
    throw new Error(problems.join('\n'));
  }

  const written = [];
  for (const [page, source] of pages) {
    const file = join(pagesDir, page);
    // Rewriting a file that has not changed would reload `npm run dev`.
    if (existsSync(file) && readFileSync(file, 'utf8') === source) continue;
    mkdirSync(dirname(file), {recursive: true});
    writeFileSync(file, source);
    written.push(page);
  }
  const removed = [];
  for (const page of files(pagesDir)) {
    if (pages.has(page) || !isWritten(join(pagesDir, page))) continue;
    rmSync(join(pagesDir, page));
    removed.push(page);
    for (
      let dir = dirname(join(pagesDir, page));
      dir !== pagesDir && readdirSync(dir).length === 0;
      dir = dirname(dir)
    ) {
      rmdirSync(dir);
    }
  }
  if (existsSync(pagesDir)) {
    writeFileSync(
      join(pagesDir, '.gitignore'),
      [
        '# Written by scripts/content-pages.mjs: the pages that it writes from',
        '# content/, and this file (README.md, "Translated MDX pages").',
        '/.gitignore',
        ...[...pages.keys()].sort().map(page => `/${page}`),
        '',
      ].join('\n'),
    );
  }
  return {written, removed};
}

// The route of each text in `dir`: `features/collaborators.mdx` is
// `/features/collaborators`.
function textRoutes(dir) {
  return files(dir)
    .filter(file => file.endsWith('.mdx'))
    .map(file => `/${file.slice(0, -'.mdx'.length)}`);
}

// The files in `dir` and its folders, as paths relative to it with `/`.
function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile())
    .map(entry =>
      join(entry.parentPath, entry.name)
        .slice(dir.length + 1)
        .split(/[\\/]/)
        .join('/'),
    );
}

// Each file in src/pages/ that Next.js would give the address of `page`
// (`features/collaborators.tsx`), as `pageExtensions` in next.config.js has
// them.
function addressesOf(page) {
  const base = page.slice(0, -'.tsx'.length);
  return ['tsx', 'mdx'].flatMap(ext => [
    `${base}.${ext}`,
    `${base}/index.${ext}`,
  ]);
}

function isWritten(file) {
  return file.endsWith('.tsx') && readFileSync(file, 'utf8').startsWith(HEADER);
}

function pageSource(page, text, locale, route) {
  const up = '../'.repeat(page.split('/').length + 1);
  const props =
    locale === DEFAULT_LOCALE
      ? [
          "import {defaultLocaleStaticProps} from '@/i18n-static';",
          `export const getStaticProps = defaultLocaleStaticProps('${route}');`,
        ]
      : [
          "import {localeStaticProps} from '@/i18n-static';",
          `export const getStaticProps = localeStaticProps('${locale}', '${route}');`,
        ];
  return [
    `${HEADER} from ${text}.`,
    '// Do not edit or commit it: `npm run dev` and `npm run build` write it.',
    props[0],
    '',
    `export {default} from '${up}${text}';`,
    props[1],
    '',
  ].join('\n');
}

// Run as a script, not imported (tests/content-pages.spec.ts). This reads its
// path from the command line, not from `import.meta`, which the loader of the
// tests cannot take.
const script = process.argv[1] ?? '';
if (basename(script) === 'content-pages.mjs') {
  try {
    const {written, removed} = writeContentPages(join(dirname(script), '..'));
    for (const page of written) console.log(`Wrote src/pages/${page}`);
    for (const page of removed) console.log(`Removed src/pages/${page}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
