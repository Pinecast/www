import {expect, test, type Locator, type Page} from '@playwright/test';
import {load, menuPanel} from './helpers';

// Keyboard focus checks (WCAG 2.4.7, 2.4.11, 1.4.11 and 1.4.13). Run
// `npm run build` first.
//
// Tab walks each page. At each stop, the test compares a screenshot with
// focus on the element and a screenshot without it. Enough pixels must change,
// with a contrast of at least 3:1 between the two colors, to draw a line
// around the element (see `neededPixels`). The comparison looks at the screen,
// so an indicator that an ancestor clips (overflow, clip-path, contain) or
// that a fixed part of the page covers does not count.

const WIDE = {width: 1280, height: 900};
const NARROW = {width: 375, height: 812};

const PAGES = [
  '/',
  '/features',
  '/learn',
  '/features/analytics',
  '/learn/create-a-podcast',
  '/privacy',
  '/testimonial-transcripts',
];

// The most Tab stops that a walk of one page takes.
const MAX_STOPS = 150;

const MEDIA = /\.(mp3|mp4|webm)(\?|$)/;

test.beforeEach(async ({page}) => {
  await page.route(MEDIA, route => route.abort());
  // Keep the page still, so that only focus changes the pixels.
  await page.emulateMedia({reducedMotion: 'reduce'});
});

type Box = {x: number; y: number; width: number; height: number};

type Stop = {
  name: string;
  // The part on screen of the element and its descendants: an indicator can
  // be on an inner element.
  box: Box | null;
  neededPixels: number;
  // Fixed parts of the page that are on top of some part of the element.
  coveredBy: Array<string>;
};

// Describes the element that has focus.
const describeFocus = (page: Page) =>
  page.evaluate((): Stop | null => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) {
      return null;
    }
    const text = (el.getAttribute('aria-label') || el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40);
    const name = `${el.tagName.toLowerCase()} "${text}"`;

    const clamp = (r: DOMRect): Box | null => {
      const left = Math.max(r.left, 0);
      const top = Math.max(r.top, 0);
      const right = Math.min(r.right, innerWidth);
      const bottom = Math.min(r.bottom, innerHeight);
      return right - left >= 1 && bottom - top >= 1
        ? {x: left, y: top, width: right - left, height: bottom - top}
        : null;
    };
    const rects = [el, ...Array.from(el.querySelectorAll('*'))]
      .filter(e => getComputedStyle(e).visibility !== 'hidden')
      .map(e => e.getBoundingClientRect())
      .filter(r => r.width > 1 && r.height > 1);
    const left = Math.min(...rects.map(r => r.left));
    const top = Math.min(...rects.map(r => r.top));
    const box = rects.length
      ? clamp(
          new DOMRect(
            left,
            top,
            Math.max(...rects.map(r => r.right)) - left,
            Math.max(...rects.map(r => r.bottom)) - top,
          ),
        )
      : null;

    // A line 1 CSS pixel wide around the part that has the outline, less
    // the corners that a round shape cuts off: π/4 of the perimeter of its
    // box. That part is the element, or a descendant when the element marks
    // its focus on an inner part (a card in a panel, a word in a large hit
    // area). A link that wraps has a box for each line. Its ring goes around
    // the lines, which is at least the perimeter of the longest line.
    const hasOutline = (e: Element) => {
      const style = getComputedStyle(e);
      return (
        style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      );
    };
    const ringElement = hasOutline(el)
      ? el
      : (Array.from(el.querySelectorAll('*')).find(hasOutline) ?? el);
    const lines = Array.from(ringElement.getClientRects())
      .map(clamp)
      .filter((r): r is Box => !!r);
    const ringBox = lines.length
      ? lines.reduce((a, b) => (a.width > b.width ? a : b))
      : box;
    const neededPixels = ringBox
      ? Math.round((Math.PI / 4) * 2 * (ringBox.width + ringBox.height))
      : 0;

    const coveredBy: Array<string> = [];
    if (box) {
      for (const fx of [0.1, 0.5, 0.9]) {
        for (const fy of [0.1, 0.5, 0.9]) {
          const x = box.x + box.width * fx;
          const y = box.y + box.height * fy;
          for (const hit of document.elementsFromPoint(x, y)) {
            if (hit === el || el.contains(hit) || hit.contains(el)) {
              break;
            }
            let fixed: Element | null = hit;
            while (fixed && getComputedStyle(fixed).position !== 'fixed') {
              fixed = fixed.parentElement;
            }
            if (fixed) {
              const label =
                fixed.tagName.toLowerCase() +
                (fixed.getAttribute('aria-label')
                  ? `[aria-label="${fixed.getAttribute('aria-label')}"]`
                  : '');
              if (!coveredBy.includes(label)) {
                coveredBy.push(label);
              }
              break;
            }
          }
        }
      }
    }
    return {name, box, neededPixels, coveredBy};
  });

// The number of pixels in `box` (and a margin around it) whose color differs
// between the two screenshots with a contrast of at least 3:1. The decoding
// runs in a blank page, so that it does not touch the page under test.
const contrastingPixels = async (
  decoder: Page,
  focused: Buffer,
  unfocused: Buffer,
  box: Box,
  margin = 8,
) =>
  decoder.evaluate(
    async ({a, b, box, margin}) => {
      const decode = async (base64: string) => {
        const bitmap = await createImageBitmap(
          await (await fetch(`data:image/png;base64,${base64}`)).blob(),
        );
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d')!;
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height);
      };
      const [imageA, imageB] = await Promise.all([decode(a), decode(b)]);
      const channel = (value: number) => {
        const c = value / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (data: Uint8ClampedArray, i: number) =>
        0.2126 * channel(data[i]) +
        0.7152 * channel(data[i + 1]) +
        0.0722 * channel(data[i + 2]);
      const x0 = Math.max(0, Math.floor(box.x - margin));
      const y0 = Math.max(0, Math.floor(box.y - margin));
      const x1 = Math.min(imageA.width, Math.ceil(box.x + box.width + margin));
      const y1 = Math.min(
        imageA.height,
        Math.ceil(box.y + box.height + margin),
      );
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * imageA.width + x) * 4;
          const la = luminance(imageA.data, i);
          const lb = luminance(imageB.data, i);
          if ((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) >= 3) {
            count++;
          }
        }
      }
      return count;
    },
    {
      a: focused.toString('base64'),
      b: unfocused.toString('base64'),
      box,
      margin,
    },
  );

// Wait until the page and the focused element stop moving (`scroll-behavior:
// smooth` animates the scroll to the element), and the transitions end.
const settle = async (page: Page) => {
  await page.evaluate(
    () =>
      new Promise<void>(resolve => {
        let last = '';
        let still = 0;
        let frames = 0;
        const check = () => {
          const r = document.activeElement?.getBoundingClientRect();
          const now = [scrollX, scrollY, r?.x, r?.y].join();
          still = now === last ? still + 1 : 0;
          last = now;
          if (still >= 5 || ++frames > 300) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      }),
  );
  await page.waitForTimeout(250);
};

// Marks the focused element, so that the test can find it again. Returns
// null when nothing on the page has focus.
const markFocus = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) {
      return null;
    }
    el.dataset.focusWalk ??= String(Math.random());
    return el.dataset.focusWalk;
  });

type Result = {stop: Stop; pixels: number};

// Measures the indicator of the focused element: a screenshot with focus, a
// screenshot without it, and then focus back on the element.
const measureFocus = async (
  page: Page,
  decoder: Page,
  key: string,
): Promise<Result | null> => {
  await settle(page);
  const stop = await describeFocus(page);
  if (!stop) {
    return null;
  }
  if (!stop.box) {
    return {stop, pixels: 0};
  }
  const focused = await page.screenshot();
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await settle(page);
  const unfocused = await page.screenshot();
  // After a key press, focus from a script also matches :focus-visible.
  await page.evaluate(
    k =>
      document
        .querySelector<HTMLElement>(`[data-focus-walk="${k}"]`)!
        .focus({preventScroll: true}),
    key,
  );
  const pixels = await contrastingPixels(decoder, focused, unfocused, stop.box);
  return {stop, pixels};
};

// Tab through the page, and measure the indicator at each stop.
const walk = async (
  page: Page,
  decoder: Page,
  {within}: {within?: string} = {},
): Promise<Array<Result>> => {
  const results: Array<Result> = [];
  const seen = new Set<string>();
  for (let i = 0; i < MAX_STOPS; i++) {
    await page.keyboard.press('Tab');
    const key = await markFocus(page);
    if (!key || seen.has(key)) {
      // Focus left the page, or came back around (a modal menu).
      break;
    }
    seen.add(key);
    if (
      within &&
      !(await page.evaluate(
        sel => !!document.activeElement?.closest(sel),
        within,
      ))
    ) {
      continue;
    }
    const result = await measureFocus(page, decoder, key);
    if (!result) {
      break;
    }
    results.push(result);
  }
  return results;
};

// Shift+Tab back through the page. The browser scrolls each element to the
// top of the viewport, where the fixed header and logo are.
const walkBack = async (page: Page): Promise<Array<Stop>> => {
  const stops: Array<Stop> = [];
  const seen = new Set<string>();
  for (let i = 0; i < MAX_STOPS; i++) {
    await page.keyboard.press('Shift+Tab');
    const key = await markFocus(page);
    if (!key || seen.has(key)) {
      break;
    }
    seen.add(key);
    await settle(page);
    const stop = await describeFocus(page);
    if (!stop) {
      break;
    }
    stops.push(stop);
  }
  return stops;
};

const problems = (results: Array<Result>) =>
  results.flatMap(({stop, pixels}) => [
    ...(stop.box ? [] : [`${stop.name}: has no box on screen`]),
    ...(stop.box && pixels < stop.neededPixels
      ? [`${stop.name}: ${pixels} of ${stop.neededPixels} pixels change`]
      : []),
    ...stop.coveredBy.map(what => `${stop.name}: covered by ${what}`),
  ]);

for (const viewport of [WIDE, NARROW]) {
  test.describe(`at ${viewport.width}px`, () => {
    test.use({viewport});

    for (const path of PAGES) {
      test(`${path}: each Tab stop has a clear indicator that nothing covers`, async ({
        page,
        context,
      }) => {
        test.setTimeout(300_000);
        const decoder = await context.newPage();
        await load(page, path);
        const results = await walk(page, decoder);
        expect(results.length).toBeGreaterThan(5);
        expect(problems(results)).toEqual([]);

        // Focus left the page after the last stop. Come back from the end.
        const back = await walkBack(page);
        expect(back.length).toBeGreaterThan(5);
        expect(
          back.flatMap(stop =>
            stop.coveredBy.map(what => `${stop.name}: covered by ${what}`),
          ),
        ).toEqual([]);
      });
    }

    test('the open menu: each Tab stop has a clear indicator', async ({
      page,
      context,
    }) => {
      test.setTimeout(120_000);
      const decoder = await context.newPage();
      await load(page, '/privacy');
      // Open the menu with the keyboard, as a keyboard user does.
      await page
        .getByRole('banner')
        .getByRole('button', {
          name: viewport.width > 1180 ? 'Learn' : 'Menu',
          exact: true,
        })
        .focus();
      await page.keyboard.press('Enter');
      await expect(menuPanel(page)).toHaveCSS('overflow-y', 'auto');
      // The menu moves focus to its first link. Walk from the last one, so
      // that the first Tab goes to the first link.
      await page.keyboard.press('Shift+Tab');
      const results = await walk(page, decoder, {within: '#site-menu'});
      expect(results.length).toBeGreaterThan(5);
      expect(problems(results)).toEqual([]);
    });
  });
}

test.describe('a mouse click', () => {
  test.use({viewport: WIDE});

  // Only keyboard focus shows the ring. A mouse user sees no change.
  test('shows no focus ring', async ({page}) => {
    await load(page, '/');
    // Stay on the page: the test clicks links.
    await page.evaluate(() =>
      document.addEventListener('click', evt => evt.preventDefault(), true),
    );
    const banner = page.getByRole('banner');
    const main = page.locator('main');
    const targets: Array<Locator> = [
      page.getByRole('link', {name: 'Return home'}),
      banner.getByRole('link', {name: 'Features'}),
      banner.getByRole('link', {name: 'Sign in'}),
      banner.getByRole('link', {name: 'Sign up'}),
      main.getByRole('link', {name: 'Start for free'}).first(),
      main.getByRole('link', {name: 'Sign up'}).first(),
      main.getByRole('link', {name: 'See what’s included'}).first(),
    ];
    for (const target of targets) {
      await target.click();
      await expect(target).toBeFocused();
      expect(
        await target.evaluate(el => ({
          focusVisible: el.matches(':focus-visible'),
          outline: getComputedStyle(el).outlineStyle,
        })),
      ).toEqual({focusVisible: false, outline: 'none'});
    }
  });
});

test.describe('the mute tooltip', () => {
  test.use({viewport: WIDE});

  // The tooltip shows only after the sounds load, so let them load.
  test.beforeEach(async ({page}) => {
    await page.unroute(MEDIA);
  });

  const tooltip = (page: Page) => page.getByRole('banner').getByRole('tooltip');
  const muteButton = (page: Page, name = 'Unmute') =>
    page.getByRole('banner').getByRole('button', {name, exact: true});

  test('shows on keyboard focus, describes the button and hides on Escape', async ({
    page,
  }) => {
    await load(page, '/privacy');
    const mute = muteButton(page);
    await expect(mute).toHaveAccessibleDescription(
      'This site is better with sound!',
    );
    await expect(tooltip(page)).toBeHidden();

    // Tab to it: the skip link, the logo and then the mute button.
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
    }
    await expect(mute).toBeFocused();
    await expect(tooltip(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(tooltip(page)).toBeHidden();
    await expect(mute).toBeFocused();

    // It shows again when focus comes back.
    await page.keyboard.press('Tab');
    await expect(tooltip(page)).toBeHidden();
    await page.keyboard.press('Shift+Tab');
    await expect(mute).toBeFocused();
    await expect(tooltip(page)).toBeVisible();
  });

  test('shows on hover, stays while the pointer is on it, and hides on Escape', async ({
    page,
  }) => {
    await load(page, '/privacy');
    await muteButton(page).hover();
    await expect(tooltip(page)).toBeVisible();
    await tooltip(page).hover();
    await expect(tooltip(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(tooltip(page)).toBeHidden();

    await page.mouse.move(640, 600);
    await muteButton(page).hover();
    await expect(tooltip(page)).toBeVisible();
  });

  test('does not show when a mouse click gives the button focus', async ({
    page,
  }) => {
    await load(page, '/privacy');
    await muteButton(page).click();
    await page.mouse.move(640, 600);
    // Sound is on now: the tooltip and the description are gone.
    const mute = muteButton(page, 'Mute');
    await expect(mute).toBeFocused();
    await expect(tooltip(page)).toHaveCount(0);
    await expect(mute).not.toHaveAttribute('aria-describedby');
  });
});

test.describe('the testimonial player', () => {
  for (const viewport of [WIDE, NARROW]) {
    test(`at ${viewport.width}px, its button has a name and a clear indicator`, async ({
      page,
      context,
    }) => {
      await page.setViewportSize(viewport);
      const decoder = await context.newPage();
      await load(page, '/');
      // The player shows while a customer is at the middle of the viewport.
      await page
        .locator('#testimonials h3', {hasText: 'Living Blindfully'})
        .last()
        .evaluate(el => {
          const r = el.getBoundingClientRect();
          window.scrollTo({
            top: scrollY + r.top + r.height / 2 - innerHeight / 2,
            behavior: 'instant',
          });
        });
      // The player scrubs its animation on scroll events, and it appears
      // after the first one. Scroll a little more, as a user does.
      await page.waitForTimeout(500);
      for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, 4);
        await page.waitForTimeout(300);
      }
      const play = page.getByRole('button', {
        name: 'Play Living Blindfully testimonial',
      });
      await expect(play).toBeVisible();

      // A key press first, so that the focus from the script is a keyboard
      // focus. Do not scroll: the player exists only at this position.
      await page.keyboard.press('Shift');
      await play.evaluate(el => el.focus({preventScroll: true}));
      await expect(play).toBeFocused();
      const key = (await markFocus(page))!;
      const result = (await measureFocus(page, decoder, key))!;
      expect(problems([result])).toEqual([]);
    });
  }
});
