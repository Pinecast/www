import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import type {GetStaticProps} from 'next';

import {DEFAULT_LOCALE, type LocaleProps, type MessageCatalogs} from './i18n';
import {ENGLISH_ONLY_MESSAGES} from './englishOnlyMessages';
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
): GetStaticProps<
  Required<Pick<LocaleProps, 'locale' | 'messages' | 'suggestions'>>
> {
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

// The `getStaticProps` of a policy page, which stays in English (privacy,
// terms, subprocessors, AI use): the messages of the English-only notice in
// each other language of the site.
export const englishOnlyStaticProps: GetStaticProps<
  Pick<LocaleProps, 'englishOnly'>
> = async () => ({
  props: {
    englishOnly: catalogsOf(
      LOCALES.filter(locale => locale !== DEFAULT_LOCALE),
      ENGLISH_ONLY_MESSAGES,
    ),
  },
});

// For each language of the page but its own and English, the messages of the
// language suggestion.
function suggestionCatalogs(
  route: string,
  pageLocale: string,
): MessageCatalogs {
  return catalogsOf(
    LOCALES.filter(
      locale =>
        locale !== pageLocale &&
        locale !== DEFAULT_LOCALE &&
        hasPage(route, locale),
    ),
    SUGGESTION_MESSAGES,
  );
}

// The `messages` in each of `locales`, from the compiled catalogs. A language
// whose catalog does not have every one of them yet is left out: English words
// in a box marked as another language would be worse than no box.
function catalogsOf(
  locales: ReadonlyArray<string>,
  messages: Record<string, {id?: string}>,
): MessageCatalogs {
  const ids = Object.values(messages).map(({id}) => {
    if (!id) {
      throw new Error(
        'A message has no id: the formatjs transform (vendor/formatjs-loader.js) did not run on it.',
      );
    }
    return id;
  });
  const catalogs: MessageCatalogs = {};
  for (const locale of locales) {
    const catalog = compiledCatalog(locale);
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
