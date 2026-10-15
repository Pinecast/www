import {expect, test, type Locator, type Page} from '@playwright/test';
import {hasSidewaysScroll, load} from './helpers';

// The legal row at the bottom of the footer (the © line and its links) has to
// fit on a phone, and no link in it may be under the floating mute button.
//
// These tests do not know the text or the address of any link. They find the
// row by its © line and check each link in it. A person who adds, removes or
// renames a link does not break them. Only a layout that does not work does.

const VIEWPORTS = [
  {width: 1280, height: 800},
  {width: 390, height: 844},
  {width: 320, height: 640},
];

// Each link in the row with the © line.
async function legalLinks(page: Page): Promise<Array<Locator>> {
  const links = page
    .getByRole('contentinfo')
    .getByText('©')
    .locator('..')
    .getByRole('link');
  const count = await links.count();
  expect(count, 'the footer row with the © line has links').toBeGreaterThan(0);
  return Array.from({length: count}, (_, i) => links.nth(i));
}

test.describe('footer: the legal row', () => {
  for (const viewport of VIEWPORTS) {
    for (const spacing of [false, true]) {
      test(`fits at ${viewport.width}px${
        spacing ? ' with larger text spacing' : ''
      }`, async ({page}) => {
        await page.setViewportSize(viewport);
        await load(page, '/', {spacing});

        const boxes: Array<Box> = [];
        for (const link of await legalLinks(page)) {
          const name = (await link.innerText()).trim();
          await link.scrollIntoViewIfNeeded();
          const {box, row, lines} = await link.evaluate(el => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const {left, right, top, bottom} = el.getBoundingClientRect();
            const rowBox = el.parentElement!.getBoundingClientRect();
            return {
              box: {left, right, top, bottom},
              row: {left: rowBox.left, right: rowBox.right},
              // One rectangle for each line of text.
              lines: range.getClientRects().length,
            };
          });
          // A label stays whole: it does not break into two lines.
          expect(lines, `${name} is on one line`).toBe(1);
          // Inside the row: not cut off, and not over its edge.
          expect(
            box.left,
            `${name} starts inside the row`,
          ).toBeGreaterThanOrEqual(row.left);
          expect(box.right, `${name} ends inside the row`).toBeLessThanOrEqual(
            row.right,
          );
          boxes.push(box);
        }
        expect(await hasSidewaysScroll(page)).toBe(false);
        expectTargetSpacing(boxes);
      });
    }
  }
});

// Under 1181px, the floating mute button covers the bottom left of the screen.
// At the end of the page, the page cannot scroll a link out from under it, so
// no link of the footer may be there (WCAG 2.4.11, and a link that a pointer
// cannot reach is a defect in any case).
const MUTE_BUTTON_VIEWPORTS = [
  {width: 1180, height: 800},
  {width: 700, height: 800},
  {width: 390, height: 844},
  {width: 375, height: 667},
  {width: 320, height: 568},
];

test.describe('footer: links at the end of the page', () => {
  for (const viewport of MUTE_BUTTON_VIEWPORTS) {
    test(`are not under the mute button at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/');
      await page.evaluate(() =>
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'instant',
        }),
      );
      // The button is smaller once the page has scrolled.
      const muteButton = page.locator('[data-mute-button] button');
      await expect(muteButton).toBeVisible();
      await expect
        .poll(async () => (await muteButton.boundingBox())?.height)
        .toBe(48);

      for (const link of await legalLinks(page)) {
        const name = (await link.innerText()).trim();
        const covered = await link.evaluate(el => {
          const {left, right, top, bottom} = el.getBoundingClientRect();
          const points = [
            [left + 1, top + 1],
            [right - 1, top + 1],
            [(left + right) / 2, (top + bottom) / 2],
            [left + 1, bottom - 1],
            [right - 1, bottom - 1],
          ];
          return points.filter(([x, y]) => {
            const hit = document.elementFromPoint(x, y);
            return !hit || !(hit === el || el.contains(hit));
          }).length;
        });
        expect(covered, `${name} has points that something covers`).toBe(0);
        // The circle of a small target does not meet the button (2.5.8).
        const buttonBox = (await muteButton.boundingBox())!;
        const linkBox = (await link.boundingBox())!;
        const cx = linkBox.x + linkBox.width / 2;
        const cy = linkBox.y + linkBox.height / 2;
        const dx = Math.max(
          buttonBox.x - cx,
          0,
          cx - (buttonBox.x + buttonBox.width),
        );
        const dy = Math.max(
          buttonBox.y - cy,
          0,
          cy - (buttonBox.y + buttonBox.height),
        );
        expect(
          Math.hypot(dx, dy),
          `the circle of ${name} does not meet the mute button`,
        ).toBeGreaterThanOrEqual(12);
      }
    });
  }
});

type Box = {left: number; right: number; top: number; bottom: number};

// WCAG 2.5.8 (Target Size, Minimum): a target is 24 by 24 CSS pixels or more.
// A smaller target is fine when a circle of 24px that is centered on it meets
// no other target and no circle of another small target.
function expectTargetSpacing(boxes: Array<Box>) {
  const small = (b: Box) => b.right - b.left < 24 || b.bottom - b.top < 24;
  const center = (b: Box) => ({
    x: (b.left + b.right) / 2,
    y: (b.top + b.bottom) / 2,
  });
  boxes.forEach((a, i) => {
    boxes.forEach((b, j) => {
      if (i === j || !small(a)) {
        return;
      }
      const ca = center(a);
      if (small(b)) {
        const cb = center(b);
        expect(
          Math.hypot(ca.x - cb.x, ca.y - cb.y),
          `the circles of targets ${i} and ${j} do not meet`,
        ).toBeGreaterThanOrEqual(24);
      } else {
        // The distance from the center to the nearest point of the target.
        const dx = Math.max(b.left - ca.x, 0, ca.x - b.right);
        const dy = Math.max(b.top - ca.y, 0, ca.y - b.bottom);
        expect(
          Math.hypot(dx, dy),
          `the circle of target ${i} does not meet target ${j}`,
        ).toBeGreaterThanOrEqual(12);
      }
    });
  });
}
