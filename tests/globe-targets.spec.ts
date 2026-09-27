import {expect, test} from '@playwright/test';
import {load} from './helpers';

// WCAG 2.5.8: the feature links on the globe (Distribution, Analytics,
// Monetization) have hit areas of at least 24 by 24 CSS pixels. The text on
// the curve is only about 11 pixels tall on a narrow screen.
const SLUGS = ['distribution', 'analytics', 'monetization'];

for (const viewport of [
  {width: 320, height: 640},
  {width: 375, height: 667},
  {width: 414, height: 896},
  {width: 1280, height: 800},
]) {
  test.describe(`globe links at ${viewport.width}x${viewport.height}`, () => {
    test.use({viewport});

    test.beforeEach(async ({page}) => {
      await load(page, '/');
      await page.locator('#analytics').scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
    });

    test('each hit area holds a 24 by 24 square', async ({page}) => {
      // Map what a pointer hits, pixel by pixel, over the menu, and find the
      // largest square that each link covers.
      const squares = await page.evaluate(slugs => {
        const svg = [...document.querySelectorAll('svg')].find(el =>
          el.querySelector('text a[href$="#analytics"]'),
        )!;
        const r = svg.getBoundingClientRect();
        const x0 = Math.max(0, Math.floor(r.left));
        const y0 = Math.max(0, Math.floor(r.top));
        const width = Math.min(innerWidth, Math.ceil(r.right)) - x0;
        const height = Math.min(innerHeight, Math.ceil(r.bottom)) - y0;
        const result: Record<string, number> = {};
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
          result[slug] = largest;
        }
        return result;
      }, SLUGS);
      for (const slug of SLUGS) {
        expect(squares[slug], slug).toBeGreaterThanOrEqual(24);
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
