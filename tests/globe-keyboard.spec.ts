import {expect, test, type Page} from '@playwright/test';
import {load, scrollSettled} from './helpers';

// The keyboard path through the globe on the home page. Tab goes to the
// "Learn more" link of each feature, once, and the page scrolls to the feature
// of the link, so that the globe and the text match. The links on the globe
// (Distribution, Analytics, Monetization) are not in the tab order. Run
// `npm run build` first.

const SLUGS = ['distribution', 'analytics', 'monetization'] as const;
type Slug = (typeof SLUGS)[number];

// The scroll progress at which each feature shows: FEATURE_SCROLL_RANGES in
// Globe.tsx. The progress is the same as that of useScrollProgressEffect.
const RANGES: Record<Slug, [number, number]> = {
  distribution: [0.3, 0.6],
  analytics: [0.6, 0.85],
  monetization: [0.85, 1],
};

const WINDOWS = [
  {width: 1280, height: 800},
  {width: 375, height: 667},
  // Taller than about 1190px, the link of "Analytics" on the globe scrolls to
  // a place where Distribution shows. The keyboard path must not.
  {width: 834, height: 1195},
];

test.beforeEach(async ({page}) => {
  await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
});

const SECTION = 'section:has(#distribution)';

const learnMoreLinks = (page: Page) =>
  page.locator(SECTION).getByRole('link', {name: 'Learn more'});

const globeLink = (page: Page, slug: Slug) =>
  page.locator(`text a[href$="#${slug}"]`);

const scrollProgress = (page: Page) =>
  page.evaluate(selector => {
    const section = document.querySelector<HTMLElement>(selector)!;
    const start =
      section.offsetTop < innerHeight ? 0 : section.offsetTop - innerHeight;
    return (scrollY - start) / section.offsetHeight;
  }, SECTION);

const focusIsInGlobe = (page: Page) =>
  page.evaluate(
    selector => !!document.activeElement?.closest(selector),
    SECTION,
  );

// Put focus on the last control before the globe, as a keyboard user has it.
async function focusBeforeGlobe(page: Page) {
  await page.keyboard.press('Shift');
  await page
    .locator(SECTION)
    .getByRole('link', {name: 'Discover features'})
    .focus();
}

// The globe shows this feature, and the page is in the middle of its range.
async function expectFeatureShows(page: Page, slug: Slug) {
  await scrollSettled(page);
  for (const other of SLUGS) {
    const link = globeLink(page, other);
    if (other === slug) {
      await expect(link, slug).toHaveAttribute('aria-current', 'true');
    } else {
      await expect(link, `${slug}: ${other}`).not.toHaveAttribute(
        'aria-current',
      );
    }
  }
  const [first, last] = RANGES[slug];
  const progress = await scrollProgress(page);
  expect(progress, slug).toBeGreaterThan(first + 0.05);
  expect(progress, slug).toBeLessThan(last - 0.05);
}

for (const viewport of WINDOWS) {
  test.describe(`at ${viewport.width} by ${viewport.height}`, () => {
    test.use({viewport});

    test('Tab goes to the "Learn more" link of each feature once, and the globe shows the feature of the link', async ({
      page,
    }) => {
      await load(page, '/');
      await focusBeforeGlobe(page);
      // Record each element that gets focus.
      await page.evaluate(() => {
        (window as any).focused = [];
        document.addEventListener('focusin', evt =>
          (window as any).focused.push(
            (evt.target as Element).closest('svg') ? 'globe' : 'other',
          ),
        );
      });

      const links = learnMoreLinks(page);
      await expect(links).toHaveCount(3);
      for (const [i, slug] of SLUGS.entries()) {
        await page.keyboard.press('Tab');
        await expect(links.nth(i), slug).toBeFocused();
        await expectFeatureShows(page, slug);
        await expect(links.nth(i), slug).toBeInViewport({ratio: 1});
      }

      // The next Tab leaves the globe. It does not go to a link on it.
      await page.keyboard.press('Tab');
      expect(await focusIsInGlobe(page)).toBe(false);
      expect(await page.evaluate(() => (window as any).focused)).toEqual([
        'other',
        'other',
        'other',
        'other',
      ]);

      // Shift+Tab goes back through the features in the other order.
      for (const [i, slug] of [...SLUGS.entries()].reverse()) {
        await page.keyboard.press('Shift+Tab');
        await expect(links.nth(i), slug).toBeFocused();
        await expectFeatureShows(page, slug);
      }
    });
  });
}

test('the links on the globe are links that the keyboard skips', async ({
  page,
}) => {
  await load(page, '/');
  for (const slug of SLUGS) {
    const link = globeLink(page, slug);
    await expect(link, slug).toHaveAttribute('tabindex', '-1');
    await expect(link, slug).toHaveAttribute('href', new RegExp(`#${slug}$`));
    // A screen reader still finds them.
    await expect(link, slug).not.toHaveAttribute('aria-hidden');
  }
});

// Scroll at once, with no animation, under reduced motion and while motion is
// paused. Without either, the scroll is smooth, as the scroll of a link that
// the pointer follows is.
const MODES = [
  {name: 'with motion playing', smooth: true},
  {
    name: 'under reduced motion',
    smooth: false,
    reducedMotion: 'reduce' as const,
  },
  {
    name: 'while motion is paused',
    smooth: false,
    stored: 'paused',
  },
  {
    name: 'under reduced motion, after a choice to play',
    smooth: false,
    reducedMotion: 'reduce' as const,
    stored: 'playing:reduce',
  },
];

for (const {name, smooth, reducedMotion, stored} of MODES) {
  test(`the scroll to a feature is ${smooth ? 'smooth' : 'at once'} ${name}`, async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: reducedMotion ?? 'no-preference'});
    if (stored) {
      await page.addInitScript(
        value => localStorage.setItem('motion', value),
        stored,
      );
    }
    await load(page, '/');
    await focusBeforeGlobe(page);
    // The focus above can start a smooth scroll of the browser. Wait until the
    // page is at rest, so that the positions below are only those of Tab.
    await scrollSettled(page);
    await page.evaluate(() => {
      (window as any).positions = [];
      addEventListener(
        'scroll',
        () => (window as any).positions.push(Math.round(scrollY)),
        {passive: true},
      );
    });
    for (const [i, slug] of SLUGS.entries()) {
      await page.evaluate(() => ((window as any).positions = []));
      await page.keyboard.press('Tab');
      await expect(learnMoreLinks(page).nth(i), slug).toBeFocused();
      await expectFeatureShows(page, slug);
      const positions = await page.evaluate(
        () => new Set<number>((window as any).positions).size,
      );
      // A smooth scroll has many positions. One that is at once has the one
      // that it goes to, and at most the one of the scroll that the browser
      // does to show the link.
      if (smooth) {
        expect(positions, slug).toBeGreaterThan(5);
      } else {
        expect(positions, slug).toBeLessThanOrEqual(2);
      }
    }
  });
}

test.describe('the mouse', () => {
  test('pressing a "Learn more" link does not scroll the page', async ({
    page,
  }) => {
    await load(page, '/');
    await page
      .locator('#analytics')
      .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));
    await scrollSettled(page);
    const scrollY = await page.evaluate(() => window.scrollY);
    const link = learnMoreLinks(page).first();
    // The link of the first feature is not the one that shows. Press the link
    // of Analytics, which shows, and hold the button, so that the link is not
    // followed.
    const box = (await learnMoreLinks(page).nth(1).boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.down();
    await expect(learnMoreLinks(page).nth(1)).toBeFocused();
    await scrollSettled(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    await page.mouse.move(640, 5);
    await page.mouse.up();
    await expect(link).toHaveCount(1);
  });

  test('a link on the globe still scrolls to its anchor', async ({page}) => {
    await load(page, '/');
    await page
      .locator('#distribution')
      .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));
    await scrollSettled(page);
    const box = (await globeLink(page, 'monetization').boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await scrollSettled(page);
    await expect(globeLink(page, 'monetization')).toHaveAttribute(
      'aria-current',
      'true',
    );
    // The anchor is at the top of the window.
    expect(
      await page
        .locator('#monetization')
        .evaluate(anchor => Math.round(anchor.getBoundingClientRect().top)),
    ).toBe(0);
  });
});

// When the window gets focus again, the link that had focus gets a focus event.
// The user may have scrolled away since, so it must not move the page.
test('focus that Tab did not give does not scroll the page', async ({page}) => {
  await load(page, '/');
  await page
    .locator('#distribution')
    .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));
  await scrollSettled(page);
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Shift');
  await learnMoreLinks(page).nth(2).focus();
  await expect(learnMoreLinks(page).nth(2)).toBeFocused();
  await scrollSettled(page);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
});
