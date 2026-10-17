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
  {width: 853, height: 533},
  {width: 768, height: 640},
  {width: 720, height: 450},
  {width: 701, height: 800},
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
      test(`fits at ${viewport.width}x${viewport.height}${
        spacing ? ' with larger text spacing' : ''
      }`, async ({page}) => {
        await page.setViewportSize(viewport);
        await load(page, '/', {spacing});

        const boxes: Array<Box> = [];
        for (const link of await legalLinks(page)) {
          const name = (await link.innerText()).trim();
          await link.scrollIntoViewIfNeeded();
          const {box, row, lines} = await link.evaluate(el => {
            // The rectangles of the text of the link. A label can have more
            // than one text node (a part of it can be hidden on a narrow
            // window), so a rectangle that starts below the line before it
            // starts a new line.
            const rects: Array<DOMRect> = [];
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const range = document.createRange();
              range.selectNodeContents(node);
              rects.push(
                ...[...range.getClientRects()].filter(r => r.width > 0),
              );
            }
            rects.sort((a, b) => a.top - b.top);
            let lines = 0;
            let lineBottom = -Infinity;
            for (const r of rects) {
              if (r.top >= lineBottom - 1) {
                lines += 1;
              }
              lineBottom = Math.max(lineBottom, r.bottom);
            }
            const {left, right, top, bottom} = el.getBoundingClientRect();
            const rowBox = el.parentElement!.getBoundingClientRect();
            return {
              box: {left, right, top, bottom},
              row: {left: rowBox.left, right: rowBox.right},
              lines,
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

// The logotype of the footer is a background image. It must be clear of every
// text of the footer, also of the legal row, which wraps to more lines on a
// phone and with larger text spacing. A row of three lines once ran into the
// logotype, because the logotype stood at a fixed distance from the bottom of
// the card, and the row grew up into it.
//
// An element's box is not the box of its background image, so this works out
// where the image is painted from the styles of the element. It does not know
// any text or address. It finds the logotype as the one element of the footer
// with an image for a background.
//
// The windows below are the ones that broke it. On a window from 701px wide,
// the logotype once stood at a fixed distance from the bottom of the card, and
// the height of the card follows the height of the window. On a short window,
// the links moved down onto the logotype. The list has a short window of each
// width, and the windows of a zoomed browser: a browser at 150% zoom is 853px
// wide in CSS pixels on a 1280px screen, and at 200% zoom it is 720px wide on a
// 1440px screen and 960px wide on a 1920px screen.
const LOGOTYPE_VIEWPORTS = [
  {width: 1440, height: 900},
  {width: 1280, height: 720},
  {width: 960, height: 540},
  {width: 853, height: 533},
  {width: 768, height: 640},
  {width: 720, height: 450},
  {width: 701, height: 800},
  {width: 700, height: 800},
  {width: 375, height: 667},
  {width: 320, height: 640},
];

// Vertical extent, in CSS pixels from the top of the viewport.
type Span = {top: number; bottom: number};

async function footerLayout(page: Page) {
  return page.getByRole('contentinfo').evaluate(async footer => {
    // An element that is not shown (`display: none`) paints nothing.
    const painted = [footer, ...footer.querySelectorAll<HTMLElement>('*')]
      .filter(el => /url\(/.test(getComputedStyle(el).backgroundImage))
      .filter(el => el.getClientRects().length > 0)
      .map(el => el as HTMLElement);
    if (painted.length !== 1) {
      throw new Error(
        `The footer has ${painted.length} elements with a background image. ` +
          'This test expects one: the logotype. If you changed the logotype, ' +
          'change how this test finds it.',
      );
    }
    const holder = painted[0];
    const style = getComputedStyle(holder);
    if (style.backgroundOrigin !== 'padding-box') {
      throw new Error(
        `Unsupported background-origin: ${style.backgroundOrigin}`,
      );
    }

    // The height of one tile of the image.
    const image = new Image();
    image.src = /url\(["']?([^"')]+)["']?\)/.exec(style.backgroundImage)![1];
    await image.decode();
    const [sizeX, sizeY = 'auto'] = style.backgroundSize.split(' ');
    let tileHeight: number;
    if (sizeY.endsWith('px')) {
      tileHeight = parseFloat(sizeY);
    } else if (sizeX.endsWith('px')) {
      tileHeight =
        (image.naturalHeight * parseFloat(sizeX)) / image.naturalWidth;
    } else if (sizeX === 'auto') {
      tileHeight = image.naturalHeight;
    } else {
      throw new Error(`Unsupported background-size: ${style.backgroundSize}`);
    }

    // The offset of the tile. A percentage in a position is a share of the
    // room that the image leaves, so a probe in a box of that height gives the
    // offset for each value that CSS allows, also a calc().
    const area = holder.getBoundingClientRect();
    const areaTop = area.top + holder.clientTop;
    const probeBox = document.createElement('div');
    probeBox.style.cssText = `position: absolute; visibility: hidden; width: 1px; height: ${
      holder.clientHeight - tileHeight
    }px`;
    const probe = document.createElement('div');
    probe.style.cssText = `position: absolute; width: 1px; height: 0; top: ${style.backgroundPositionY}`;
    probeBox.append(probe);
    document.body.append(probeBox);
    const offset = probe.offsetTop;
    probeBox.remove();
    const logotype: Span = {
      top: areaTop + offset,
      bottom: areaTop + offset + tileHeight,
    };

    // The row with the © line, as in legalLinks().
    const copyright = [...footer.querySelectorAll('*')].find(
      el => el.children.length === 0 && el.textContent?.includes('©'),
    );
    if (!copyright?.parentElement) {
      throw new Error('The footer has no © line.');
    }
    const rowBox = copyright.parentElement.getBoundingClientRect();

    // Each line of each text of the footer.
    const texts: Array<Span & {text: string}> = [];
    const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (!text) {
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const {top, bottom, width} of range.getClientRects()) {
        if (width > 0) {
          texts.push({text, top, bottom});
        }
      }
    }
    return {
      logotype,
      row: {top: rowBox.top, bottom: rowBox.bottom} as Span,
      texts,
    };
  });
}

test.describe('footer: the logotype', () => {
  for (const viewport of LOGOTYPE_VIEWPORTS) {
    for (const spacing of [false, true]) {
      test(`is clear of the text at ${viewport.width}x${viewport.height}${
        spacing ? ' with larger text spacing' : ''
      }`, async ({page}) => {
        await page.setViewportSize(viewport);
        await load(page, '/', {spacing});

        const {logotype, row, texts} = await footerLayout(page);
        expect(
          logotype.bottom - logotype.top,
          'the logotype has a height',
        ).toBeGreaterThan(0);

        // At least one pixel between the logotype and the text: not touching.
        const clear = (span: Span) =>
          span.bottom + 1 <= logotype.top || span.top - 1 >= logotype.bottom;
        expect(
          clear(row),
          `the legal row (${row.top} to ${row.bottom}) is clear of the logotype (${logotype.top} to ${logotype.bottom})`,
        ).toBe(true);
        expect(
          texts.filter(text => !clear(text)).map(text => text.text),
          'the text that touches the logotype',
        ).toEqual([]);
      });
    }
  }
});

// Under 1181px, the floating mute button covers the bottom left of the screen.
// At the end of the page, the page cannot scroll a link out from under it, so
// no link of the footer may be there (WCAG 2.4.11, and a link that a pointer
// cannot reach is a defect in any case).
//
// When the legal row wraps, a link starts a line at the left of the card. With
// the text spacing of WCAG 1.4.12 it once wrapped from 701px to about 785px,
// and at 720x450 (200% zoom), and the button covered the start of that link.
const MUTE_BUTTON_VIEWPORTS = [
  {width: 1180, height: 800},
  {width: 853, height: 533},
  {width: 785, height: 800},
  {width: 768, height: 640},
  {width: 720, height: 450},
  {width: 701, height: 800},
  {width: 700, height: 800},
  {width: 390, height: 844},
  {width: 375, height: 667},
  {width: 320, height: 568},
];

test.describe('footer: links at the end of the page', () => {
  for (const viewport of MUTE_BUTTON_VIEWPORTS) {
    for (const spacing of [false, true]) {
      test(`are not under the mute button at ${viewport.width}x${
        viewport.height
      }${spacing ? ' with larger text spacing' : ''}`, async ({page}) => {
        await page.setViewportSize(viewport);
        await load(page, '/', {spacing});
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
