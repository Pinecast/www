import {expect, test, type Page} from '@playwright/test';
import {pixelDifference} from './helpers';

// The canvas of the home hero can only draw once the page script has loaded.
// Until then, the static page lays out what it draws first in CSS: the tiles,
// in the colors that they have until their images load, on sand. Run
// `npm run build` first.

const backgroundAt = (page: Page, x: number, y: number) =>
  page.evaluate(
    ([x, y]) =>
      getComputedStyle(document.elementFromPoint(x, y)!).backgroundColor,
    [x, y],
  );

const skeleton = (page: Page) =>
  page
    .locator('main section')
    .first()
    .evaluate(section =>
      getComputedStyle(section).getPropertyValue('--hero-skeleton'),
    );

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled: false, viewport: {width: 1280, height: 800}});

  test('the home hero shows its tiles on sand', async ({page}) => {
    await page.goto('/');
    // Left of the tiles: sand, not the dark section under the hero.
    expect(await backgroundAt(page, 10, 400)).toBe('rgb(248, 244, 235)');
    // The top tile on the left, and the bottom one.
    expect(await backgroundAt(page, 40, 150)).toBe('rgb(207, 138, 234)');
    expect(await backgroundAt(page, 40, 700)).toBe('rgb(196, 255, 126)');
  });
});

// The canvas waits for the page script and the stills, so on a busy machine it
// can take more than the 5s that an `expect` waits by default.
const TAKEOVER_TIMEOUT = 30_000;

test('the canvas of the home hero takes over from the CSS layout', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect
    .poll(() => skeleton(page), {timeout: TAKEOVER_TIMEOUT})
    .toBe('hidden');
  expect(await backgroundAt(page, 10, 400)).not.toBe('rgb(248, 244, 235)');
});

// The CSS layout shows each still where the canvas draws it: scaled to cover
// the tile, from the middle. (The inner columns draw one image over both of
// their tiles.) Both are screenshots of the stills alone, with the circles at
// their full size (reduced motion), so the share of pixels that differ is the
// share that the two scale differently. Text and the edges of the art make up
// about 1%. A tile that shows another part of its image makes up much more:
// a column that is 20px too tall, in the window of an inner column, is 6%.
// So, the inner columns, which are the part with the most CSS, count alone too.
type Region = {x: number; y: number; width: number; height: number};
const LAYOUTS: Record<
  string,
  {width: number; height: number; inner?: Array<Region>}
> = {
  mobile: {width: 390, height: 844},
  tablet: {width: 1024, height: 768},
  desktop: {
    width: 1440,
    height: 900,
    inner: [
      {x: 257, y: 120, width: 218, height: 760},
      {x: 965, y: 120, width: 218, height: 760},
    ],
  },
};
for (const [name, {inner = [], ...viewport}] of Object.entries(LAYOUTS)) {
  test(`the CSS layout of the home hero shows the stills where the canvas does at the ${name} layout`, async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const screenshot = async (javaScriptEnabled: boolean, clip: Region) => {
      const context = await browser.newContext({
        javaScriptEnabled,
        reducedMotion: 'reduce',
        viewport,
      });
      const page = await context.newPage();
      // The videos replace the stills once they play.
      await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
      await page.goto('/');
      if (javaScriptEnabled) {
        await expect(page.locator('main section').first()).toHaveCSS(
          '--hero-skeleton',
          'hidden',
          {timeout: TAKEOVER_TIMEOUT},
        );
      }
      // `load` waits for the stills. The last frame is not on screen yet.
      await page.waitForTimeout(500);
      const png = await page.screenshot({clip});
      await context.close();
      return png;
    };
    const reader = await browser.newPage();
    const compare = async (clip: Region) =>
      pixelDifference(
        reader,
        await screenshot(false, clip),
        await screenshot(true, clip),
      );

    // Under the header, which is not part of the hero.
    expect(
      await compare({
        x: 0,
        y: 100,
        width: viewport.width,
        height: viewport.height - 100,
      }),
      'the viewport',
    ).toBeLessThan(0.05);
    for (const clip of inner) {
      expect(
        await compare(clip),
        `the inner column at x=${clip.x}`,
      ).toBeLessThan(0.03);
    }
    await reader.close();
  });
}
