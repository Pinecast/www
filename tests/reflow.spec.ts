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

// Below 550px the page titles are 46px instead of 54px, so that their words
// fit on their line. A browser without a hyphenation dictionary breaks a word
// that does not fit in the middle, with no hyphen. These four words were wider
// than a 375px screen at 54px. At 46px the first two still are, and the
// others only just fit.
const TOO_LONG_AT_375 = [
  'Collaborators',
  'Monetization',
  'Distribution',
  'Transcripts',
];

test.describe('page titles at 375px', () => {
  test.use({viewport: {width: 375, height: 812}});
  for (const path of exportedPages()) {
    test(`${path} keeps the words of its title whole`, async ({page}) => {
      await load(page, path);
      const split = await splitWords(page.locator('h1'));
      expect(split.filter(word => !TOO_LONG_AT_375.includes(word))).toEqual([]);
    });
  }

  test('the smaller size stops at 550px', async ({page}) => {
    const title = page.locator('h1');
    await load(page, '/learn/podcasting-for-beginners');
    await expect(title).toHaveCSS('font-size', '46px');
    await page.setViewportSize({width: 550, height: 812});
    await expect(title).toHaveCSS('font-size', '54px');
  });
});

// From 1281px to 1599px the page titles are 144px instead of 160px, for the
// same reason. At 1440px every word fits.
test.describe('page titles at 1440px', () => {
  test.use({viewport: {width: 1440, height: 900}});
  for (const path of exportedPages()) {
    test(`${path} keeps the words of its title whole`, async ({page}) => {
      await load(page, path);
      expect(await splitWords(page.locator('h1'))).toEqual([]);
    });
  }

  test('the smaller size applies from 1281px to 1599px', async ({page}) => {
    const title = page.locator('h1');
    await load(page, '/features/collaborators');
    await expect(title).toHaveCSS('font-size', '144px');
    for (const [width, size] of [
      [1280, '112px'],
      [1281, '144px'],
      [1599, '144px'],
      [1600, '160px'],
    ] as const) {
      await page.setViewportSize({width, height: 900});
      await expect(title).toHaveCSS('font-size', size);
    }
  });
});
