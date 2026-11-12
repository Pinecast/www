import type {IntlConfig} from 'react-intl';

// The language of the text in the source: each `defaultMessage` is English.
export const DEFAULT_LOCALE = 'en';

// The page props that pick the language of a page. `_app.tsx` gives them to
// the IntlProvider, and `_document.tsx` sets `<html lang>` from `locale`.
//
// A page in English passes neither: the messages are the `defaultMessage`s in
// the bundle. A page in another language passes its `locale` and the catalog
// of that locale only (from `getStaticProps`, so it is in the page's own
// data, not in the shared bundle). The catalog must be compiled with
// `formatjs compile --ast`: the bundle has no ICU parser (see
// formatjs.options.js).
export type LocaleProps = {
  locale?: string;
  messages?: IntlConfig['messages'];
};

export function localeOf(pageProps: LocaleProps | undefined): string {
  return pageProps?.locale ?? DEFAULT_LOCALE;
}
