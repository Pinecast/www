// The languages of the site, and the address of each page in each of them.
//
// This is a plain module (.mjs), so that the build (scripts/sitemap.mjs, which
// runs in Node after `next build`) and the pages (head tags, the language
// switcher) work out an address in one place.
//
// The site is a static export, so Next.js's own `i18n` routing is not used.
// The default language is not prefixed (`/features`, never `/en/features`). Any
// other language is under its code (`/es/features`), so the export must hold
// its pages in `out/es/`, and its home page as `out/es.html`. Nothing redirects
// between languages: the address says the language, and the reader picks it.
//
// To add a language, the sitemap needs two things:
// 1. Add its code to LOCALES. Use the short code, `es`, not `es-419`: it is
//    the folder in the address and the `hreflang` value.
// 2. Build the pages of that language into `out/<code>/`, with the same names
//    as the English ones. A page with no copy there, such as a legal page,
//    stays English only: the sitemap lists what the export holds and nothing
//    else, and lists a page's alternates only for the languages that have it.
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
export const LOCALES = ['en'];

export const DEFAULT_LOCALE = LOCALES[0];

/**
 * The path of a page in a language. A page is named by its route, the path of
 * its default-language version: `/` and `/features/analytics`. The route `/`
 * of another language is `/es`, as the export has it (`out/es.html`): the site
 * has no trailing slashes, except the one of the home page.
 *
 * @param {string} route
 * @param {string} locale
 */
export function localePath(route, locale) {
  if (locale === DEFAULT_LOCALE) return route;
  return route === '/' ? `/${locale}` : `/${locale}${route}`;
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
    if (path === `/${locale}`) return {locale, route: '/'};
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
