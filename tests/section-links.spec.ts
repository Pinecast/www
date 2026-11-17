import {readFileSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';
import {SCROLL_PADDING_TOP} from '../src/constants';
import {exportedPages, headingsFitted} from './helpers';

// A link to a section of a page (`/terms#spotify`, which the dashboard links
// to) must land with the section in view, below the fixed header, on the first
// load. `html {scroll-behavior: smooth}` made the browser choose where the
// scroll ends while the page was still loading. A change of height above the
// target after that (a note that shows after hydration, a font, a heading that
// fits its words) left the target too low, or off screen at 400% zoom.
// src/hooks/useSmoothScroll.ts turns smooth scrolling on after the load.
//
// This finds its pages and targets by structure: the pages of the export that
// have a heading with an id, and the last such heading of each (the one that
// needs the longest scroll). It knows no copy and no address.

const headingsWithId = (path: string) => {
  const file = path.endsWith('/') ? `${path}index` : path;
  const html = readFileSync(`out${file}.html`, 'utf8');
  return [...html.matchAll(/<h[1-6][^>]*\sid="([^"]+)"/g)].map(m => m[1]);
};

const pagesWithSections = exportedPages().filter(
  path => headingsWithId(path).length > 0,
);

const VIEWPORTS = [
  {width: 1280, height: 720},
  {width: 375, height: 812},
  // 400% zoom of 1280×1024 (WCAG 1.4.10).
  {width: 320, height: 256},
];

// Where the page is while the target is in view: it ends on a position that
// does not change.
async function settled(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await headingsFitted(page);
  await page.waitForLoadState('load');
  await expect
    .poll(async () => {
      const before = await page.evaluate(() => window.scrollY);
      await page.waitForTimeout(250);
      return (await page.evaluate(() => window.scrollY)) === before;
    })
    .toBe(true);
}

test.describe('links to a section of a page', () => {
  test('the export has pages with sections to link to', () => {
    expect(pagesWithSections.length).toBeGreaterThan(0);
  });

  for (const viewport of VIEWPORTS) {
    for (const path of pagesWithSections) {
      test(`${path} lands in view at ${viewport.width}×${viewport.height}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        const id = headingsWithId(path).at(-1)!;

        const landing = async (reducedMotion: 'reduce' | 'no-preference') => {
          await page.emulateMedia({reducedMotion});
          await page.goto('about:blank');
          await page.goto(`${path}#${id}`);
          await settled(page);
          return page.evaluate(id => {
            const {top} = document.getElementById(id)!.getBoundingClientRect();
            return {top, scrollY: window.scrollY};
          }, id);
        };

        // Without smooth scrolling, the browser keeps the target in place
        // while the page loads. The first load must land there too.
        const instant = await landing('reduce');
        const smooth = await landing('no-preference');

        // The page scrolled to it, the fixed header does not cover it, and
        // its start is on the screen. (A heading can wrap to more lines than
        // 256px have room for, so its end can be below the screen.)
        expect(smooth.scrollY).toBeGreaterThan(0);
        expect(smooth.top).toBeGreaterThanOrEqual(SCROLL_PADDING_TOP - 1);
        expect(smooth.top).toBeLessThan(viewport.height);
        expect(smooth.top).toBeCloseTo(instant.top, -1);
      });
    }
  }

  // A <Link> to the section of another page: Next.js scrolls as the new page
  // renders, and the page grows after that.
  for (const viewport of VIEWPORTS) {
    test(`a visit in the browser lands in view at ${viewport.width}×${viewport.height}`, async ({
      page,
    }) => {
      const [from, to] = pagesWithSections;
      const id = headingsWithId(to).at(-1)!;
      await page.setViewportSize(viewport);

      const landing = async (reducedMotion: 'reduce' | 'no-preference') => {
        await page.emulateMedia({reducedMotion});
        await page.goto(from);
        await settled(page);
        await page.evaluate(
          ([path, id]) =>
            (
              window as unknown as {
                next: {router: {push: (url: string) => Promise<boolean>}};
              }
            ).next.router.push(`${path}#${id}`),
          [to, id],
        );
        await page.waitForFunction(id => !!document.getElementById(id), id);
        await settled(page);
        return page.evaluate(id => {
          const {top} = document.getElementById(id)!.getBoundingClientRect();
          return {top, scrollY: window.scrollY};
        }, id);
      };

      const instant = await landing('reduce');
      const smooth = await landing('no-preference');
      expect(smooth.scrollY).toBeGreaterThan(0);
      expect(smooth.top).toBeGreaterThanOrEqual(SCROLL_PADDING_TOP - 1);
      expect(smooth.top).toBeLessThan(viewport.height);
      expect(smooth.top).toBeCloseTo(instant.top, -1);
    });
  }

  test('a jump in the page after the load scrolls smoothly', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto(pagesWithSections[0]);
    await settled(page);
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'smooth');
  });

  test('with reduced motion, nothing scrolls smoothly', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto(pagesWithSections[0]);
    await settled(page);
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  });
});
