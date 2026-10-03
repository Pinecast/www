import {expect, test} from '@playwright/test';
import {load} from './helpers';

// The Support section of the terms must name each way to reach support. It
// must not find support by a place on the screen: that fails for users who
// cannot see the screen, and the place changes with the layout.
test.describe('terms of use: support section', () => {
  for (const viewport of [
    {width: 1280, height: 900},
    {width: 375, height: 812},
  ]) {
    test(`names the ways to reach support at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/terms');

      const heading = page.getByRole('heading', {name: 'Support', level: 2});
      await expect(heading).toHaveCount(1);
      const section = page.locator(
        'xpath=//h2[normalize-space()="Support"]/following-sibling::*',
      );

      const email = page.getByRole('link', {name: 'support@pinecast.com'});
      await expect(email).toHaveAttribute(
        'href',
        'mailto:support@pinecast.com',
      );
      await expect(page.getByText('message form')).toBeVisible();
      await expect(
        page.getByRole('link', {name: 'help center'}),
      ).toHaveAttribute('href', 'https://help.pinecast.com');

      const text = (await section.allInnerTexts()).join(' ');
      expect(text).not.toMatch(
        /\b(top|bottom|left|right|corner|above|below)\b/i,
      );
    });
  }
});
