import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {expect, test} from '@playwright/test';

import {writeContentPages} from '../scripts/content-pages.mjs';
import {TRANSLATED_ROUTES} from '../src/locales.mjs';

// scripts/content-pages.mjs, in a folder of its own with texts made up for
// the test. The build runs it on the real ones, and the other tests check the
// pages that it makes.

// A route that is in Spanish (TRANSLATED_ROUTES), and one that is not.
const ROUTE = '/features/collaborators';
const ENGLISH_ONLY = '/features/not-translated';

let root: string;

test.beforeEach(() => {
  expect(TRANSLATED_ROUTES.es).toContain(ROUTE);
  expect(TRANSLATED_ROUTES.es).not.toContain(ENGLISH_ONLY);
  root = mkdtempSync(join(tmpdir(), 'content-pages-'));
  mkdirSync(join(root, 'src', 'pages'), {recursive: true});
});

test.afterEach(() => {
  rmSync(root, {recursive: true, force: true});
});

const addText = (path: string) => {
  const file = join(root, 'content', path);
  mkdirSync(dirname(file), {recursive: true});
  writeFileSync(file, '# Text\n');
};

const page = (path: string) => join(root, 'src', 'pages', path);

// The path of the file that a page exports, from the page.
const textOf = (path: string) => {
  const source = readFileSync(page(path), 'utf8');
  const from = source.match(/export \{default\} from '([^']+)'/)![1];
  return join(dirname(page(path)), from);
};

test('each text gets its page in its language, which git ignores', () => {
  addText(`en${ROUTE}.mdx`);
  addText(`es-419${ROUTE}.mdx`);
  addText(`en${ENGLISH_ONLY}.mdx`);
  // A language that is not in LOCALES yet.
  addText(`pt-BR${ROUTE}.mdx`);

  const {written} = writeContentPages(root);

  expect(written.sort()).toEqual([
    `es${ROUTE}.tsx`,
    `features/collaborators.tsx`,
    `features/not-translated.tsx`,
  ]);
  expect(textOf(`features/collaborators.tsx`)).toBe(
    join(root, `content/en${ROUTE}.mdx`),
  );
  expect(textOf(`es${ROUTE}.tsx`)).toBe(
    join(root, `content/es-419${ROUTE}.mdx`),
  );
  expect(readFileSync(page(`es${ROUTE}.tsx`), 'utf8')).toContain(
    `localeStaticProps('es', '${ROUTE}')`,
  );
  expect(readFileSync(page(`features/collaborators.tsx`), 'utf8')).toContain(
    `defaultLocaleStaticProps('${ROUTE}')`,
  );
  expect(
    readFileSync(page('.gitignore'), 'utf8')
      .split('\n')
      .filter(line => line && !line.startsWith('#')),
  ).toEqual([
    '/.gitignore',
    `/es${ROUTE}.tsx`,
    `/features/collaborators.tsx`,
    `/features/not-translated.tsx`,
  ]);

  // Nothing changed, so nothing is written again.
  expect(writeContentPages(root)).toEqual({written: [], removed: []});
});

test('a page whose text is gone is deleted, with its empty folders', () => {
  addText(`en${ROUTE}.mdx`);
  addText(`es-419${ROUTE}.mdx`);
  writeContentPages(root);

  rmSync(join(root, `content/es-419${ROUTE}.mdx`));
  expect(writeContentPages(root).removed).toEqual([`es${ROUTE}.tsx`]);
  expect(existsSync(page('es'))).toBe(false);
  expect(existsSync(page(`features/collaborators.tsx`))).toBe(true);
  expect(readFileSync(page('.gitignore'), 'utf8')).not.toContain(`/es${ROUTE}`);
});

test('a page that a person wrote is never replaced or deleted', () => {
  addText(`en${ROUTE}.mdx`);
  mkdirSync(page('features'), {recursive: true});
  // The MDX page that the text was moved from.
  writeFileSync(page('features/collaborators.mdx'), '# Old\n');
  writeFileSync(page('features/index.tsx'), 'export default 1;\n');

  expect(() => writeContentPages(root)).toThrow(
    'src/pages/features/collaborators.mdx has the address of',
  );
  expect(existsSync(page('features/collaborators.tsx'))).toBe(false);

  rmSync(page('features/collaborators.mdx'));
  writeContentPages(root);
  expect(readFileSync(page('features/index.tsx'), 'utf8')).toBe(
    'export default 1;\n',
  );
});

test('a translation needs its English text and its route in TRANSLATED_ROUTES', () => {
  addText(`es-419${ROUTE}.mdx`);
  addText(`en${ENGLISH_ONLY}.mdx`);
  addText(`es-419${ENGLISH_ONLY}.mdx`);

  let message = '';
  try {
    writeContentPages(root);
  } catch (error) {
    message = (error as Error).message;
  }
  expect(message.split('\n')).toEqual([
    expect.stringContaining(`content/es-419${ROUTE}.mdx has no English text`),
    expect.stringContaining(`add '${ENGLISH_ONLY}' to TRANSLATED_ROUTES.es`),
  ]);
  // It stopped before it wrote anything.
  expect(existsSync(page(`features/not-translated.tsx`))).toBe(false);
});
