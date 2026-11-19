import {existsSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';

import {
  DEFAULT_LOCALE,
  LANGUAGE_NAMES,
  LOCALES,
  TRANSLATED_ROUTES,
  hasPage,
  languageTag,
  linkTarget,
  localePath,
  splitLocale,
} from '../src/locales.mjs';
import {exportedPages, isMessageOf, isTranslatedMessage, load} from './helpers';

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

// The languages of the site other than English.
const OTHER_LOCALES = LOCALES.filter(locale => locale !== DEFAULT_LOCALE);

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

for (const locale of OTHER_LOCALES) {
  const home = localePath('/', locale);
  const tag = languageTag(locale);

  test(`the home page of "${locale}" is the index of its folder`, () => {
    // scripts/finish-export.mjs moves it: at out/es.html it would be /es.
    expect(existsSync(`out/${locale}/index.html`)).toBe(true);
    expect(existsSync(`out/${locale}.html`)).toBe(false);
  });

  test.describe(`the home page in "${locale}"`, () => {
    test('says its language, and shows its catalog', async ({page}) => {
      await load(page, home);
      await expect(page.locator('html')).toHaveAttribute('lang', tag);
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(isTranslatedMessage(description ?? '', tag)).toBe(true);
      // The name of the footer's links comes from the page's catalog too.
      // It can be the English word (German says "Footer"), so the
      // description above is what shows that the page is translated.
      const footer = await page
        .getByRole('contentinfo')
        .getByRole('navigation')
        .getAttribute('aria-label');
      expect(isMessageOf(footer ?? '', tag)).toBe(true);
    });

    test('its links to the home page go to its own', async ({page}) => {
      await load(page, home);
      // The logo among them. Only the footer's English link goes to `/`.
      const toHome = await page
        .locator(`a[href="/"], a[href="${linkHref('/', locale)}"]`)
        .evaluateAll(links =>
          links.map(link => ({
            href: link.getAttribute('href'),
            hreflang: link.getAttribute('hreflang'),
          })),
        );
      expect(toHome.some(({href}) => href === linkHref('/', locale))).toBe(
        true,
      );
      for (const {href, hreflang} of toHome) {
        if (href === '/') expect(hreflang).toBe(DEFAULT_LOCALE);
      }
    });

    test('marks the English quotes of customers as English', async ({page}) => {
      await load(page, home);
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
              .evaluateAll(links =>
                links.map(link => link.getAttribute('href')),
              ),
          );
      const english = await preloads('/');
      expect(english.length).toBeGreaterThan(0);
      expect(await preloads(home)).toEqual(english);
    });
  });
}

// The pages of the export in a language other than English.
const translatedPages = () =>
  exportedPages().filter(path => splitLocale(path).locale !== DEFAULT_LOCALE);

test('there are pages in other languages than English', () => {
  expect(translatedPages().length).toBeGreaterThan(1);
});

for (const path of translatedPages()) {
  test.describe(`${path}, a page in another language`, () => {
    const {locale, route} = splitLocale(path);
    const tag = languageTag(locale);

    test('says its language, and describes itself in it', async ({page}) => {
      const description = () =>
        page.locator('meta[name="description"]').getAttribute('content');
      await load(page, localePath(route, DEFAULT_LOCALE));
      const english = await description();
      await load(page, path);
      await expect(page.locator('html')).toHaveAttribute('lang', tag);
      const translated = (await description()) ?? '';
      expect(translated).not.toBe('');
      // A description from the catalog is one of its translated messages.
      // One from a text that Lingo.dev translates as a file (content/) is
      // not, but it is not the English one either.
      expect(
        isTranslatedMessage(translated, tag) || translated !== english,
        `the description "${translated}" is translated`,
      ).toBe(true);
    });

    // src/components/SiteLink.tsx. A link in another language than the page's
    // (the language links of the footer, the language suggestion) goes to
    // the language that it is in.
    test('its links stay in its language where the page they reach is in it', async ({
      page,
    }) => {
      await load(page, path);
      const links = await page.locator('a[href^="/"]').evaluateAll(anchors =>
        anchors
          .filter(
            anchor =>
              anchor.closest('[lang]')?.getAttribute('lang') ===
              document.documentElement.lang,
          )
          .map(anchor => ({
            href: anchor.getAttribute('href') ?? '',
            hreflang: anchor.getAttribute('hreflang'),
          })),
      );
      expect(links.length).toBeGreaterThan(0);
      for (const {href, hreflang} of links) {
        const target = splitLocale(href.replace(/[?#].*$/, '') || '/');
        if (target.locale === locale) continue;
        expect(target.locale, href).toBe(DEFAULT_LOCALE);
        expect(
          hasPage(target.route, locale),
          `${href} goes to English, but the page is in this language`,
        ).toBe(false);
        expect(hreflang, `${href} says that it goes to English`).toBe(
          DEFAULT_LOCALE,
        );
      }
    });
  });
}

test('a link keeps its query and fragment in another language', () => {
  const [translated] = TRANSLATED_ROUTES.es;
  expect(linkTarget(`${translated}?a=1#b`, 'es')).toEqual({
    href: `${localePath(translated, 'es')}?a=1#b`,
  });
  const englishOnly = englishOnlyPage();
  expect(linkTarget(`${englishOnly}#b`, 'es')).toEqual({
    href: `${englishOnly}#b`,
    hrefLang: DEFAULT_LOCALE,
  });
  // On an English page, and for an address in a language, nothing changes.
  expect(linkTarget(translated, DEFAULT_LOCALE)).toEqual({href: translated});
  const spanish = localePath(translated, 'es');
  expect(linkTarget(spanish, 'es')).toEqual({href: spanish});
});

for (const locale of OTHER_LOCALES) {
  test(`the testimonial transcripts in "${locale}" are marked as English`, async ({
    page,
  }) => {
    // The page's own copy is in messages. The transcripts are what the
    // customers say in their recordings, in English.
    await load(page, localePath('/testimonial-transcripts', locale));
    const paragraphs = await page
      .getByRole('main')
      .locator('p')
      .evaluateAll(elements =>
        elements.map(element => ({
          text: (element as HTMLElement).innerText,
          lang: element.closest('[lang]')?.getAttribute('lang'),
        })),
      );
    expect(paragraphs.some(({lang}) => lang === DEFAULT_LOCALE)).toBe(true);
    for (const {text, lang} of paragraphs) {
      if (lang === DEFAULT_LOCALE) continue;
      expect(
        isTranslatedMessage(text, languageTag(locale)),
        `"${text.slice(0, 60)}" is a translated message, or marked as English`,
      ).toBe(true);
    }
  });
}

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
  for (const locale of OTHER_LOCALES) {
    const toHome = await page
      .locator(`a[href="${linkHref('/', locale)}"]`)
      .evaluateAll(links => links.map(link => link.getAttribute('hreflang')));
    for (const hreflang of toHome) expect(hreflang).toBe(locale);
  }
});

// The Language column of the footer (Footer.tsx): each language by its own
// name, marked as that language, to this page in it or to its home page.
test.describe('the language links in the footer', () => {
  // The links that say the language of their page.
  const languageLinks = (page: Page) =>
    page.getByRole('contentinfo').locator('a[hreflang][lang]');

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

  for (const locale of OTHER_LOCALES) {
    test(`on the home page in "${locale}"`, ({page}) =>
      checkLinks(page, localePath('/', locale)));
  }

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
