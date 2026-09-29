import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Locator, type Page} from '@playwright/test';

// Keyboard, screen reader and landmark checks for the header menu, the page
// structure and the expandable widgets. Run `npm run build` first.

const WIDE = {width: 1280, height: 900};
// At 1180 pixels and below, the header shows the menu and sign-in icons.
const NARROW = {width: 375, height: 812};

// A page of each layout.
const PAGES = [
  '/',
  '/features',
  '/learn',
  '/features/analytics',
  '/learn/create-a-podcast',
  '/privacy',
  '/testimonial-transcripts',
];

// Media is not needed here, and it keeps the pages busy.
test.beforeEach(async ({page}) => {
  await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
});

const focusIsInside = (page: Page, selector: string) =>
  page.evaluate(sel => !!document.activeElement?.closest(sel), selector);

const panelOf = async (page: Page, button: Locator) =>
  page.locator(`[id="${await button.getAttribute('aria-controls')}"]`);

test.describe('page structure', () => {
  for (const path of PAGES) {
    test(`${path} has one main, a skip link and named navigation`, async ({
      page,
    }) => {
      await page.goto(path);
      const main = page.locator('main');
      await expect(main).toHaveCount(1);
      await expect(main).toHaveAttribute('id', 'main-content');

      const names = await page
        .locator('nav')
        .evaluateAll(navs => navs.map(nav => nav.getAttribute('aria-label')));
      expect(names).not.toContain(null);
      expect(new Set(names).size).toBe(names.length);
      expect(names).toEqual(
        expect.arrayContaining(['Primary', 'Menu', 'Footer']),
      );

      // The skip link is the first stop, and shows only while it has focus.
      const skip = page.getByRole('link', {name: 'Skip to main content'});
      await expect(skip).not.toBeInViewport();
      await page.keyboard.press('Tab');
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport({ratio: 1});

      // After the skip link, Tab goes on from the start of the main content.
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main-content$/);
      await page.keyboard.press('Tab');
      expect(await focusIsInside(page, 'header')).toBe(false);
      expect(
        await page.evaluate(() => {
          const main = document.querySelector('main')!;
          const active = document.activeElement!;
          return (
            main.contains(active) ||
            !!(
              main.compareDocumentPosition(active) &
              Node.DOCUMENT_POSITION_FOLLOWING
            )
          );
        }),
      ).toBe(true);
    });
  }

  test('the skip link slides out only without a reduced motion preference', async ({
    page,
  }) => {
    const skip = page.getByRole('link', {name: 'Skip to main content'});
    const durations = () =>
      skip.evaluate(link => getComputedStyle(link).transitionDuration);

    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto('/privacy');
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    expect(await durations()).not.toMatch(/^0s(, 0s)*$/);
    await expect(skip).toBeInViewport({ratio: 1});

    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/privacy');
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    expect(await durations()).toMatch(/^0s(, 0s)*$/);
    await expect(skip).toBeInViewport({ratio: 1});
  });

  // The h1 has short words, so that it fits at 320px, and it does not say
  // what the page holds. The title must say it (WCAG 2.4.2).
  test('the title of /testimonial-transcripts says that it holds transcripts', async ({
    page,
  }) => {
    await page.goto('/testimonial-transcripts');
    await expect(page).toHaveTitle('Testimonial transcripts – Pinecast');
    await expect(page.getByRole('heading', {level: 1})).toHaveText(
      'In Their Own Words',
    );
  });

  test('the skip link does not scroll the page when it gets focus', async ({
    page,
  }) => {
    await page.goto('/privacy');
    await page.evaluate(() =>
      window.scrollTo({top: 1500, behavior: 'instant'}),
    );
    await page
      .getByRole('link', {name: 'Skip to main content'})
      .evaluate(link => (link as HTMLElement).focus());
    expect(await page.evaluate(() => window.scrollY)).toBe(1500);
  });

  for (const viewport of [WIDE, {width: 320, height: 900}]) {
    test.describe(`at ${viewport.width}px`, () => {
      test.use({viewport});

      test('axe finds no landmark, name or hidden-focus errors', async ({
        page,
      }) => {
        for (const path of PAGES) {
          await page.goto(path);
          const {violations} = await new AxeBuilder({page})
            .withRules([
              'aria-allowed-attr',
              'aria-allowed-role',
              'aria-dialog-name',
              'aria-hidden-focus',
              'aria-valid-attr-value',
              'bypass',
              'button-name',
              'landmark-main-is-top-level',
              'landmark-no-duplicate-main',
              'landmark-one-main',
              'landmark-unique',
              'link-name',
              'nested-interactive',
              'svg-img-alt',
            ])
            .analyze();
          expect(
            violations.map(v => `${path}: ${v.id}`),
            JSON.stringify(violations.map(v => v.nodes.map(n => n.target))),
          ).toEqual([]);
        }
      });
    });
  }
});

// Checks the open menu against the modal dialog pattern, then closes it.
const expectOpenModalMenu = async (page: Page, trigger: Locator) => {
  const menu = page.getByRole('dialog', {name: 'Menu'});
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('id', 'site-menu');
  await expect(menu).toHaveAttribute('aria-modal', 'true');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  // Focus moves to the first link in the menu.
  const links = menu.getByRole('link');
  await expect(links.first()).toBeFocused();

  // The dim overlay and the scroll lock stay, and the page behind is inert.
  await expect(page.locator('body')).toHaveClass(/\bdimmed\b/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(
    'hidden',
  );
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  expect(
    await page.evaluate(
      () => !!document.querySelector('footer')!.closest('[inert]'),
    ),
  ).toBe(true);

  // Tab goes around the menu, through each link and the close button, and
  // back to the first link. Shift+Tab goes from the first link to the close
  // button, and then to the last link. Neither leaves the menu.
  const close = menu.getByRole('button', {name: 'Close menu'});
  const count = (await links.count()) + 1;
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
    expect(await focusIsInside(page, '#site-menu')).toBe(true);
  }
  await expect(links.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(links.last()).toBeFocused();

  // Escape closes the menu and returns focus to the trigger.
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/\bdimmed\b/);
  await expect(page.locator('main')).not.toHaveAttribute('inert');
};

test.describe('header menu, wide', () => {
  test.use({viewport: WIDE});

  const learnButton = (page: Page) =>
    page
      .getByRole('navigation', {name: 'Primary'})
      .getByRole('button', {name: 'Learn'});

  test('"Learn" is a button that opens the menu as a modal dialog', async ({
    page,
  }) => {
    await page.goto('/');
    const learn = learnButton(page);
    await expect(learn).toHaveAttribute('aria-expanded', 'false');
    await expect(learn).toHaveAttribute('aria-controls', 'site-menu');
    await expect(
      page.getByRole('navigation', {name: 'Primary'}).getByRole('link'),
    ).toHaveText(['Features']);

    await learn.focus();
    await page.keyboard.press('Enter');
    await expectOpenModalMenu(page, learn);

    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog', {name: 'Menu'})).toBeVisible();
  });

  test('a click on the overlay or on "Learn" closes the menu', async ({
    page,
  }) => {
    await page.goto('/');
    const learn = learnButton(page);
    const menu = page.getByRole('dialog', {name: 'Menu'});

    await learn.click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.mouse.click(640, 800);
    await expect(menu).toBeHidden();
    await expect(learn).toBeFocused();

    await learn.click();
    await expect(menu).toBeVisible();
    await learn.click();
    await expect(menu).toBeHidden();
    await expect(learn).toBeFocused();
  });

  test('a menu link to the open page closes the menu', async ({page}) => {
    await page.goto('/learn/create-a-podcast');
    const learn = learnButton(page);
    const menu = page.getByRole('dialog', {name: 'Menu'});
    await learn.click();
    await menu.getByRole('link', {name: 'Create a podcast'}).click();
    await expect(menu).toBeHidden();
    await expect(learn).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/\bdimmed\b/);
  });

  test('the closed menu leaves Escape to the rest of the page', async ({
    page,
  }) => {
    await page.goto('/');
    const features = page
      .getByRole('navigation', {name: 'Primary'})
      .getByRole('link', {name: 'Features'});
    await features.focus();
    // The old menu stopped every Escape at the document, even while closed.
    await page.evaluate(() => {
      window.addEventListener('keydown', evt => {
        document.body.dataset.escape = String(!evt.defaultPrevented);
      });
    });
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).toHaveAttribute('data-escape', 'true');
    await expect(features).toBeFocused();
  });
});

test.describe('header menu, narrow', () => {
  test.use({viewport: NARROW});

  test('the menu button opens the menu as a modal dialog', async ({page}) => {
    await page.goto('/privacy');
    const button = page.getByRole('banner').getByRole('button', {name: 'Menu'});
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'site-menu');
    await button.focus();
    await page.keyboard.press('Enter');
    await expectOpenModalMenu(page, button);
  });

  test('the sign-in icon link has a name, and icons are hidden', async ({
    page,
  }) => {
    await page.goto('/');
    const signIn = page
      .getByRole('banner')
      .getByRole('link', {name: 'Sign in'});
    await expect(signIn).toBeVisible();
    for (const svg of await page.locator('header svg').all()) {
      await expect(svg).toHaveAttribute('aria-hidden', 'true');
      await expect(svg).toHaveAttribute('focusable', 'false');
    }
  });
});

// The triggers of the menu are in the header, outside the modal dialog. A
// screen reader that obeys aria-modal cannot reach them, and a touch screen
// reader has no Escape key. So the dialog has its own close button.
test.describe('the close button of the menu', () => {
  const trigger = (page: Page, width: number) =>
    page
      .getByRole('banner')
      .getByRole('button', {name: width > 1180 ? 'Learn' : 'Menu', exact: true});

  for (const viewport of [WIDE, NARROW]) {
    test(`at ${viewport.width}px, it is in the dialog, shows with focus and closes the menu`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/privacy');
      const menu = page.getByRole('dialog', {name: 'Menu'});
      const close = menu.getByRole('button', {name: 'Close menu'});
      const opener = trigger(page, viewport.width);

      // A screen reader on a phone activates it without keyboard focus.
      await opener.click();
      await expect(menu.getByRole('link').first()).toBeFocused();
      // Until it has focus, it takes no room on the screen.
      expect((await close.boundingBox())!.width).toBeLessThanOrEqual(1);
      await close.dispatchEvent('click');
      await expect(menu).toBeHidden();
      await expect(opener).toHaveAttribute('aria-expanded', 'false');
      await expect(opener).toBeFocused();

      // With the keyboard, it is one Shift+Tab from the first link, and it
      // shows in full while it has focus.
      await page.keyboard.press('Enter');
      await expect(menu.getByRole('link').first()).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();
      const box = (await close.boundingBox())!;
      expect(box.width).toBeGreaterThan(80);
      expect(box.height).toBeGreaterThanOrEqual(24);
      await expect(close).toBeInViewport({ratio: 1});
      expect(
        await close.evaluate(el => {
          const {left, top, width, height} = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(left + width / 2, top + height / 2),
          );
        }),
      ).toBe(true);
      await page.keyboard.press('Enter');
      await expect(menu).toBeHidden();
      await expect(opener).toBeFocused();
    });
  }

  // The header has one trigger below 1181px and another above it. When the
  // width crosses 1181px while the menu is open (zoom, a turned tablet), the
  // trigger that opened the menu is hidden, and focus fell to the body.
  for (const [from, to] of [
    [WIDE, NARROW],
    [NARROW, WIDE],
  ]) {
    test(`after a change from ${from.width}px to ${to.width}px, closing the menu focuses the trigger that shows`, async ({
      page,
    }) => {
      await page.setViewportSize(from);
      await page.goto('/privacy');
      const menu = page.getByRole('dialog', {name: 'Menu'});
      const shown = trigger(page, to.width);

      // Escape, the close button and a click on the dim overlay.
      for (const close of ['Escape', 'button', 'overlay']) {
        await page.setViewportSize(from);
        await trigger(page, from.width).focus();
        await page.keyboard.press('Enter');
        await expect(menu.getByRole('link').first()).toBeFocused();
        await page.setViewportSize(to);
        if (close === 'Escape') {
          await page.keyboard.press('Escape');
        } else if (close === 'button') {
          // The first link can change with the width, so go straight to the
          // button.
          const button = menu.getByRole('button', {name: 'Close menu'});
          await button.focus();
          await page.keyboard.press('Enter');
        } else {
          await page.mouse.click(to.width / 2, to.height - 10);
        }
        await expect(menu, close).toBeHidden();
        await expect(shown, close).toBeFocused();
      }
    });
  }
});

test.describe('expandable widgets', () => {
  test('the features accordion exposes its state, and closed panels are inert', async ({
    page,
  }) => {
    await page.goto('/features');
    // The letter badge is hidden, so the name is the feature name alone.
    const button = page.getByRole('button', {name: 'Analytics', exact: true});
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = await panelOf(page, button);
    await expect(panel).toHaveAttribute('inert', '');
    await expect(panel).not.toHaveAttribute('role');
    await expect(panel).not.toHaveAttribute('aria-hidden');

    // The link in a closed panel is not a tab stop.
    await button.focus();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', {name: 'Art Optimization', exact: true}),
    ).toBeFocused();

    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).not.toHaveAttribute('inert');
    await page.keyboard.press('Tab');
    await expect(panel.getByRole('link', {name: 'Learn more'})).toBeFocused();

    await button.focus();
    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('inert', '');
  });

  // The panel is a grid with one row that closes to 0fr. A 0fr row cannot
  // close up the padding of its item, so a closed panel on /features kept a
  // strip of 28px.
  const rowHeight = async (panel: Locator) =>
    panel.evaluate(el => el.firstElementChild!.getBoundingClientRect().height);
  for (const path of ['/', '/features']) {
    test(`each closed panel of ${path} closes to 0`, async ({page}) => {
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.goto(path);
      const toggles = page.getByRole('main').locator('button[aria-controls]');
      expect(await toggles.count()).toBeGreaterThan(0);
      for (const toggle of await toggles.all()) {
        const panel = await panelOf(page, toggle);
        await expect(panel).toHaveAttribute('inert', '');
        expect(await rowHeight(panel)).toBe(0);
      }
      // Also after a panel opens and closes again.
      const toggle = toggles.first();
      const panel = await panelOf(page, toggle);
      await toggle.press('Enter');
      await expect.poll(() => rowHeight(panel)).toBeGreaterThan(0);
      await toggle.press('Enter');
      await expect.poll(() => rowHeight(panel)).toBe(0);
    });
  }

  test('the pricing add-ons open with the keyboard and with a click on the row', async ({
    page,
  }) => {
    await page.goto('/');
    const button = page
      .getByRole('heading', {level: 3, name: 'Crew add-on'})
      .getByRole('button', {name: 'Crew add-on'});
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = await panelOf(page, button);
    await expect(panel).toHaveAttribute('inert', '');

    // The add-on buttons are tab stops, one after the other.
    await page.getByRole('button', {name: 'Pro Analytics add-on'}).focus();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).not.toHaveAttribute('inert');
    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    // A mouse user can still click the icon at the end of the row, and
    // anywhere in the open row.
    const row = button.locator('xpath=ancestor::*[@role="presentation"][1]');
    const {width} = (await row.boundingBox())!;
    await row.click({position: {x: width - 12, y: 32}});
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await row.click({position: {x: width / 2, y: 150}});
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
