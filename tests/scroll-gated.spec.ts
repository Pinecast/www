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

// The testimonials show the player of one customer at a time: the one at the
// middle of the screen. The player came before the customer blocks in the
// page, and it existed only at that scroll position.
const CUSTOMERS = [
  {name: 'Living Blindfully', since: 2020, color: 'var(--color-lime)'},
  {name: 'Make Life Work', since: 2019, color: 'var(--color-sky)'},
];

const customerBlock = (page: Page, name: string) =>
  page
    .locator('#testimonials')
    .getByRole('heading', {level: 3, name})
    .locator('xpath=..');

const playButton = (page: Page, name: string) =>
  page.getByRole('button', {name: `${name} testimonial`});

// Put the name of a customer at the middle of the screen.
const scrollToCustomer = (page: Page, name: string) =>
  customerBlock(page, name)
    .getByRole('heading')
    .evaluate(el => {
      const r = el.getBoundingClientRect();
      window.scrollTo({
        top: scrollY + r.top + r.height / 2 - innerHeight / 2,
        behavior: 'instant',
      });
    });

// The part of the screen where the Play button of a customer must be: under
// the header, and above the time ticker of the player in the middle.
const aboveThePlayer = (button: Locator) =>
  button.evaluate(el => {
    const r = el.getBoundingClientRect();
    const header = document.querySelector('header')!.getBoundingClientRect();
    const ticker = matchMedia('(min-width: 1181px)').matches ? 40 : 30;
    return (
      r.width > 40 &&
      r.top >= header.bottom + 4 &&
      r.bottom <= innerHeight / 2 - ticker / 2 - 4
    );
  });

const pageColor = (page: Page) =>
  page.evaluate(() => document.body.style.getPropertyValue('--page-bg'));

for (const viewport of [WIDE, NARROW]) {
  test.describe(`the testimonials at ${viewport.width}px`, () => {
    test.use({viewport});

    test('each customer block has its quote, "Customer since" and its own Play button at every scroll position', async ({
      page,
    }) => {
      await load(page, '/');
      for (const position of [null, ...CUSTOMERS.map(c => c.name)]) {
        if (position) {
          await scrollToCustomer(page, position);
        }
        // Only the buttons of the blocks: the player is hidden from screen
        // readers.
        await expect(
          page.locator('#testimonials').getByRole('button'),
          String(position),
        ).toHaveText(['Play Living Blindfully testimonial', /Make Life Work/]);
        for (const {name, since} of CUSTOMERS) {
          const block = customerBlock(page, name);
          await expect(block.locator('blockquote')).toHaveCount(1);
          await expect(block).toContainText(`Customer since ${since}`);
          await expect(playButton(page, name)).toHaveCount(1);
          await expect(block.getByRole('button')).toHaveAccessibleName(
            `Play ${name} testimonial`,
          );
        }
      }
    });

    test('Tab goes to the Play button of each customer, which shows above the player, and the player shows that customer', async ({
      page,
    }) => {
      await load(page, '/');
      await page.keyboard.press('Shift');
      await page
        .locator('#testimonials')
        .getByRole('link', {name: 'Start for free'})
        .focus();
      for (const {name, color} of CUSTOMERS) {
        await page.keyboard.press('Tab');
        const button = playButton(page, name);
        await expect(button).toBeFocused();
        await expect.poll(() => aboveThePlayer(button), name).toBe(true);
        await expect(customerBlock(page, name)).toHaveAttribute(
          'aria-current',
          'true',
        );
        await expect.poll(() => pageColor(page), name).toBe(color);
        await expect(page.locator('#testimonials footer')).toContainText(name);
      }
      // After the last customer, focus goes on to the next part of the page.
      await page.keyboard.press('Tab');
      expect(
        await page.evaluate(
          () => !!document.activeElement?.closest('#testimonials'),
        ),
      ).toBe(false);

      // From below, Shift+Tab also shows the button above the player.
      await page.keyboard.press('Shift+Tab');
      const last = playButton(page, CUSTOMERS[1].name);
      await expect(last).toBeFocused();
      await expect.poll(() => aboveThePlayer(last)).toBe(true);
    });
  });
}

test.describe('a Play button of a customer', () => {
  test.use({viewport: WIDE});

  // The testimonials must play here, so let only their audio load.
  test.beforeEach(async ({page}) => {
    await page.unroute(/\.(mp3|mp4|webm)(\?|$)/);
    await page.route(/\.(mp3|mp4|webm)(\?|$)/, route =>
      route.request().url().includes('/testimonials/')
        ? route.continue()
        : route.abort(),
    );
  });

  const audio = (page: Page) =>
    page.locator('#testimonials audio').evaluate(el => {
      const media = el as HTMLAudioElement;
      return {
        src: media.currentSrc.split('/').pop(),
        playing: !media.paused && !media.muted,
        time: media.currentTime,
      };
    });

  test('plays its customer, also when another one is at the middle of the screen', async ({
    page,
  }) => {
    await load(page, '/');
    await scrollToCustomer(page, 'Living Blindfully');
    await expect(customerBlock(page, 'Living Blindfully')).toHaveAttribute(
      'aria-current',
      'true',
    );
    // A screen reader on a phone presses a button without focus.
    await playButton(page, 'Make Life Work').dispatchEvent('click');
    await expect(customerBlock(page, 'Make Life Work')).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect
      .poll(async () => (await audio(page)).src)
      .toMatch(/^make-life-work\./);
    await expect
      .poll(async () => (await audio(page)).time)
      .toBeGreaterThan(0.5);
    expect((await audio(page)).playing).toBe(true);
    await expect(playButton(page, 'Make Life Work')).toHaveAccessibleName(
      'Pause Make Life Work testimonial',
    );

    // It pauses the same way. Then the customer at the middle of the screen
    // shows again, and it does not start by itself.
    await playButton(page, 'Make Life Work').dispatchEvent('click');
    await expect.poll(async () => (await audio(page)).playing).toBe(false);
    await expect(playButton(page, 'Make Life Work')).toHaveAccessibleName(
      'Play Make Life Work testimonial',
    );
    await expect(customerBlock(page, 'Living Blindfully')).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.waitForTimeout(1000);
    expect((await audio(page)).playing).toBe(false);

    // With the keyboard.
    await page.keyboard.press('Shift');
    await playButton(page, 'Living Blindfully').focus();
    await page.keyboard.press('Enter');
    await expect
      .poll(async () => (await audio(page)).src)
      .toMatch(/^living-blindfully\./);
    await expect.poll(async () => (await audio(page)).playing).toBe(true);
    // The button says Pause only once the audio plays. Until then, Enter
    // presses Play again.
    await expect(playButton(page, 'Living Blindfully')).toHaveAccessibleName(
      'Pause Living Blindfully testimonial',
    );
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await audio(page)).playing).toBe(false);
  });

  // A press without focus picks its customer for the scroll position of the
  // press. The pick stayed, and each time the page came back to that
  // position, the player of the customer played by itself, with sound, over
  // the screen reader. It must go when the scroll moves on, when the user
  // pauses and when the audio ends.
  const noCustomerShows = async (page: Page) => {
    await expect(
      page.locator('#testimonials [aria-current="true"]'),
    ).toHaveCount(0);
    await expect(page.locator('#testimonials audio')).toHaveCount(0);
  };
  const scrollToTop = (page: Page) =>
    page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  // A screen reader on a phone presses the button without focus. The button
  // says Pause once the audio plays: until then, a press is a Play again.
  const playWithoutFocus = async (page: Page, name: string) => {
    await playButton(page, name).dispatchEvent('click');
    await expect(playButton(page, name)).toHaveAccessibleName(
      `Pause ${name} testimonial`,
    );
  };

  test('a press without focus plays only until the scroll moves on', async ({
    page,
  }) => {
    await load(page, '/');
    // At the top of the page, no customer is at the middle of the screen.
    await playWithoutFocus(page, 'Make Life Work');
    await scrollToCustomer(page, 'Living Blindfully');
    await expect(customerBlock(page, 'Living Blindfully')).toHaveAttribute(
      'aria-current',
      'true',
    );
    await scrollToTop(page);
    await noCustomerShows(page);
  });

  test('a press without focus plays only until the user pauses', async ({
    page,
  }) => {
    // With reduced motion, the still player also showed over other parts of
    // the page.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await load(page, '/');
    await playWithoutFocus(page, 'Make Life Work');
    const button = playButton(page, 'Make Life Work');
    await button.dispatchEvent('click');
    await noCustomerShows(page);
    await expect(button).toHaveAccessibleName(
      'Play Make Life Work testimonial',
    );
    // It does not come back after a scroll away and back.
    await scrollToCustomer(page, 'Living Blindfully');
    await expect(customerBlock(page, 'Living Blindfully')).toHaveAttribute(
      'aria-current',
      'true',
    );
    await scrollToTop(page);
    await noCustomerShows(page);
  });

  test('a press without focus plays only until the audio ends', async ({
    page,
  }) => {
    await load(page, '/');
    await playWithoutFocus(page, 'Make Life Work');
    await page.locator('#testimonials audio').evaluate(el => {
      const media = el as HTMLAudioElement;
      media.currentTime = media.duration - 0.5;
    });
    await noCustomerShows(page);
  });
});

// WCAG 2.3.3: the player slid across the screen and grew and shrank as the
// page scrolled, also with reduced motion.
test.describe('the testimonial player', () => {
  // The box of the quote.
  const quoteBox = async (page: Page) => {
    const box = (await page.locator('#testimonials footer').evaluate(el => {
      const r = el.parentElement!.getBoundingClientRect();
      return {x: r.x, y: r.y, width: r.width, height: r.height};
    }))!;
    return {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
    };
  };
  const animations = (page: Page) =>
    page
      .locator('#testimonials audio')
      .evaluate(el => el.parentElement!.getAnimations({subtree: true}).length);

  for (const viewport of [WIDE, NARROW]) {
    test(`stays in one place with reduced motion at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({reducedMotion: 'reduce'});
      await load(page, '/');
      const boxes = [];
      for (const [name, by] of [
        ['Living Blindfully', 0],
        ['Living Blindfully', 30],
        ['Make Life Work', 0],
        ['Make Life Work', 30],
      ] as const) {
        await scrollToCustomer(page, name);
        await page.mouse.wheel(0, by);
        await page.waitForTimeout(300);
        await expect(page.locator('#testimonials footer')).toContainText(name);
        expect(await animations(page)).toBe(0);
        boxes.push(await quoteBox(page));
      }
      // Full size, in the middle, the same for both customers.
      const {width} = page.viewportSize()!;
      expect(boxes[0].width).toBe(width > 1180 ? 344 : 294);
      expect(Math.abs(boxes[0].x - (width - boxes[0].width) / 2)).toBeLessThan(
        2,
      );
      for (const box of boxes) {
        expect(box).toEqual(boxes[0]);
      }
    });
  }

  // Without reduced motion it moves, so the test above can see a move.
  test('slides as the page scrolls without reduced motion', async ({page}) => {
    await page.setViewportSize(WIDE);
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await load(page, '/');
    await scrollToCustomer(page, 'Living Blindfully');
    await page.mouse.wheel(0, 4);
    await expect.poll(() => animations(page)).toBeGreaterThan(0);
    const before = await quoteBox(page);
    await page.mouse.wheel(0, 80);
    await expect.poll(async () => (await quoteBox(page)).x).not.toBe(before.x);
  });
});
