import {expect, test} from '@playwright/test';
import {hasSidewaysScroll, load} from './helpers';

// The subprocessor list is a markdown table in a <Table>. It once showed as
// one paragraph of pipes, because the MDX setup had no table syntax.
test.describe('subprocessors', () => {
  test('is a table with a row for each company', async ({page}) => {
    await load(page, '/subprocessors');
    await expect(
      page.getByRole('heading', {name: 'Subprocessors', level: 1}),
    ).toHaveCount(1);
    const table = page.getByRole('region', {name: 'Subprocessors'});
    await expect(table.getByRole('columnheader')).toHaveText([
      'Subprocessor',
      'Purpose',
      'Personal data processed',
      'Location',
      'Agreements',
    ]);
    const rows = table.locator('tbody').getByRole('row');
    await expect(rows).toHaveCount(13);
    // Each company links its data processing terms.
    for (const row of await rows.all()) {
      await expect(row.getByRole('link', {name: /DPA/})).toHaveCount(1);
    }
  });

  // WCAG 1.4.10 lets a data table scroll sideways, but in its own box: the
  // page must not, and the keyboard must be able to scroll the box.
  test('scrolls in its own box at 320px', async ({page}) => {
    await page.setViewportSize({width: 320, height: 800});
    await load(page, '/subprocessors');
    expect(await hasSidewaysScroll(page)).toBe(false);

    const box = page.getByRole('region', {name: 'Subprocessors'});
    expect(
      await box.evaluate(el => el.scrollWidth > el.clientWidth),
    ).toBe(true);
    await box.focus();
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => box.evaluate(el => el.scrollLeft))
      .toBeGreaterThan(0);
  });
});
