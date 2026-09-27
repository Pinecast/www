import {expect, test} from '@playwright/test';
import {
  clippedText,
  exportedPages,
  hasSidewaysScroll,
  load,
  splitWords,
} from './helpers';

// WCAG 1.4.10: at 320 CSS pixels wide (and at 400% zoom, 320 by 256), no page
// scrolls sideways. With the text spacing of 1.4.12 it must not either.
// Long words in large headings and a URL in a definition list did.
const CASES = [
  {name: '320px', viewport: {width: 320, height: 800}, spacing: false},
  {name: '400% zoom', viewport: {width: 320, height: 256}, spacing: false},
  {
    name: '320px, text spacing',
    viewport: {width: 320, height: 800},
    spacing: true,
  },
];

for (const {name, viewport, spacing} of CASES) {
  test.describe(`reflow at ${name}`, () => {
    test.use({viewport});
    for (const path of exportedPages()) {
      test(`${path} does not scroll sideways`, async ({page}) => {
        await load(page, path, {spacing});
        expect(await hasSidewaysScroll(page)).toBe(false);
      });
    }
  });
}

// At 320px the two buttons of a pricing ticket made the ticket wider than the
// screen, and the ticket cut off its right side.
test.describe('pricing at 320px', () => {
  test.use({viewport: {width: 320, height: 800}});

  test('the tickets show all their text', async ({page}) => {
    await load(page, '/');
    const pricing = page.locator('section', {
      has: page.getByRole('heading', {name: 'Grab your ticket'}),
    });
    expect(await clippedText(pricing)).toEqual([]);
  });
});

// A display heading whose widest word is wider than its line breaks the word
// in the middle. Chrome and Firefox do not hyphenate English words that start
// with a capital letter, so no hyphen shows either. The titles are smaller
// where their widest word would not fit (src/fitText.ts). These widths include
// common phones and each side of the breakpoints.
const TITLE_WIDTHS = [
  320, 340, 360, 375, 390, 412, 430, 480, 540, 600, 700, 701, 768, 1024, 1180,
  1181, 1280, 1281, 1366, 1440, 1536, 1600, 1920,
];

test.describe('headings at all widths', () => {
  for (const path of exportedPages()) {
    test(`${path} keeps the words of its headings whole`, async ({page}) => {
      // The animations of the home page make each resize slow.
      test.slow(path === '/');
      await load(page, path);
      // Visible headings only: a hidden one has no lines.
      const headings = page
        .getByRole('main')
        .locator('h1, h2, h3')
        .filter({visible: true});
      const split: Array<string> = [];
      for (const width of TITLE_WIDTHS) {
        await page.setViewportSize({width, height: 800});
        for (const word of await splitWords(headings)) {
          split.push(`${width}px: ${word}`);
        }
      }
      expect(split).toEqual([]);
    });
  }
});

test.describe('title sizes', () => {
  test('a page title that fits keeps its size', async ({page}) => {
    const title = page.locator('h1');
    await load(page, '/features/icebox');
    for (const [width, size] of [
      [320, '54px'],
      [1280, '112px'],
      [1366, '160px'],
    ] as const) {
      await page.setViewportSize({width, height: 800});
      await expect(title).toHaveCSS('font-size', size);
    }
  });

  test('a page title with a long word is smaller only where the word does not fit', async ({
    page,
  }) => {
    const title = page.locator('h1');
    await load(page, '/features/collaborators');
    for (const [width, fits] of [
      [375, false],
      [600, true],
      [1366, false],
      [1920, true],
    ] as const) {
      await page.setViewportSize({width, height: 800});
      const size = parseFloat(
        await title.evaluate(element => getComputedStyle(element).fontSize),
      );
      const nominal = width > 1280 ? 160 : 54;
      if (fits) {
        expect(size).toBe(nominal);
      } else {
        expect(size).toBeLessThan(nominal);
      }
    }
  });

  test('a section title with a long word is smaller where it does not fit', async ({
    page,
  }) => {
    const title = page.getByRole('heading', {name: 'Thoughtfully designed'});
    await load(page, '/features/feedback');
    await page.setViewportSize({width: 320, height: 800});
    const size = await title.evaluate(element =>
      parseFloat(getComputedStyle(element).fontSize),
    );
    expect(size).toBeLessThan(48);
    await page.setViewportSize({width: 480, height: 800});
    await expect(title).toHaveCSS('font-size', '48px');
    await page.setViewportSize({width: 1440, height: 800});
    await expect(title).toHaveCSS('font-size', '80px');
  });
});
