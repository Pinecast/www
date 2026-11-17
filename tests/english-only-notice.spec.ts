import {readFileSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';

import {load} from './helpers';

// The English-only notice (src/components/EnglishOnlyNotice.tsx): on the four
// policies, which stay in English, a note in the reader's language says that
// the document is in English only, and where to write.

const POLICIES = ['/privacy', '/terms', '/subprocessors', '/ai-use'];

type Catalog = Record<string, {defaultMessage: string}>;
const english: Catalog = JSON.parse(readFileSync('lang/en.json', 'utf8'));
const spanish: Catalog = JSON.parse(readFileSync('lang/es-419.json', 'utf8'));

// The Spanish of an English message, from Lingo.dev's catalog, with the
// address in place of its argument and without the tags.
function inSpanish(defaultMessage: string): string {
  const id = Object.keys(english).find(
    key => english[key].defaultMessage === defaultMessage,
  );
  if (!id) throw new Error(`lang/en.json has no "${defaultMessage}"`);
  return spanish[id].defaultMessage
    .replace('{email}', 'support@pinecast.com')
    .replace(/<\/?link>/g, '');
}

const note = (page: Page) => page.getByRole('note');

test.describe('for a reader whose browser prefers Spanish', () => {
  test.use({locale: 'es-MX'});

  for (const path of POLICIES) {
    test(`${path} says, in Spanish, that it is only in English`, async ({
      page,
    }) => {
      await load(page, path);
      await expect(note(page)).toHaveAttribute('lang', 'es-419');
      await expect(note(page)).toContainText(
        inSpanish('This document is only in English.'),
      );
      await expect(note(page)).toContainText(
        inSpanish('Questions? Write to <link>{email}</link>.'),
      );
      await expect(
        note(page).getByRole('link', {name: 'support@pinecast.com'}),
      ).toHaveAttribute('href', 'mailto:support@pinecast.com');
    });
  }

  test('it is above the text of the policy', async ({page}) => {
    await load(page, '/privacy');
    const before = await note(page).evaluate(element => {
      const text = [...document.querySelectorAll('main p')].find(p =>
        p.textContent?.startsWith('This privacy policy explains'),
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

  test('the accessibility statement has no note', async ({page}) => {
    await load(page, '/features/accessibility');
    await expect(note(page)).toHaveCount(0);
  });

  test('a choice of English on the site means no note', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('language', 'en'));
    await load(page, '/privacy');
    await expect(note(page)).toHaveCount(0);
  });
});

test.describe('for a reader whose browser prefers English', () => {
  test.use({locale: 'en-US'});

  test('there is no note', async ({page}) => {
    await load(page, '/privacy');
    await expect(note(page)).toHaveCount(0);
  });

  test('a choice of Spanish on the site brings the note', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('language', 'es'));
    await load(page, '/terms');
    await expect(note(page)).toHaveAttribute('lang', 'es-419');
  });

  test('closing the language suggestion is no choice of language', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('language', 'dismissed'),
    );
    await load(page, '/terms');
    await expect(note(page)).toHaveCount(0);
  });
});
