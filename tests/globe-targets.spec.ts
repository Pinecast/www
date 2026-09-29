import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
  chromium,
  expect,
  test,
  type Browser,
  type Page,
} from '@playwright/test';
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

// A link scrolls to its anchor, and the scroll position picks the feature.
// The scroll padding of the page under the header moved each anchor into the
// range of the feature before it.
for (const viewport of [
  {width: 1280, height: 800},
  {width: 375, height: 667},
]) {
  test(`each globe link shows its feature at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    // Without smooth scrolling (reduced motion), each link jumps at once to
    // the same place. A smooth scroll past the moving globe took most of the
    // time of the test.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.setViewportSize(viewport);
    await load(page, '/');
    await page
      .locator('#distribution')
      .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));
    for (const slug of SLUGS) {
      const link = page.locator(`text a[href$="#${slug}"]`);
      await link.focus();
      await page.keyboard.press('Enter');
      await expect(link).toHaveAttribute('aria-current', 'true');
    }
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

// The browser zoom itself, not a smaller viewport: the page can tell the zoom
// in Chrome (outerWidth has no zoom), and then the menu is at least as large
// as in the same window at 100%. On a window larger than 1280 by 800, the
// link text was smaller at 200% than at 100% in CSS pixels (1920 by 1080:
// 27.1 to 18.4). This needs the full Chromium (the "chromium" channel): the
// zoom comes from the profile, as a user's zoom does.
async function textSizeWithZoom(
  baseURL: string,
  [width, height]: [number, number],
  zoom: number,
) {
  const dir = mkdtempSync(join(tmpdir(), 'globe-zoom-'));
  try {
    mkdirSync(join(dir, 'Default'));
    writeFileSync(
      join(dir, 'Default', 'Preferences'),
      JSON.stringify({
        // Chrome keeps a zoom as a level: the zoom is 1.2 to its power.
        partition: {default_zoom_level: {x: Math.log(zoom) / Math.log(1.2)}},
      }),
    );
    const context = await chromium.launchPersistentContext(dir, {
      baseURL,
      channel: 'chromium',
      // The window sets the size, not the Desktop Chrome device.
      viewport: null,
      deviceScaleFactor: undefined,
      args: [`--window-size=${width},${height}`],
    });
    try {
      const page = context.pages()[0] ?? (await context.newPage());
      await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
      await showGlobe(page);
      expect(await page.evaluate(() => devicePixelRatio)).toBeCloseTo(zoom);
      return (await measureLinks(page)).textSize;
    } finally {
      await context.close();
    }
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
}

test.describe('with the zoom of the browser', () => {
  test.setTimeout(120_000);

  // The size of the window, with the toolbars of the browser (139px).
  for (const window of [
    [1440, 1040],
    [1920, 1220],
    [2560, 1580],
  ] as Array<[number, number]>) {
    test(`the globe links keep their size in CSS pixels at 200% in a ${window[0]} by ${window[1]} window`, async ({
      baseURL,
    }) => {
      const normal = await textSizeWithZoom(baseURL!, window, 1);
      const zoomed = await textSizeWithZoom(baseURL!, window, 2);
      expect(normal).toBeGreaterThan(20);
      // At 200% the page is a whole number of CSS pixels high, so the window
      // without the zoom can be 1px lower: the text can be 0.03px smaller.
      expect(zoomed).toBeGreaterThanOrEqual(normal - 0.1);
    });
  }

  // In a portrait window, the page at 200% is too narrow for the curve to
  // hold the links at their size at 100%, and the curve is not wider than
  // the page. The owner keeps the curve: the links are larger on the screen
  // than at 100% (144% of it at 768 by 1024), but not twice as large.
  for (const window of [
    [768, 1164],
    [834, 1100],
  ] as Array<[number, number]>) {
    test(`the globe links are larger on the screen at 200% in a ${window[0]} by ${window[1]} window`, async ({
      baseURL,
    }) => {
      const normal = await textSizeWithZoom(baseURL!, window, 1);
      const zoomed = await textSizeWithZoom(baseURL!, window, 2);
      expect(zoomed * 2).toBeGreaterThanOrEqual(normal * 1.3);
    });
  }
});

// The menu takes the largest of its sizes once it is no wider than the page.
// At 320 by 700 the page's own menu has larger text (12.2 CSS pixels) than
// the smallest menu cut to the width of the page (11.8), but the smaller one
// showed.
test.describe('at 320 by 700', () => {
  test.use({viewport: {width: 320, height: 700}});

  test('the globe links have the text of the larger menu', async ({page}) => {
    await showGlobe(page);
    expect((await measureLinks(page)).textSize).toBeGreaterThan(12.2);
  });
});
