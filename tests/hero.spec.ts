import {expect, test, type Page} from '@playwright/test';

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

test('the canvas of the home hero takes over from the CSS layout', async ({
  page,
}) => {
  await page.goto('/');
  await expect.poll(() => skeleton(page)).toBe('hidden');
  expect(await backgroundAt(page, 10, 400)).not.toBe('rgb(248, 244, 235)');
});
