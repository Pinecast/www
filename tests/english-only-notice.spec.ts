import {readFileSync, readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import {expect, test, type Page} from '@playwright/test';

import {DEFAULT_LOCALE, splitLocale} from '../src/locales.mjs';
import {
  exportedPages,
  hasSidewaysScroll,
  isTranslatedMessage,
  load,
} from './helpers';

// The English-only notice (src/components/EnglishOnlyNotice.tsx): on the
// policies, which stay in English, a note in the reader's language says that
// the document is in English only, and where to write.
//
// These tests know no copy (CLAUDE.md, "Tests do not check copy"): the
// policies are the pages that export `englishOnlyStaticProps`, and the note's
// words must be translated messages, whatever they say.

// The routes of the MDX pages that export `englishOnlyStaticProps`.
function policyRoutes(dir = 'src/pages'): Array<string> {
  const routes: Array<string> = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...policyRoutes(path));
    } else if (
      entry.name.endsWith('.mdx') &&
      readFileSync(path, 'utf8').includes('englishOnlyStaticProps')
    ) {
      routes.push(
        '/' + relative('src/pages', path).replace(/(\/index)?\.mdx$/, ''),
      );
    }
  }
  return routes.sort();
}

const POLICIES = policyRoutes();
const note = (page: Page) => page.getByRole('note');

test('there are policies with the note', () => {
  expect(POLICIES.length).toBeGreaterThan(0);
});

test.describe('for a reader whose browser prefers Spanish', () => {
  test.use({locale: 'es-MX'});

  for (const path of POLICIES) {
    test(`${path} says, in Spanish, that it is only in English`, async ({
      page,
    }) => {
      await load(page, path);
      await expect(note(page)).toHaveAttribute('lang', 'es-419');
      const sentences = await note(page).getByRole('paragraph').allInnerTexts();
      expect(sentences.length).toBeGreaterThan(0);
      for (const sentence of sentences) {
        expect(
          isTranslatedMessage(sentence, 'es-419'),
          `"${sentence}" is a translated message`,
        ).toBe(true);
      }
      // The address is a link that writes to it.
      const link = note(page).getByRole('link');
      const address = (await link.innerText()).trim();
      await expect(link).toHaveAttribute('href', `mailto:${address}`);
    });
  }

  // The reflow tests run with an English browser, which gets no note.
  for (const spacing of [false, true]) {
    test(`at 320px${
      spacing ? ' with larger text spacing' : ''
    }, no policy scrolls sideways`, async ({page}) => {
      await page.setViewportSize({width: 320, height: 640});
      for (const path of POLICIES) {
        await load(page, path, {spacing});
        await expect(note(page)).toBeVisible();
        expect(await hasSidewaysScroll(page), path).toBe(false);
      }
    });
  }

  test('it is above the text of the policy', async ({page}) => {
    await load(page, POLICIES[0]);
    const before = await note(page).evaluate(element => {
      const text = [...document.querySelectorAll('main p')].find(
        paragraph => !element.contains(paragraph),
      );
      return (
        text !== undefined &&
        (element.compareDocumentPosition(text) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
          0
      );
    });
    expect(before).toBe(true);
  });

  test('no other page has the note', async ({page}) => {
    test.slow();
    const others = exportedPages().filter(
      path =>
        splitLocale(path).locale === DEFAULT_LOCALE && !POLICIES.includes(path),
    );
    for (const path of others) {
      await load(page, path);
      await expect(note(page), path).toHaveCount(0);
    }
  });

  test('a choice of English on the site means no note', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('language', 'en'));
    await load(page, POLICIES[0]);
    await expect(note(page)).toHaveCount(0);
  });
});

test.describe('for a reader whose browser prefers English', () => {
  test.use({locale: 'en-US'});

  test('there is no note', async ({page}) => {
    await load(page, POLICIES[0]);
    await expect(note(page)).toHaveCount(0);
  });

  test('a choice of Spanish on the site brings the note', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('language', 'es'));
    await load(page, POLICIES[0]);
    await expect(note(page)).toHaveAttribute('lang', 'es-419');
  });

  test('closing the language suggestion is no choice of language', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('language', 'dismissed'),
    );
    await load(page, POLICIES[0]);
    await expect(note(page)).toHaveCount(0);
  });
});
