import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import type {GetStaticProps} from 'next';

import {
  DEFAULT_LOCALE,
  type LocaleProps,
  type SuggestionCatalogs,
} from './i18n';
import {SUGGESTION_MESSAGES} from './languageSuggestionMessages';
import {LOCALES, hasPage, languageTag} from './locales.mjs';

// The `getStaticProps` of a page in a language other than English: the page
// props of src/i18n.ts, with the catalog of that language only. It runs in
// Node at build time, so the catalog goes into the page's own data, not into
// the shared bundle. `route` names the page (src/locales.mjs).
//
// It reads the catalog that `npm run i18n:compile` wrote
// (scripts/compile-messages.mjs), which `npm run build` and `npm run dev` run
// first.
export function localeStaticProps(
  locale: string,
  route: string,
): GetStaticProps<Required<LocaleProps>> {
  return async () => ({
    props: {
      locale,
      messages: compiledCatalog(locale),
      suggestions: suggestionCatalogs(route, locale),
    },
  });
}

// The `getStaticProps` of an English page that is in other languages too: the
// messages of the language suggestion in each of them. The rest of the page
// uses the messages in the bundle.
export function defaultLocaleStaticProps(
  route: string,
): GetStaticProps<Pick<LocaleProps, 'suggestions'>> {
  return async () => ({
    props: {suggestions: suggestionCatalogs(route, DEFAULT_LOCALE)},
  });
}

// For each language of the page but its own and English, the messages of the
// language suggestion, from that language's catalog.
function suggestionCatalogs(
  route: string,
  pageLocale: string,
): SuggestionCatalogs {
  const ids = Object.values(SUGGESTION_MESSAGES).map(({id}) => {
    if (!id) {
      throw new Error(
        'A message of the language suggestion has no id: the formatjs transform (vendor/formatjs-loader.js) did not run on it.',
      );
    }
    return id;
  });
  const catalogs: SuggestionCatalogs = {};
  for (const locale of LOCALES) {
    if (
      locale === pageLocale ||
      locale === DEFAULT_LOCALE ||
      !hasPage(route, locale)
    ) {
      continue;
    }
    const catalog = compiledCatalog(locale);
    // A language whose catalog does not have every message yet gets no card:
    // English words in a card marked as another language would be worse.
    if (ids.every(id => id in catalog)) {
      catalogs[locale] = Object.fromEntries(ids.map(id => [id, catalog[id]]));
    }
  }
  return catalogs;
}

function compiledCatalog(locale: string) {
  const file = join(
    process.cwd(),
    '.compiled-lang',
    `${languageTag(locale)}.json`,
  );
  return JSON.parse(readFileSync(file, 'utf8'));
}
