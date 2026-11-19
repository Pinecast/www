// The languages of the site, and the address of each page in each of them.
//
// This is a plain module (.mjs), so that the build (scripts/sitemap.mjs, which
// runs in Node after `next build`) and the pages (head tags, the language
// switcher) work out an address in one place.
//
// The site is a static export, so Next.js's own `i18n` routing is not used.
// The default language is not prefixed (`/features`, never `/en/features`). Any
// other language is under its code, and all of it is in one folder of the
// export: `out/es/features.html` is `/es/features`, and its home page is
// `out/es/index.html`, served at `/es/` (the home page of the default language
// is `/`, so the two have the same shape). Next.js exports `pages/es/index.tsx`
// as `out/es.html`, as it does `features/index.tsx` as `out/features.html`, so
// the build that adds a language moves that file after `next build`.
// Nothing redirects between languages: the address says the language, and the
// reader picks it.
//
// To add a language:
// 1. Add its code to LOCALES. Use the short code, `es`, not `es-419`: it is
//    the folder in the address and the `hreflang` value. If Lingo.dev
//    translates it under another code, add that to LANGUAGE_TAGS.
// 2. Add its pages under `src/pages/<code>/`, with the same names as the
//    English ones (`src/pages/es/index.tsx` is the pattern). The page of a
//    text in `content/<tag>/` is written by the build
//    (scripts/content-pages.mjs). The build (scripts/finish-export.mjs) moves
//    the home page to
//    `out/<code>/index.html`, and the sitemap stops the build if a page is
//    somewhere else. A page with no copy there, such as a legal page, stays
//    English only: the sitemap lists what the export holds and nothing else,
//    and lists a page's alternates only for the languages that have it.
// 3. Add its name, in itself, to LANGUAGE_NAMES, and its pages to
//    TRANSLATED_ROUTES, for the language links in the footer and for the
//    links of its pages (src/components/SiteLink.tsx).
//    tests/locale-pages.spec.ts fails if TRANSLATED_ROUTES is not what the
//    export holds.
// `out/sitemap.xml` then has the new pages, and each page lists all of its
// languages. `npm test` checks the result.

/** The origin of the published site, with no trailing slash. */
export const SITE_ORIGIN = 'https://www.pinecast.com';

/**
 * The default language comes first. It has no prefix in an address, and it is
 * the `x-default` of every page.
 *
 * @type {ReadonlyArray<string>}
 */
export const LOCALES = ['en', 'es'];

export const DEFAULT_LOCALE = LOCALES[0];

/**
 * The language of the text of a language's pages, where it is not the code in
 * the address. Lingo.dev translates Spanish as `es-419`, as it does for
 * pinecast-ts, so that the engine's rules for it apply to both. That code
 * names the catalog (`lang/es-419.json`), and it is the `lang` of the page and
 * the locale of react-intl (plurals, numbers). The address and `hreflang` keep
 * the short code: the site has one Spanish, for every reader of Spanish.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const LANGUAGE_TAGS = {es: 'es-419'};

/**
 * The name of each language in that language, for the language links in the
 * footer. It is not translated: a reader looks for the name of their own
 * language.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const LANGUAGE_NAMES = {en: 'English', es: 'Español'};

/**
 * The routes of the pages that each language other than the default has. Every
 * page is in the default language. A language link goes to the same page in
 * that language where there is one, and to that language's home page where
 * there is not. Any other link of a page goes to the version in the page's
 * language where there is one (`linkTarget`).
 *
 * @type {Readonly<Record<string, ReadonlyArray<string>>>}
 */
export const TRANSLATED_ROUTES = {
  es: [
    '/',
    '/features',
    '/features/accessibility',
    '/features/analytics',
    '/features/clip-insertion',
    '/features/collaborators',
    '/features/distribution',
    '/features/email-privacy',
    '/features/embeddable-players',
    '/features/feedback',
    '/features/icebox',
    '/features/monetization',
    '/features/podcast-chapters',
    '/features/review-monitoring',
    '/features/short-links',
    '/features/transcripts',
    '/learn',
    '/learn/corporate-podcasting',
    '/learn/create-a-podcast',
    '/learn/import-a-podcast',
    '/learn/monetize-your-podcast',
    '/learn/podcasting-for-beginners',
    '/learn/podcasting-for-power-users',
    '/learn/podcasting-glossary',
    '/learn/promoting-your-podcast',
    '/learn/understand-your-growth',
    '/testimonial-transcripts',
  ],
};

/**
 * Whether a page is in a language.
 *
 * @param {string} route
 * @param {string} locale
 */
export function hasPage(route, locale) {
  return (
    locale === DEFAULT_LOCALE ||
    (TRANSLATED_ROUTES[locale] ?? []).includes(route)
  );
}

/**
 * The language tag of the text of a language's pages (see LANGUAGE_TAGS).
 *
 * @param {string} locale
 */
export function languageTag(locale) {
  return LANGUAGE_TAGS[locale] ?? locale;
}

/**
 * The path of a page in a language. A page is named by its route, the path of
 * its default-language version: `/` and `/features/analytics`. The site has no
 * trailing slashes, except the home page of each language: `/` and `/es/`.
 * (The server sends `/features/` to `/features`, and `/es` to `/es/`.)
 *
 * @param {string} route
 * @param {string} locale
 */
export function localePath(route, locale) {
  if (locale === DEFAULT_LOCALE) return route;
  return route === '/' ? `/${locale}/` : `/${locale}${route}`;
}

/**
 * Where a link of the site goes from a page in `pageLocale`, and the language
 * of the page it reaches. A link names a page by its route, maybe with a query
 * or a fragment (`/features`, `/#pricing`). From a page in a language other
 * than the default, it goes to that language's version of the page where there
 * is one (`/es/features`), and otherwise to the default-language page, which
 * `hrefLang` then names. An address that is already in a language (`/es/`), or
 * that is not a path of the site, stays as it is.
 *
 * @param {string} href
 * @param {string} pageLocale
 * @returns {{href: string, hrefLang?: string}}
 */
export function linkTarget(href, pageLocale) {
  if (
    pageLocale === DEFAULT_LOCALE ||
    !href.startsWith('/') ||
    href.startsWith('//')
  ) {
    return {href};
  }
  const end = href.search(/[?#]/);
  const route = end === -1 ? href : href.slice(0, end);
  const rest = end === -1 ? '' : href.slice(end);
  if (splitLocale(route).locale !== DEFAULT_LOCALE) {
    return {href};
  }
  if (hasPage(route, pageLocale)) {
    return {href: localePath(route, pageLocale) + rest};
  }
  return {href, hrefLang: DEFAULT_LOCALE};
}

/**
 * The absolute address of a page in a language.
 *
 * @param {string} route
 * @param {string} locale
 */
export function pageUrl(route, locale) {
  return SITE_ORIGIN + localePath(route, locale);
}

/**
 * The inverse of `localePath`: which language a path is in, and the route of
 * the page.
 *
 * @param {string} path
 * @param {ReadonlyArray<string>} [locales]
 * @returns {{locale: string, route: string}}
 */
export function splitLocale(path, locales = LOCALES) {
  for (const locale of locales) {
    if (locale === DEFAULT_LOCALE) continue;
    // `/es` is not an address of the site (the server sends it to `/es/`), but
    // is the way to say the home page of a language.
    if (path === `/${locale}` || path === `/${locale}/`) {
      return {locale, route: '/'};
    }
    if (path.startsWith(`/${locale}/`)) {
      return {locale, route: path.slice(locale.length + 1)};
    }
  }
  return {locale: DEFAULT_LOCALE, route: path};
}

/**
 * The alternate versions of a page, as `hreflang` lists them: one for each
 * language that the page exists in, in the order of LOCALES, then `x-default`
 * (the default-language page, the one for a reader whose language the site
 * does not have). A page lists itself too, as Google requires. A page that
 * exists in fewer languages lists only those.
 *
 * @param {string} route
 * @param {ReadonlyArray<string>} existsIn The languages that have the page.
 * @param {ReadonlyArray<string>} [locales]
 * @returns {Array<{hreflang: string, href: string}>}
 */
export function alternates(route, existsIn, locales = LOCALES) {
  const links = locales
    .filter(locale => existsIn.includes(locale))
    .map(locale => ({hreflang: locale, href: pageUrl(route, locale)}));
  if (existsIn.includes(DEFAULT_LOCALE)) {
    links.push({
      hreflang: 'x-default',
      href: pageUrl(route, DEFAULT_LOCALE),
    });
  }
  return links;
}
