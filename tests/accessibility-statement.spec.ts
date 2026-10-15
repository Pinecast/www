import {expect, test} from '@playwright/test';
import {load} from './helpers';

// The statement names the accessibility features in a sentence. The help center
// explains how to use them (Revised 508, 602.2). The statement links to that
// section, so a person who reads the statement can find the instructions.
const HELP_CENTER_CATEGORY =
  'https://help.pinecast.com/category/201-accessibility';

test.describe('accessibility statement: link to the help center', () => {
  for (const viewport of [
    {width: 1280, height: 900},
    {width: 375, height: 812},
  ]) {
    test(`links to the Accessibility section of the help center at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/features/accessibility');

      const link = page.getByRole('link', {
        name: 'Accessibility section of our help center',
      });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', HELP_CENTER_CATEGORY);
      // The link is in the text of a sentence that says what it is for, so the
      // name of the link makes sense out of context, and the sentence does not
      // find the link by a place on the screen.
      const sentence = await link.evaluate(el => el.parentElement!.innerText);
      expect(sentence).toMatch(/how to use these features/i);
      expect(sentence).not.toMatch(
        /\b(top|bottom|left|right|corner|above|below)\b/i,
      );
    });
  }
});
