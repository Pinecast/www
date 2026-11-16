import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import type {GetStaticProps} from 'next';

import type {LocaleProps} from './i18n';
import {languageTag} from './locales.mjs';

// The `getStaticProps` of a page in a language other than English: the page
// props of src/i18n.ts, with the catalog of that language only. It runs in
// Node at build time, so the catalog goes into the page's own data, not into
// the shared bundle.
//
// It reads the catalog that `npm run i18n:compile` wrote
// (scripts/compile-messages.mjs), which `npm run build` and `npm run dev` run
// first.
export function localeStaticProps(
  locale: string,
): GetStaticProps<Required<LocaleProps>> {
  return async () => {
    const file = join(
      process.cwd(),
      '.compiled-lang',
      `${languageTag(locale)}.json`,
    );
    const messages = JSON.parse(readFileSync(file, 'utf8'));
    return {props: {locale, messages}};
  };
}
