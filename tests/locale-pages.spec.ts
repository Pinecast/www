import {existsSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';

import {
  DEFAULT_LOCALE,
  LANGUAGE_NAMES,
  LOCALES,
  TRANSLATED_ROUTES,
  hasPage,
  languageTag,
  localePath,
  splitLocale,
} from '../src/locales.mjs';
import {exportedPages, isTranslatedMessage, load} from './helpers';

// The pages of a language other than English (src/locales.mjs). Run
// `npm run build` first. The sitemap of these pages is in sitemap.spec.ts.
//
// These tests know no copy (CLAUDE.md, "Tests do not check copy"): they find
// elements by their role and attributes, and check that a text is a translated
// message of the catalog, whatever its words.

// The address that a <Link> writes for a page: it drops the slash of `/es/`,
// and the server sends `/es` back to `/es/` (README.md, "Sitemap, robots.txt
// and languages").
const linkHref = (route: string, locale: string) =>
  localePath(route, locale).replace(/(.)\/$/, '$1');

// An English page that is in no other language.
const englishOnlyPage = () => {
  const page = exportedPages().find(
    path =>
      splitLocale(path).locale === DEFAULT_LOCALE &&
      LOCALES.every(
        locale => locale === DEFAULT_LOCALE || !hasPage(path, locale),
      ),
  );
  if (!page) throw new Error('The export has no page that is only in English');
  return page;
};

test.beforeEach(async ({page}) => {
  await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
});

test('the Spanish home page is the index of its folder', () => {
  // scripts/finish-export.mjs moves it: at out/es.html it would be /es.
  expect(existsSync('out/es/index.html')).toBe(true);
  expect(existsSync('out/es.html')).toBe(false);
});

test.describe('the home page in Spanish', () => {
  test('says its language, and shows the Spanish catalog', async ({page}) => {
    await load(page, '/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-419');
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(isTranslatedMessage(description ?? '', 'es-419')).toBe(true);
    const footer = await page
      .getByRole('contentinfo')
      .getByRole('navigation')
      .getAttribute('aria-label');
    expect(isTranslatedMessage(footer ?? '', 'es-419')).toBe(true);
  });

  test('its links to the home page go to the Spanish one', async ({page}) => {
    await load(page, '/es/');
    // The logo among them. Only the footer's English link goes to `/`.
    const toHome = await page
      .locator('a[href="/"], a[href="/es"]')
      .evaluateAll(links =>
        links.map(link => ({
          href: link.getAttribute('href'),
          hreflang: link.getAttribute('hreflang'),
        })),
      );
    expect(toHome.some(({href}) => href === linkHref('/', 'es'))).toBe(true);
    for (const {href, hreflang} of toHome) {
      if (href === '/') expect(hreflang).toBe(DEFAULT_LOCALE);
    }
  });

  test('marks the English quotes of customers as English', async ({page}) => {
    await load(page, '/es/');
    // The visible quote of each player and the one for screen readers.
    const quotes = page.locator('blockquote [lang="en"], p [lang="en"]');
    expect(await quotes.count()).toBeGreaterThanOrEqual(2);
  });

  test('preloads the stills of the hero, as the English one does', async ({
    page,
  }) => {
    const preloads = (path: string) =>
      page
        .goto(path)
        .then(() =>
          page
            .locator('link[rel="preload"][as="image"]')
            .evaluateAll(links => links.map(link => link.getAttribute('href'))),
        );
    const english = await preloads('/');
    expect(english.length).toBeGreaterThan(0);
    expect(await preloads('/es/')).toEqual(english);
  });
});

test('a client-side visit from /es/ to an English page says English', async ({
  page,
}) => {
  await load(page, '/es/');
  // A <Link> in the footer to a page that is only in English: Next.js swaps
  // the page in place.
  const footerLinks = page.getByRole('contentinfo').locator('a[href^="/"]');
  const hrefs = await footerLinks.evaluateAll(links =>
    links.map(link => link.getAttribute('href') ?? ''),
  );
  const target = hrefs.find(
    href =>
      splitLocale(href).locale === DEFAULT_LOCALE &&
      LOCALES.every(
        locale => locale === DEFAULT_LOCALE || !hasPage(href, locale),
      ),
  );
  expect(target, 'the footer links to a page only in English').toBeTruthy();
  await page
    .getByRole('contentinfo')
    .locator(`a[href="${target}"]`)
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the English home page stays English', async ({page}) => {
  await load(page, '/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  // Only the language links go to another language's home page.
  const toSpanish = await page
    .locator(`a[href="${linkHref('/', 'es')}"]`)
    .evaluateAll(links => links.map(link => link.getAttribute('hreflang')));
  for (const hreflang of toSpanish) expect(hreflang).toBe('es');
});

// The Language column of the footer (Footer.tsx): each language by its own
// name, marked as that language, to this page in it or to its home page.
test.describe('the language links in the footer', () => {
  // The links that say the language of their page.
  const languageLinks = (page: Page) =>
    page.getByRole('contentinfo').locator('a[hreflang]');

  async function checkLinks(page: Page, path: string) {
    const {locale, route} = splitLocale(path);
    await load(page, path);
    const links = languageLinks(page);
    await expect(links).toHaveCount(LOCALES.length);
    for (const [index, language] of LOCALES.entries()) {
      const link = links.nth(index);
      await expect(link).toHaveAttribute('hreflang', language);
      await expect(link).toHaveAttribute('lang', languageTag(language));
      await expect(link).toHaveText(LANGUAGE_NAMES[language]);
      await expect(link).toHaveAttribute(
        'href',
        linkHref(
          language === locale || hasPage(route, language) ? route : '/',
          language,
        ),
      );
      if (language === locale) {
        await expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        await expect(link).not.toHaveAttribute('aria-current');
      }
    }
  }

  test('on the English home page', ({page}) => checkLinks(page, '/'));

  test('on the Spanish home page', ({page}) => checkLinks(page, '/es/'));

  test('on a page that is only in English, they open the home pages', ({
    page,
  }) => checkLinks(page, englishOnlyPage()));
});

test('TRANSLATED_ROUTES lists the pages that the export has in each language', () => {
  const inExport: Record<string, Array<string>> = {};
  for (const path of exportedPages()) {
    const {locale, route} = splitLocale(path);
    if (locale !== DEFAULT_LOCALE) (inExport[locale] ??= []).push(route);
  }
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    expect([...(TRANSLATED_ROUTES[locale] ?? [])].sort()).toEqual(
      (inExport[locale] ?? []).sort(),
    );
  }
});
