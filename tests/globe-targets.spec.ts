import {expect, test, type Browser, type Page} from '@playwright/test';
import {load} from './helpers';

// WCAG 2.5.8: the feature links on the globe (Distribution, Analytics,
// Monetization) have hit areas of at least 24 by 24 CSS pixels. The text on
// the curve is only about 11 pixels tall on a narrow screen.
const SLUGS = ['distribution', 'analytics', 'monetization'];

// 640 by 400 CSS pixels, each two device pixels wide, is 200% zoom of a
// 1280 by 800 window. 667 by 375 is a phone in landscape.
const VIEWPORTS = [
  {viewport: {width: 320, height: 640}, deviceScaleFactor: 1},
  {viewport: {width: 375, height: 667}, deviceScaleFactor: 1},
  {viewport: {width: 414, height: 896}, deviceScaleFactor: 1},
  {viewport: {width: 640, height: 400}, deviceScaleFactor: 2},
  {viewport: {width: 667, height: 375}, deviceScaleFactor: 2},
  {viewport: {width: 1280, height: 800}, deviceScaleFactor: 1},
];

// Scroll to the Analytics feature, as its link does.
async function showGlobe(page: Page) {
  await load(page, '/');
  await page
    .locator('#analytics')
    .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));
  await expect(
    page.locator('text a[href$="#analytics"][aria-current="true"]'),
  ).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

// The size of the link text in CSS pixels, and for each link the largest
// square of CSS pixels where a pointer hits it.
async function measureLinks(page: Page) {
  return page.evaluate(slugs => {
    const svg = [...document.querySelectorAll('svg')].find(el =>
      el.querySelector('text a[href$="#analytics"]'),
    )!;
    const {a, d} = svg.getScreenCTM()!;
    const textSize =
      parseFloat(getComputedStyle(svg.querySelector('text')!).fontSize) *
      Math.min(a, d);
    // Map what a pointer hits, pixel by pixel, over the menu.
    const r = svg.getBoundingClientRect();
    const x0 = Math.max(0, Math.floor(r.left));
    const y0 = Math.max(0, Math.floor(r.top));
    const width = Math.min(innerWidth, Math.ceil(r.right)) - x0;
    const height = Math.min(innerHeight, Math.ceil(r.bottom)) - y0;
    const squares: Record<string, number> = {};
    for (const slug of slugs) {
      const run = new Uint16Array(width * height);
      let largest = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const hit = document
            .elementFromPoint(x0 + x + 0.5, y0 + y + 0.5)
            ?.closest('a');
          if (!hit?.getAttribute('href')?.endsWith(`#${slug}`)) {
            continue;
          }
          const i = y * width + x;
          run[i] =
            x && y
              ? 1 + Math.min(run[i - 1], run[i - width], run[i - width - 1])
              : 1;
          largest = Math.max(largest, run[i]);
        }
      }
      squares[slug] = largest;
    }
    return {textSize, squares};
  }, SLUGS);
}

for (const {viewport, deviceScaleFactor} of VIEWPORTS) {
  test.describe(`globe links at ${viewport.width}x${viewport.height}`, () => {
    test.use({viewport, deviceScaleFactor});

    test.beforeEach(async ({page}) => {
      await showGlobe(page);
    });

    test('each hit area holds a 24 by 24 square', async ({page}) => {
      const {squares} = await measureLinks(page);
      for (const slug of SLUGS) {
        expect(squares[slug], slug).toBeGreaterThanOrEqual(24);
      }
    });

    test('the links do not cover the text of the feature', async ({page}) => {
      // The globe makes room for the menu. The links stay on the screen,
      // under the header and apart from the description.
      const boxes = await page.evaluate(() => {
        const box = (el: Element) => {
          const {top, bottom, left, right} = el.getBoundingClientRect();
          return {top, bottom, left, right};
        };
        const range = document.createRange();
        range.selectNodeContents(document.querySelector('li[aria-current]')!);
        const {top, bottom, left, right} = range.getBoundingClientRect();
        return {
          header: box(document.querySelector('header')!),
          links: [...document.querySelectorAll('text a')].map(box),
          description: {top, bottom, left, right},
        };
      });
      expect(boxes.links).toHaveLength(3);
      const d = boxes.description;
      for (const link of boxes.links) {
        expect(link.top).toBeGreaterThanOrEqual(boxes.header.bottom);
        expect(link.bottom).toBeLessThanOrEqual(viewport.height);
        const overlaps =
          link.bottom > d.top &&
          link.top < d.bottom &&
          link.right > d.left &&
          link.left < d.right;
        expect(overlaps, JSON.stringify({link, description: d})).toBe(false);
      }
    });

    test('the larger hit areas add no links for assistive technology', async ({
      page,
    }) => {
      const menu = page.locator('svg', {has: page.locator('textPath')}).filter({
        has: page.locator('a[href$="#analytics"]'),
      });
      await expect(menu.getByRole('link')).toHaveText([
        'Distribution',
        'Analytics',
        'Monetization',
      ]);
      for (const hitArea of await menu.locator('[data-hit-area]').all()) {
        await expect(hitArea).toHaveAttribute('aria-hidden', 'true');
        await expect(hitArea).toHaveAttribute('tabindex', '-1');
      }
    });
  });
}

// WCAG 1.4.4: the globe gets its size from the viewport, and zoom makes the
// viewport smaller in CSS pixels. The menu got its size from the globe, so at
// 200% zoom its text was 4.6 CSS pixels instead of 18.4, and its hit areas
// were smaller. They must be at least as large as at 100%.
test('the globe links are as large at 200% zoom', async ({browser}) => {
  const measure = async (
    b: Browser,
    viewport: {width: number; height: number},
    deviceScaleFactor: number,
  ) => {
    const context = await b.newContext({viewport, deviceScaleFactor});
    const page = await context.newPage();
    await showGlobe(page);
    const result = await measureLinks(page);
    await context.close();
    return result;
  };
  const normal = await measure(browser, {width: 1280, height: 800}, 1);
  const zoomed = await measure(browser, {width: 640, height: 400}, 2);
  expect(normal.textSize).toBeGreaterThan(18);
  expect(zoomed.textSize).toBeGreaterThanOrEqual(normal.textSize - 0.01);
  for (const slug of SLUGS) {
    // Whole pixels, at another place on the screen.
    expect(zoomed.squares[slug], slug).toBeGreaterThanOrEqual(
      normal.squares[slug] - 1,
    );
  }
});
