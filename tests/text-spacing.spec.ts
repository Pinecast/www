import {expect, test, type Locator} from '@playwright/test';
import {clippedText, load, openMenu, TEXT_SPACING} from './helpers';

// WCAG 1.4.12: with more line height, letter spacing, word spacing and
// paragraph spacing, no text is cut off or covered. Boxes of fixed height
// with `overflow: hidden` cut text off.

// The box of the text itself, not of its element.
async function textBox(element: Locator) {
  return element.evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const {top, bottom, left, right} = range.getBoundingClientRect();
    return {top, bottom, left, right};
  });
}

test.describe('with larger text spacing', () => {
  test('the header menu shows all its text', async ({page}) => {
    await page.setViewportSize({width: 320, height: 640});
    await load(page, '/learn', {spacing: true});
    const menu = await openMenu(page);
    expect(await clippedText(menu)).toEqual([]);
  });

  for (const width of [320, 1280]) {
    test(`the pricing tickets show all their text at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({width, height: 900});
      await load(page, '/', {spacing: true});
      const pricing = page.locator('section', {
        has: page.getByRole('heading', {name: 'Grab your ticket'}),
      });
      expect(await clippedText(pricing)).toEqual([]);
    });
  }

  // An open panel had `max-height: 400px` and `overflow: hidden`. At 320px
  // the add-ons need up to 470px, so the end of their text was cut off.
  for (const {path, buttons} of [
    {path: '/', buttons: / add-on$/},
    {path: '/features', buttons: /./},
  ]) {
    test(`each open panel of ${path} shows all its text`, async ({page}) => {
      await page.setViewportSize({width: 320, height: 800});
      await load(page, path, {spacing: true});
      const main = page.getByRole('main');
      const toggles = main.locator('button[aria-controls]', {
        hasText: buttons,
      });
      expect(await toggles.count()).toBeGreaterThan(0);
      for (const toggle of await toggles.all()) {
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        const panel = main.locator(
          `[id="${await toggle.getAttribute('aria-controls')}"]`,
        );
        // Not inert, so that clippedText checks its text.
        await expect(panel).not.toHaveAttribute('inert');
        await expect(panel).toHaveCSS('max-height', 'none');
        // Wait until the panel stops growing.
        await expect
          .poll(() => panel.evaluate(el => el.scrollHeight - el.clientHeight))
          .toBe(0);
        expect(await clippedText(panel)).toEqual([]);
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      }
    });
  }

  test('an add-on name does not cover the next add-on', async ({page}) => {
    await page.setViewportSize({width: 320, height: 800});
    await load(page, '/', {spacing: true});
    const rows = page.locator('[role="presentation"]', {
      has: page.getByRole('button', {name: / add-on$/}),
    });
    expect(await rows.count()).toBeGreaterThan(0);
    for (const row of await rows.all()) {
      const rowBox = (await row.boundingBox())!;
      const name = await textBox(row.getByRole('heading'));
      expect(name.bottom).toBeLessThanOrEqual(rowBox.y + rowBox.height + 1);
    }
  });

  test('the feature list shows the same part of each title', async ({page}) => {
    // Above 1280px the titles are 80px tall in 70px rows, which crop them on
    // purpose. More line height must not push them further down. They can
    // move up a little (the line of the row no longer starts above them),
    // which shows more of them.
    await page.setViewportSize({width: 1440, height: 900});
    await load(page, '/features');
    const titles = page.locator('ul li button > span:not([aria-hidden])');
    const offsets = async () =>
      titles.evaluateAll(spans =>
        spans.map(span => {
          const range = document.createRange();
          range.selectNodeContents(span);
          const button = span.parentElement!.getBoundingClientRect();
          return Math.round(range.getBoundingClientRect().top - button.top);
        }),
      );
    const before = await offsets();
    expect(before.length).toBeGreaterThan(0);
    await page.addStyleTag({content: TEXT_SPACING});
    const after = await offsets();
    for (let i = 0; i < before.length; i++) {
      expect(after[i]).toBeLessThanOrEqual(before[i] + 1);
      expect(after[i]).toBeGreaterThanOrEqual(before[i] - 8);
    }
  });

  test('the customer names stay on the screen', async ({page}) => {
    await page.setViewportSize({width: 320, height: 800});
    await load(page, '/', {spacing: true});
    const names = page.locator('#testimonials h3');
    expect(await names.count()).toBeGreaterThan(0);
    for (const name of await names.all()) {
      const box = await textBox(name);
      expect(box.left).toBeGreaterThanOrEqual(-1);
      expect(box.right).toBeLessThanOrEqual(321);
    }
  });
});
