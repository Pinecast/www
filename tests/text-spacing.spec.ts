import {expect, test, type Locator} from '@playwright/test';
import {
  clippedText,
  inEveryLanguage,
  load,
  openMenu,
  TEXT_SPACING,
} from './helpers';

// WCAG 1.4.12: with more line height, letter spacing, word spacing and
// paragraph spacing, no text is cut off or covered. Boxes of fixed height
// with `overflow: hidden` cut text off.

// The links drawn as buttons (a border or a background) whose label is taller
// than the button, so that it spills out of it.
async function spilledLabels(links: Locator): Promise<Array<string>> {
  return links.evaluateAll(elements =>
    elements.flatMap(link => {
      const style = getComputedStyle(link);
      const drawn =
        parseFloat(style.borderTopWidth) > 0 ||
        style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const box = link.getBoundingClientRect();
      if (!drawn || !box.width || !link.checkVisibility()) return [];
      const range = document.createRange();
      range.selectNodeContents(link);
      const text = range.getBoundingClientRect();
      return text.height &&
        (text.top < box.top - 1 || text.bottom > box.bottom + 1)
        ? [
            `${link.textContent?.trim()}: ${Math.round(text.height)}px of text in ${Math.round(box.height)}px`,
          ]
        : [];
    }),
  );
}

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
    ...inEveryLanguage(['/features']).map(path => ({path, buttons: /./})),
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

  // From 1181px the titles are taller than their rows, which crop them on
  // purpose: 80px titles in 70px rows above 1280px, and 60px titles in 52px
  // rows below. More line height must not push them further down. They can
  // move up a little (the line of the row no longer starts above them),
  // which shows more of them.
  for (const width of [1181, 1240, 1440]) {
    test(`the feature list shows the same part of each title at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({width, height: 900});
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
  }

  // The letter and the icon of a row, 60px wide and 43px from the sides, are
  // painted over by a title that is wider than the space between them, and
  // the row crops a second line. A translated name can be long ("Enlaces de
  // apps incrustables"): it is smaller instead (nameRoom in
  // src/pages/features/index.tsx).
  for (const path of inEveryLanguage(['/features'])) {
    // From 1181px, where the rows have a fixed height. Below, a row grows
    // with its name.
    for (const width of [1181, 1280, 1281, 1440, 1536]) {
      for (const spacing of [false, true]) {
        test(`the feature titles of ${path} stay on one line between the letter and the icon at ${width}px${
          spacing ? ' with larger text spacing' : ''
        }`, async ({page}) => {
          await page.setViewportSize({width, height: 900});
          await load(page, path, {spacing});
          const titles = page.locator('ul li button > span:not([aria-hidden])');
          expect(await titles.count()).toBeGreaterThan(0);
          for (const title of await titles.all()) {
            const name = (await title.textContent()) ?? '';
            const box = await textBox(title);
            expect(box.left, name).toBeGreaterThanOrEqual(103);
            expect(box.right, name).toBeLessThanOrEqual(width - 103);
            const lines = await title.evaluate(el => {
              const range = document.createRange();
              range.selectNodeContents(el);
              return new Set(
                [...range.getClientRects()].map(rect => Math.round(rect.top)),
              ).size;
            });
            expect(lines, name).toBe(1);
          }
        });
      }
    }
  }

  // Below 1181px a row grows with its name, and a word that is too wide for
  // the row breaks rather than being cut off ("Transcripciones" at 320px).
  for (const path of inEveryLanguage(['/features'])) {
    test(`the feature names of ${path} show all their text at 320px`, async ({
      page,
    }) => {
      await page.setViewportSize({width: 320, height: 800});
      await load(page, path, {spacing: true});
      const rows = page.getByRole('main').locator('ul li button');
      expect(await rows.count()).toBeGreaterThan(0);
      for (const row of await rows.all()) {
        expect(await clippedText(row)).toEqual([]);
      }
    });
  }

  // A link drawn as a button (PrimaryButton, SecondaryButton) has a fixed
  // height, unless the place that uses it lets it grow: a label that wraps
  // spills across its border and its focus ring.
  for (const path of inEveryLanguage(['/'])) {
    test(`the button links of ${path} hold their labels at 320px`, async ({
      page,
    }) => {
      await page.setViewportSize({width: 320, height: 800});
      await load(page, path, {spacing: true});
      expect(await spilledLabels(page.getByRole('main').locator('a'))).toEqual(
        [],
      );
    });
  }

  // The section above the footer of a content page is outside <main>: the
  // sign-up section, or the quote section of the page for colleges and
  // universities (FooterUpsell). Its two buttons share a row, and a label
  // that did not fit on that row wrapped and spilled.
  for (const path of inEveryLanguage(['/features/analytics', '/education'])) {
    test(`the buttons above the footer of ${path} hold their labels at 320px`, async ({
      page,
    }) => {
      await page.setViewportSize({width: 320, height: 800});
      await load(page, path, {spacing: true});
      const links = page.locator('main ~ section a');
      expect(await links.count()).toBeGreaterThan(0);
      expect(await spilledLabels(links)).toEqual([]);
    });
  }

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
