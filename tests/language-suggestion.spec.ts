import {readFileSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';

import {LOCALES, TRANSLATED_ROUTES, localePath} from '../src/locales.mjs';
import {load} from './helpers';

// The language suggestion (src/components/LanguageSuggestion.tsx): a card at
// the bottom of a page that offers it in the reader's language, written in
// that language. It shows only where the page is in that language, and not
// again once the reader has made a choice.

type Catalog = Record<string, {defaultMessage: string}>;
const english: Catalog = JSON.parse(readFileSync('lang/en.json', 'utf8'));

// The card is the region that says the language of its text.
const card = (page: Page) => page.locator('section[lang][aria-label]');

// The text of an English message in a language, from Lingo.dev's catalog.
function translated(defaultMessage: string, tag: string): string {
  const id = Object.keys(english).find(
    key => english[key].defaultMessage === defaultMessage,
  );
  if (!id) throw new Error(`lang/en.json has no "${defaultMessage}"`);
  const catalog: Catalog = JSON.parse(readFileSync(`lang/${tag}.json`, 'utf8'));
  return catalog[id].defaultMessage;
}

test.beforeEach(async ({page}) => {
  await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
});

test.describe('for a reader whose browser prefers English', () => {
  test.use({locale: 'en-US'});

  test('the Spanish home page offers it in English, in English', async ({
    page,
  }) => {
    await load(page, '/es/');
    await expect(card(page)).toHaveAttribute('lang', 'en');
    await expect(card(page)).toHaveAccessibleName('Language');
    await expect(card(page)).toContainText('This page is in English too.');
    const link = card(page).getByRole('link', {name: 'Read it in English'});
    await expect(link).toHaveAttribute('href', '/');
    await expect(link).toHaveAttribute('hreflang', 'en');
  });

  test('the English home page offers nothing', async ({page}) => {
    await load(page, '/');
    await expect(card(page)).toHaveCount(0);
  });

  test('closing it is for good', async ({page}) => {
    await load(page, '/es/');
    await card(page).getByRole('button', {name: 'Close'}).click();
    await expect(card(page)).toHaveCount(0);
    await load(page, '/es/');
    await expect(card(page)).toHaveCount(0);
  });

  test('a language picked in the footer is a choice too', async ({page}) => {
    await load(page, '/es/');
    await expect(card(page)).toHaveCount(1);
    await page
      .getByRole('contentinfo')
      .getByRole('link', {name: 'Español', exact: true})
      .click();
    await load(page, '/es/');
    await expect(card(page)).toHaveCount(0);
  });

  test('closing it with the keyboard moves focus on, not to the page', async ({
    page,
  }) => {
    await load(page, '/es/');
    const close = card(page).getByRole('button', {name: 'Close'});
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(card(page)).toHaveCount(0);
    const focused = await page.evaluate(
      () => document.activeElement?.tagName ?? null,
    );
    expect(focused).not.toBe('BODY');
    expect(focused).not.toBeNull();
  });

  test('the page keeps a focused element clear of it', async ({page}) => {
    await load(page, '/es/');
    const {room, bottom, height} = await card(page).evaluate(element => {
      const style = getComputedStyle(document.documentElement);
      return {
        room: parseFloat(style.scrollPaddingBottom),
        bottom: parseFloat(getComputedStyle(element).bottom),
        height: element.getBoundingClientRect().height,
      };
    });
    expect(room).toBeGreaterThanOrEqual(bottom + height);
  });

  test('on a phone it is above the mute button', async ({page}) => {
    await page.setViewportSize({width: 375, height: 700});
    await load(page, '/es/');
    // Once it has slid into place.
    await page.waitForFunction(() => {
      const element = document.querySelector('section[lang][aria-label]');
      return (
        element !== null &&
        ['none', '0px', '0px 0px'].includes(getComputedStyle(element).translate)
      );
    });
    const cardBox = (await card(page).boundingBox())!;
    const muteBox = (await page.locator('[data-mute-button]').boundingBox())!;
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(muteBox.y);
    expect(cardBox.x).toBeGreaterThanOrEqual(0);
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(375);
  });
});

// Where the card covers a control, the reader cannot reach or read it. These
// are the cases that the accessibility review found: the end of the page, a
// Tab walk through the page, and windows too short for the card.
const ON_CARD = `(element => {
  const card = document.querySelector('section[lang][aria-label]');
  if (!card || getComputedStyle(card).visibility === 'hidden') return 0;
  const {left, right, top, bottom} = element.getBoundingClientRect();
  const points = [
    [(left + right) / 2, (top + bottom) / 2],
    [left + 1, top + 1],
    [right - 1, top + 1],
    [left + 1, bottom - 1],
    [right - 1, bottom - 1],
  ];
  return points.filter(([x, y]) => {
    const hit = document.elementFromPoint(x, y);
    return hit !== null && card.contains(hit);
  }).length;
})`;

test.describe('the card covers nothing that the reader can reach', () => {
  test.use({locale: 'en-US'});

  for (const viewport of [
    {width: 1280, height: 800},
    {width: 720, height: 800},
    {width: 504, height: 800},
    {width: 375, height: 667},
    {width: 320, height: 568},
  ]) {
    for (const spacing of [false, true]) {
      const name = `${viewport.width}x${viewport.height}${
        spacing ? ' with larger text spacing' : ''
      }`;

      test(`at the end of the page, at ${name}`, async ({page}) => {
        await page.setViewportSize(viewport);
        await load(page, '/es/', {spacing});
        await page.evaluate(() =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'instant',
          }),
        );
        const covered = await page
          .getByRole('contentinfo')
          .getByRole('link')
          .evaluateAll(
            (links, onCard) =>
              links
                .filter(link => (0, eval)(onCard)(link) > 0)
                .map(link => link.textContent),
            ON_CARD,
          );
        expect(covered).toEqual([]);
      });

      test(`for each Tab stop, at ${name}`, async ({page}) => {
        test.slow();
        // Without smooth scrolling, the page is where it scrolls to at the
        // next frame, and the card has checked the focused element by the one
        // after (it checks again while a smooth scroll goes on).
        await page.emulateMedia({reducedMotion: 'reduce'});
        await page.setViewportSize(viewport);
        await load(page, '/es/', {spacing});
        const covered: Array<string> = [];
        for (let stop = 0; stop < 150; stop++) {
          await page.keyboard.press('Tab');
          await page.evaluate(
            () =>
              new Promise<void>(resolve =>
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => resolve()),
                ),
              ),
          );
          const result = await page.evaluate(onCard => {
            const element = document.activeElement as HTMLElement | null;
            if (!element || element === document.body) return null;
            const card = document.querySelector('section[lang][aria-label]');
            if (card?.contains(element)) return '';
            return (0, eval)(onCard)(element) > 0
              ? element.textContent?.trim() || element.tagName
              : '';
          }, ON_CARD);
          if (result === null) break;
          if (result) covered.push(result);
        }
        expect(covered).toEqual([]);
      });
    }
  }

  for (const viewport of [
    {width: 320, height: 256},
    {width: 667, height: 375},
  ]) {
    test(`it hides in a window of ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/es/');
      await expect(card(page)).toBeHidden();
      await expect(page.getByRole('region', {name: 'Language'})).toHaveCount(0);
    });
  }
});

test.describe('with reduced motion', () => {
  test.use({locale: 'en-US'});

  test('it does not slide', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await load(page, '/es/');
    await expect(card(page)).toHaveCSS('transition-duration', '0s');
  });
});

test.describe('for a reader whose browser prefers Spanish', () => {
  test.use({locale: 'es-MX'});

  test('the English home page offers it in Spanish, in Spanish', async ({
    page,
  }) => {
    await load(page, '/');
    await expect(card(page)).toHaveAttribute('lang', 'es-419');
    await expect(card(page)).toContainText(
      translated('This page is in English too.', 'es-419'),
    );
    const link = card(page).getByRole('link', {
      name: translated('Read it in English', 'es-419'),
    });
    await expect(link).toHaveAttribute('href', '/es');
    await expect(link).toHaveAttribute('hreflang', 'es');
  });

  test('a page that is only in English offers nothing', async ({page}) => {
    await load(page, '/features/analytics');
    await expect(card(page)).toHaveCount(0);
  });

  test('following it is a choice: the English page offers it no more', async ({
    page,
  }) => {
    await load(page, '/');
    await card(page).getByRole('link').click();
    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(card(page)).toHaveCount(0);
    await load(page, '/');
    await expect(card(page)).toHaveCount(0);
  });
});

// Each page in TRANSLATED_ROUTES needs, in English, the messages of the card
// in that language (`defaultLocaleStaticProps` in src/i18n-static.ts). Without
// them it shows no card.
for (const locale of LOCALES) {
  for (const route of TRANSLATED_ROUTES[locale] ?? []) {
    test.describe(`a reader of "${locale}"`, () => {
      test.use({locale});
      test(`is offered ${localePath(route, locale)} on ${route}`, async ({
        page,
      }) => {
        await load(page, route);
        await expect(card(page)).toHaveCount(1);
      });
    });
  }
}
