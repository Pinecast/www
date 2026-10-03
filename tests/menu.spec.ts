import {expect, test} from '@playwright/test';
import {clippedText, load, openMenu} from './helpers';

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

  // On a phone, 100vh is the height with the browser toolbar hidden, so the
  // end of the menu could be under the toolbar while it shows. The menu must
  // be no taller than the dynamic viewport (dvh), which follows the toolbar.
  // This browser has no toolbar (dvh is vh here), so check the style rules.
  for (const viewport of [
    {width: 375, height: 667},
    {width: 1280, height: 720},
  ]) {
    test(`is no taller than the dynamic viewport at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/learn');
      await openMenu(page);
      const dialog = page.getByRole('dialog', {name: 'Menu'});
      const maxHeights = await dialog.evaluate(element => {
        const values: Array<string> = [];
        const visit = (rules: CSSRuleList) => {
          for (const rule of rules) {
            if (rule instanceof CSSMediaRule) {
              if (matchMedia(rule.media.mediaText).matches) {
                visit(rule.cssRules);
              }
            } else if (
              rule instanceof CSSStyleRule &&
              rule.style.maxHeight &&
              element.matches(rule.selectorText)
            ) {
              values.push(rule.style.maxHeight);
            }
          }
        };
        for (const sheet of document.styleSheets) {
          visit(sheet.cssRules);
        }
        return values;
      });
      expect(maxHeights.length).toBeGreaterThan(0);
      for (const value of maxHeights) {
        expect(value).toContain('100dvh');
      }
      const box = (await dialog.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
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
    // The menu grows for 0.2s, and only then can it scroll. Stop the clock of
    // the animations first: on a busy machine, the 0.2s can pass between the
    // click and the check. The menu fades in with `visibility` in the same
    // animation, so it counts as hidden until the clock runs again.
    const menu = page.getByRole('navigation', {
      name: 'Menu',
      includeHidden: true,
    });
    const client = await page.context().newCDPSession(page);
    await client.send('Animation.enable');
    await client.send('Animation.setPlaybackRate', {playbackRate: 0});
    await page
      .getByRole('banner')
      .getByRole('button', {name: 'Menu', exact: true})
      .click();
    expect(await menu.evaluate(el => getComputedStyle(el).overflowY)).toBe(
      'hidden',
    );
    await client.send('Animation.setPlaybackRate', {playbackRate: 1});
    await expect(menu).toHaveCSS('overflow-y', 'auto');
  });
});
