import {expect, test} from '@playwright/test';
import {clippedText, exportedPages, hasSidewaysScroll, load} from './helpers';

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
