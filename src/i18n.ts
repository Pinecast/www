import {useRouter} from 'next/router';
import * as React from 'react';
import type {IntlConfig} from 'react-intl';

import {languageTag, splitLocale} from './locales.mjs';

// The language of the text in the source: each `defaultMessage` is English.
export const DEFAULT_LOCALE = 'en';

// The page props that pick the language of a page. `_app.tsx` gives them to
// the IntlProvider, and `_document.tsx` sets `<html lang>` from `locale`.
//
// A page in English passes neither: the messages are the `defaultMessage`s in
// the bundle. A page in another language passes its `locale`, the code in its
// address (`es`), and the catalog of that locale only, from `getStaticProps`
// (`localeStaticProps` in src/i18n-static.ts).
//
// A page that is in more than one language also passes `suggestions`: for each
// of its other languages but English, the messages of the language suggestion
// in that language (src/components/LanguageSuggestion.tsx). English needs none:
// its messages are the `defaultMessage`s.
export type LocaleProps = {
  locale?: string;
  messages?: IntlConfig['messages'];
  suggestions?: SuggestionCatalogs;
};

export type SuggestionCatalogs = Record<string, IntlConfig['messages']>;

// The `suggestions` of the page's props, which `_app.tsx` provides.
export const SuggestionCatalogsContext = React.createContext<
  SuggestionCatalogs | undefined
>(undefined);

// The code of the page's language in its address: `en`, `es`.
export function localeOf(pageProps: LocaleProps | undefined): string {
  return pageProps?.locale ?? DEFAULT_LOCALE;
}

// The language of the page's text, for `<html lang>` and react-intl: `es-419`
// for `es` (LANGUAGE_TAGS in src/locales.mjs).
export function languageTagOf(pageProps: LocaleProps | undefined): string {
  return languageTag(localeOf(pageProps));
}

// The code of the current page's language, from its route: `es` on the pages
// in src/pages/es/. For a link to the same page in that language
// (`localePath` in src/locales.mjs).
export function usePageLocale(): string {
  return usePageRoute().locale;
}

// The current page's language and its route, the name of the page in every
// language (`splitLocale` in src/locales.mjs): `{locale: 'es', route: '/'}` on
// the Spanish home page.
export function usePageRoute(): {locale: string; route: string} {
  return splitLocale(useRouter().pathname);
}
