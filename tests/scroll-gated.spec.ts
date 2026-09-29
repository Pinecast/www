import {expect, test, type Locator, type Page} from '@playwright/test';
import {load} from './helpers';

// The globe and the testimonials on the home page show one feature or one
// customer at a time, as the page scrolls. Their controls must be in the page
// and in the focus order at every scroll position (WCAG 1.3.2 and 2.4.3), and
// the part with focus must show. Run `npm run build` first.

const WIDE = {width: 1280, height: 800};
const NARROW = {width: 375, height: 667};

const SLUGS = ['distribution', 'analytics', 'monetization'];

test.beforeEach(async ({page}) => {
  await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
});

// How visible an element is: its opacity times that of its ancestors.
const shownOpacity = (locator: Locator) =>
  locator.evaluate(el => {
    let opacity = 1;
    for (let e: Element | null = el; e; e = e.parentElement) {
      opacity *= Number(getComputedStyle(e).opacity);
    }
    return opacity;
  });

// The "Learn more" links under the globe, in the order of the features.
const learnMoreLinks = (page: Page) =>
  page
    .locator('section:has(#distribution)')
    .getByRole('link', {name: 'Learn more'});

const scrollToAnchor = (page: Page, slug: string) =>
  page
    .locator(`#${slug}`)
    .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));

// On a narrow screen the links are at the bottom of the sticky stage of the
// globe, under the floating mute button. A scroll cannot move them clear of
// it: the browser scrolled the page by a screen at each Tab, and the link
// stayed where it was.
test('at 375px, a "Learn more" link with focus is clear of the mute button, and Tab does not scroll the page', async ({
  page,
}) => {
  await page.setViewportSize(NARROW);
  await load(page, '/');
  await scrollToAnchor(page, 'distribution');
  const mute = page.getByRole('button', {name: /^(Unmute|Mute)$/});
  await expect(mute).toBeVisible();

  await page.keyboard.press('Shift');
  const links = learnMoreLinks(page);
  await links.first().focus();
  const scrollY = await page.evaluate(() => window.scrollY);
  for (const i of [1, 2]) {
    await page.keyboard.press('Tab');
    await expect(links.nth(i)).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    await expect(mute).toBeHidden();
    // Nothing is on top of the link.
    expect(
      await links.nth(i).evaluate(el => {
        const r = el.getBoundingClientRect();
        return [0.1, 0.5, 0.9].every(f =>
          el.contains(
            document.elementFromPoint(
              r.left + r.width * f,
              r.top + r.height / 2,
            ),
          ),
        );
      }),
    ).toBe(true);
  }
  // Focus goes on to the links on the globe, and the button shows again.
  await page.keyboard.press('Tab');
  await expect(mute).toBeVisible();
});

for (const viewport of [WIDE, NARROW]) {
  test.describe(`the globe at ${viewport.width}px`, () => {
    test.use({viewport});

    test('has the "Learn more" link of each feature at every scroll position', async ({
      page,
    }) => {
      await load(page, '/');
      const links = learnMoreLinks(page);
      // Before the scroll gets to the features, and in two of them.
      for (const slug of [null, 'distribution', 'analytics']) {
        if (slug) {
          await scrollToAnchor(page, slug);
          await expect(
            page.locator(`text a[href$="#${slug}"][aria-current="true"]`),
          ).toHaveCount(1);
        }
        await expect(links, String(slug)).toHaveCount(3);
        for (const [i, link] of (await links.all()).entries()) {
          await expect(link).toHaveAttribute('href', `/features/${SLUGS[i]}`);
        }
      }
    });

    test('Tab goes to each "Learn more" link, and its feature shows while it has focus', async ({
      page,
    }) => {
      await load(page, '/');
      const links = learnMoreLinks(page);
      // Tab from the button before the globe, as a keyboard user does. The
      // scroll has not picked a feature yet.
      await page.keyboard.press('Shift');
      await page
        .locator('section:has(#distribution)')
        .getByRole('link', {name: 'Discover features'})
        .focus();
      for (const [i, slug] of SLUGS.entries()) {
        await page.keyboard.press('Tab');
        const link = links.nth(i);
        await expect(link, slug).toBeFocused();
        await expect(link, slug).toBeInViewport({ratio: 1});
        for (const [j, other] of (await links.all()).entries()) {
          // The description and the link of the feature with focus show,
          // and the others do not.
          const item = other.locator('xpath=ancestor::li[1]');
          await expect
            .poll(() => shownOpacity(item), `${slug}: ${SLUGS[j]}`)
            .toBe(i === j ? 1 : 0);
        }
      }
      // Then the links on the globe.
      await page.keyboard.press('Tab');
      await expect(page.locator('text a[href$="#distribution"]')).toBeFocused();
    });

    test('the feature whose link has focus shows instead of the one that the scroll picked', async ({
      page,
    }) => {
      await load(page, '/');
      await scrollToAnchor(page, 'analytics');
      const items = page.locator('section:has(#distribution) li');
      await expect(items.nth(1)).toHaveAttribute('aria-current', 'true');
      expect(await shownOpacity(items.nth(1))).toBe(1);

      await page.keyboard.press('Shift');
      await learnMoreLinks(page).first().focus();
      await expect.poll(() => shownOpacity(items.nth(0))).toBe(1);
      await expect.poll(() => shownOpacity(items.nth(1))).toBe(0);
      // The scroll still picks Analytics.
      await expect(items.nth(1)).toHaveAttribute('aria-current', 'true');

      // When focus leaves the list, the feature of the scroll shows again.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page.locator('text a[href$="#distribution"]')).toBeFocused();
      await expect.poll(() => shownOpacity(items.nth(0))).toBe(0);
    });
  });
}
