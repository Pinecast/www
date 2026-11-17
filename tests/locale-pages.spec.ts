import {existsSync, readFileSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';

import {
  DEFAULT_LOCALE,
  LOCALES,
  TRANSLATED_ROUTES,
  splitLocale,
} from '../src/locales.mjs';
import {exportedPages, load} from './helpers';

// The pages of a language other than English (src/locales.mjs). Run
// `npm run build` first. The sitemap of these pages is in sitemap.spec.ts.

type Catalog = Record<string, {defaultMessage: string}>;
const english: Catalog = JSON.parse(readFileSync('lang/en.json', 'utf8'));
const spanish: Catalog = JSON.parse(readFileSync('lang/es-419.json', 'utf8'));

// The Spanish text of an English message, from Lingo.dev's catalog.
function inSpanish(defaultMessage: string): string {
  const id = Object.keys(english).find(
    key => english[key].defaultMessage === defaultMessage,
  );
  if (!id) throw new Error(`lang/en.json has no "${defaultMessage}"`);
  return spanish[id].defaultMessage;
}

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
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      inSpanish('Kick-ass podcast hosting for the 21st century'),
    );
    const spanishSignUp = inSpanish('Sign up');
    expect(spanishSignUp).not.toBe('Sign up');
    await expect(
      page.getByRole('link', {name: spanishSignUp}).first(),
    ).toBeAttached();
  });

  test('its logo links to the Spanish home page', async ({page}) => {
    await load(page, '/es/');
    // A <Link> drops the slash of `/es/`, and the server sends `/es` back to
    // `/es/` (README.md, "Sitemap, robots.txt and languages").
    await expect(
      page.getByRole('link', {name: inSpanish('Return home')}),
    ).toHaveAttribute('href', '/es');
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
  // A <Link> in the footer to an English page: Next.js swaps the page in place.
  await page
    .getByRole('contentinfo')
    .getByRole('link', {name: inSpanish('Privacy')})
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the English home page stays English', async ({page}) => {
  await load(page, '/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', {name: 'Return home'})).toHaveAttribute(
    'href',
    '/',
  );
});

// The Language column of the footer (Footer.tsx): each language by its own
// name, marked as that language, to this page in it or to its home page.
test.describe('the language links in the footer', () => {
  // The list that has a link named "English": the name is not translated.
  const languageLinks = (page: Page) =>
    page
      .getByRole('contentinfo')
      .getByRole('list')
      .filter({has: page.getByRole('link', {name: 'English', exact: true})})
      .getByRole('link');

  test('on the English home page', async ({page}) => {
    await load(page, '/');
    const links = languageLinks(page);
    await expect(links).toHaveText(['English', 'Español']);
    await expect(links.nth(0)).toHaveAttribute('aria-current', 'page');
    await expect(links.nth(0)).toHaveAttribute('href', '/');
    await expect(links.nth(1)).toHaveAttribute('href', '/es');
    await expect(links.nth(1)).toHaveAttribute('lang', 'es-419');
    await expect(links.nth(1)).toHaveAttribute('hreflang', 'es');
    await expect(links.nth(1)).not.toHaveAttribute('aria-current');
  });

  test('on the Spanish home page', async ({page}) => {
    await load(page, '/es/');
    const links = languageLinks(page);
    await expect(links).toHaveText(['English', 'Español']);
    await expect(links.nth(0)).toHaveAttribute('href', '/');
    await expect(links.nth(0)).toHaveAttribute('lang', 'en');
    await expect(links.nth(1)).toHaveAttribute('aria-current', 'page');
  });

  test('on a page that is only in English, Español opens the Spanish home page', async ({
    page,
  }) => {
    await load(page, '/features/analytics');
    const links = languageLinks(page);
    await expect(links.nth(0)).toHaveAttribute('href', '/features/analytics');
    await expect(links.nth(0)).toHaveAttribute('aria-current', 'page');
    await expect(links.nth(1)).toHaveAttribute('href', '/es');
  });
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
