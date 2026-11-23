import {readFileSync} from 'node:fs';
import {expect, test, type Locator} from '@playwright/test';
import {
  clippedText,
  exportedPages,
  inEveryLanguage,
  load,
  TEXT_SPACING,
} from './helpers';

// WCAG 1.4.12: with more line height, letter spacing, word spacing and
// paragraph spacing, no text is cut off or covered. Boxes of fixed height
// with `overflow: hidden` cut text off.

// The links drawn as buttons (a border or a background) whose label is
// larger than the button, so that it spills out of it: taller (a label that
// wraps) or wider (a label that does not wrap, in a narrow button).
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
        (text.top < box.top - 1 ||
          text.bottom > box.bottom + 1 ||
          text.left < box.left - 1 ||
          text.right > box.right + 1)
        ? [
            `${link.textContent?.trim()}: ${Math.round(text.width)}x${Math.round(text.height)}px of text in ${Math.round(box.width)}x${Math.round(box.height)}px`,
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
  // Below 1181px each tile of the menu was 100px high, which cut off a German
  // or French heading of three lines.
  for (const path of inEveryLanguage(['/learn'])) {
    for (const {width, height} of [
      {width: 320, height: 640},
      {width: 414, height: 800},
      {width: 700, height: 800},
    ]) {
      test(`the header menu of ${path} shows all its text at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({width, height});
        await load(page, path, {spacing: true});
        // The button and the menu's links, found by the menu's id rather
        // than by their names, which are in the page's language.
        await page
          .getByRole('banner')
          .locator('button[aria-controls="site-menu"]')
          .filter({visible: true})
          .click();
        const menu = page.locator('#site-menu').getByRole('navigation');
        await expect(menu).toHaveCSS('overflow-y', 'auto');
        expect(await clippedText(menu)).toEqual([]);
      });
    }
  }

  // From 701 to 800px, the ticket cut off the German and French labels of its
  // buttons: its columns could not be narrower than their content.
  for (const path of inEveryLanguage(['/'])) {
    for (const width of [320, 701, 768, 1280]) {
      test(`the pricing tickets of ${path} show all their text at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({width, height: 900});
        await load(page, path, {spacing: true});
        // The section of the tickets, found by the help article that a
        // ticket links to, in every language.
        const pricing = page.locator('section', {
          has: page.locator('a[href*="help.pinecast.com/article/"]'),
        });
        await expect(pricing).toHaveCount(1);
        expect(await clippedText(pricing)).toEqual([]);
      });
    }
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
  // spills across its border and its focus ring. A label that does not wrap
  // spills out of the sides of a button that its column makes narrow: the
  // testimonials button is two of twelve columns, at its narrowest at 320px
  // and at 1181px.
  for (const path of inEveryLanguage(['/'])) {
    for (const width of [320, 768, 1181]) {
      test(`the button links of ${path} hold their labels at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({width, height: 800});
        await load(page, path, {spacing: true});
        expect(
          await spilledLabels(page.getByRole('main').locator('a')),
        ).toEqual([]);
      });
    }
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

  // A link to a PDF of the site and the text around it. The download link of
  // the ACR card (src/components/AcrDownload.tsx) is drawn as a button and
  // wraps a long label inside it, and the text of the card makes it taller:
  // at 320px, and in the narrow right column of the card at 768px. The pages
  // are found by their links to a PDF in public/, not by their words: a
  // translation that has no card yet has none. The comment above the card in
  // content/en/features/accessibility.mdx says so.
  const pagesWithPdfLinks = exportedPages().filter(path =>
    /<a [^>]*href="\/[^"]+\.pdf"/.test(
      readFileSync(
        `out${path.endsWith('/') ? `${path}index` : path}.html`,
        'utf8',
      ),
    ),
  );
  test('the export has a page with a link to a PDF', () => {
    expect(pagesWithPdfLinks.length).toBeGreaterThan(0);
  });
  for (const path of pagesWithPdfLinks) {
    for (const width of [320, 768]) {
      test(`the PDF link of ${path} and the text around it show whole at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({width, height: 800});
        await load(page, path, {spacing: true});
        const links = page
          .getByRole('main')
          .locator('a[href^="/"][href$=".pdf"]');
        expect(await links.count()).toBeGreaterThan(0);
        expect(await spilledLabels(links)).toEqual([]);
        expect(await clippedText(page.getByRole('main'))).toEqual([]);
      });
    }
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
