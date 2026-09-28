import {expect, test} from '@playwright/test';
import {clippedText, load, menuPanel, openMenu} from './helpers';

// The header menu has a fixed height. On a short screen or when zoomed, it
// cut off its lower links, and the page behind it does not scroll. It must
// scroll inside itself instead.
test.describe('header menu', () => {
  for (const viewport of [
    {width: 320, height: 256}, // 400% zoom
    {width: 640, height: 360}, // 200% zoom
    {width: 1280, height: 360}, // a short desktop window
  ]) {
    test(`shows every link at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/learn');
      const menu = await openMenu(page);
      const menuBox = (await menu.boundingBox())!;
      const bottom = Math.min(menuBox.y + menuBox.height, viewport.height);
      for (const link of await menu.getByRole('link').all()) {
        if (!(await link.isVisible())) {
          // This link is for the other layout (narrow or wide).
          continue;
        }
        await link.scrollIntoViewIfNeeded();
        const box = (await link.boundingBox())!;
        expect(box.y).toBeGreaterThanOrEqual(menuBox.y - 1);
        expect(box.y + box.height).toBeLessThanOrEqual(bottom + 1);
      }
      expect(await clippedText(menu)).toEqual([]);
    });
  }

  // At the default sizes the menu fits and looks as it did.
  for (const viewport of [
    {width: 375, height: 667},
    {width: 1280, height: 720},
  ]) {
    test(`fits without a scroll at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/learn');
      const menu = await openMenu(page);
      const {scrollHeight, clientHeight} = await menu.evaluate(el => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(scrollHeight).toBeLessThanOrEqual(clientHeight);
    });
  }

  test('hides the sound button while it is open', async ({page}) => {
    // At 400% zoom the round sound button covered links of the menu.
    await page.setViewportSize({width: 320, height: 256});
    await load(page, '/learn');
    const sound = page.getByRole('button', {name: /^(Unmute|Mute)$/});
    await expect(sound).toBeVisible();
    await openMenu(page);
    await expect(sound).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(sound).toBeVisible();
  });

  test('does not show a scroll bar while it grows', async ({page}) => {
    await page.setViewportSize({width: 320, height: 256});
    await load(page, '/learn');
    const menu = menuPanel(page);
    await page
      .getByRole('banner')
      .getByRole('button', {name: 'Menu', exact: true})
      .click();
    // The menu grows for 0.2s, and only then can it scroll.
    expect(await menu.evaluate(el => getComputedStyle(el).overflowY)).toBe(
      'hidden',
    );
    await expect(menu).toHaveCSS('overflow-y', 'auto');
  });
});
