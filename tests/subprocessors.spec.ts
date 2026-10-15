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

  // WCAG 1.3.1: a link in a row is read with the name of its row. A markdown
  // table has one row of headers, so the first cell of each body row was a
  // plain cell, and ten links "DPA" had no company. The first cell of each body
  // row has to be a row header, and the column headers stay.
  //
  // This test does not know the text of the table. It checks the roles only.
  test('each body row starts with a row header', async ({page}) => {
    await load(page, '/subprocessors');
    const table = page.getByRole('main').getByRole('table');
    await expect(table).toHaveCount(1);

    // The column headers stay: one for each cell of a body row.
    const columnHeaders = table.getByRole('columnheader');
    const rows = table.locator('tbody').getByRole('row');
    const rowCount = await rows.count();
    expect(rowCount, 'the table has body rows').toBeGreaterThan(0);
    const cellCount = await rows.first().locator(':scope > *').count();
    await expect(columnHeaders).toHaveCount(cellCount);
    for (const header of await columnHeaders.all()) {
      await expect(header).toHaveAttribute('scope', 'col');
      await expect(header).toHaveAccessibleName(/\S/);
    }

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      // The first cell, and no other cell, is the row header, and it has a name.
      const first = row.locator(':scope > *').first();
      await expect(first, `row ${i + 1} starts with a row header`).toHaveRole(
        'rowheader',
      );
      await expect(first).toHaveAttribute('scope', 'row');
      await expect(first).toHaveAccessibleName(/\S/);
      await expect(row.getByRole('rowheader')).toHaveCount(1);
      await expect(row.locator(':scope > *')).toHaveCount(cellCount);
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
