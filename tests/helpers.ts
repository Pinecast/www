import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {expect, type Locator, type Page} from '@playwright/test';

// The text spacing of WCAG 1.4.12, as a user style sheet would apply it.
export const TEXT_SPACING = `
  * {
    line-height: 1.5 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p {
    margin-bottom: 2em !important;
  }
`;

// The path of every page in the static export (`npm run build`).
export function exportedPages(dir = 'out', prefix = ''): Array<string> {
  const pages: Array<string> = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('_')) {
        pages.push(
          ...exportedPages(join(dir, entry.name), `${prefix}/${entry.name}`),
        );
      }
    } else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
      const name = entry.name.slice(0, -'.html'.length);
      pages.push(name === 'index' ? prefix || '/' : `${prefix}/${name}`);
    }
  }
  return pages.sort();
}

// Load a page and wait until its fonts are in, so that text has its final size.
export async function load(page: Page, path: string, {spacing = false} = {}) {
  await page.goto(path);
  if (spacing) {
    await page.addStyleTag({content: TEXT_SPACING});
  }
  await page.evaluate(() => document.fonts.ready);
}

// The panel of the header menu: the part that scrolls.
export function menuPanel(page: Page): Locator {
  return page.getByRole('navigation', {name: 'Menu'});
}

// Open the header menu and wait until it has stopped growing.
export async function openMenu(page: Page): Promise<Locator> {
  const {width} = page.viewportSize()!;
  await page
    .getByRole('banner')
    .getByRole('button', {name: width > 1180 ? 'Learn' : 'Menu', exact: true})
    .click();
  const panel = menuPanel(page);
  await expect(panel).toHaveCSS('overflow-y', 'auto');
  return panel;
}

// The text under `root` that an ancestor with `overflow: hidden` or `clip`
// cuts off. Text that is hidden on purpose (screen reader text, a closed
// panel, a copy for the eye only) does not count. A scroll container does not cut text off: the
// user can scroll to it.
export async function clippedText(root: Locator): Promise<Array<string>> {
  return root.evaluate(rootElement => {
    const clipped: Array<string> = [];
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      const parent = node.parentElement;
      if (!text || !parent || parent.closest('[aria-hidden="true"], [inert]')) {
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(node);
      const box = range.getBoundingClientRect();
      if (!box.width || !box.height) {
        continue;
      }
      // Past a scroll container, the user can scroll the text into view.
      let scrollsX = false;
      let scrollsY = false;
      for (let el: Element | null = parent; el; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (
          style.clip !== 'auto' ||
          style.clipPath !== 'none' ||
          style.visibility === 'hidden'
        ) {
          break;
        }
        const clipsX = !scrollsX && /hidden|clip/.test(style.overflowX);
        const clipsY = !scrollsY && /hidden|clip/.test(style.overflowY);
        scrollsX ||= /auto|scroll/.test(style.overflowX);
        scrollsY ||= /auto|scroll/.test(style.overflowY);
        if (!clipsX && !clipsY) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (
          (clipsX &&
            (box.left < rect.left - 1 || box.right > rect.right + 1)) ||
          (clipsY && (box.top < rect.top - 1 || box.bottom > rect.bottom + 1))
        ) {
          clipped.push(text);
          break;
        }
      }
    }
    return clipped;
  });
}

export async function hasSidewaysScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

// The words in the elements of `root` that a line break splits in two. A line
// can break after a hyphen ("add-/ons"), so each part of a hyphenated word
// counts as a word.
export async function splitWords(root: Locator): Promise<Array<string>> {
  return root.evaluateAll(elements => {
    const split: Array<string> = [];
    for (const element of elements) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const match of node.textContent!.matchAll(/[^\s-]+-?/g)) {
          const range = document.createRange();
          range.setStart(node, match.index!);
          range.setEnd(node, match.index! + match[0].length);
          const lines = new Set(
            [...range.getClientRects()]
              .filter(rect => rect.width > 0)
              .map(rect => Math.round(rect.top)),
          );
          if (lines.size > 1) {
            split.push(match[0]);
          }
        }
      }
    }
    return split;
  });
}

// Wait until the page has stopped scrolling: its position stays the same for
// about 15 frames. A smooth scroll runs for some time after its cause.
export async function scrollSettled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>(resolve => {
        let last = scrollY;
        let still = 0;
        const tick = () => {
          if (scrollY === last) {
            if (++still >= 15) {
              resolve();
              return;
            }
          } else {
            still = 0;
            last = scrollY;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

// The share of the pixels that differ clearly between two screenshots of the
// same size: a channel that differs by more than 40 of 255.
export async function pixelDifference(
  page: Page,
  a: Buffer,
  b: Buffer,
): Promise<number> {
  return page.evaluate(
    async ([first, second]) => {
      const pixels = async (base64: string) => {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const bitmap = await createImageBitmap(
          new Blob([bytes], {type: 'image/png'}),
        );
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0);
        return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
      };
      const [x, y] = await Promise.all([pixels(first), pixels(second)]);
      let different = 0;
      for (let i = 0; i < x.length; i += 4) {
        if (
          Math.max(
            Math.abs(x[i] - y[i]),
            Math.abs(x[i + 1] - y[i + 1]),
            Math.abs(x[i + 2] - y[i + 2]),
          ) > 40
        ) {
          different++;
        }
      }
      return different / (x.length / 4);
    },
    [a.toString('base64'), b.toString('base64')],
  );
}
