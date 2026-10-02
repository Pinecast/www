import {expect, test, type Page} from '@playwright/test';

// The "Pause animations" toggle (WCAG 2.2.2) and reduced motion (WCAG 2.3.3).
// Run `npm run build` first. These tests load the videos: a paused video must
// keep its frame.

const WIDE = {width: 1280, height: 900};
const NARROW = {width: 375, height: 812};

const toggle = (page: Page) =>
  page
    .getByRole('banner')
    .getByRole('button', {name: 'Pause animations'})
    .filter({visible: true});

// A short fingerprint of what a canvas shows.
const canvasPixels = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll(canvases =>
    canvases
      .filter(canvas => canvas.getClientRects().length)
      .map(canvas => {
        const data = (canvas as HTMLCanvasElement).toDataURL();
        let hash = 0;
        for (let i = 0; i < data.length; i += 3) {
          hash = (hash * 31 + data.charCodeAt(i)) | 0;
        }
        return `${data.length}:${hash}`;
      }),
  );

// The page counts the animation frames that it asked for and did not get yet.
// A canvas that has stopped asks for none.
type FrameCounter = {pendingFrames: () => number};
test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    const pending = new Set<number>();
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => {
      const id = request(time => {
        pending.delete(id);
        callback(time);
      });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = id => {
      pending.delete(id);
      cancel(id);
    };
    (window as unknown as FrameCounter).pendingFrames = () => pending.size;
  });
});

// What a canvas shows once it has stopped. The same fingerprint half a second
// apart does not prove that: on a busy machine one frame can take longer than
// that, and the seek of a video can take seconds. So the page must also ask
// for no animation frames, and no video that feeds the canvas (`videos`
// matches its URL) can be seeking or loading its first frames. All of it must
// be true twice in a row, with the same fingerprint.
// A canvas that keeps moving never settles, and the poll fails.
const settledCanvasPixels = async (
  page: Page,
  selector: string,
  {videos, timeout = 30_000}: {videos?: RegExp; timeout?: number} = {},
) => {
  let last: Array<string> = [];
  await expect
    .poll(
      async () => {
        const previous = last;
        await page.waitForTimeout(500);
        const idle = await page.evaluate(
          source =>
            (window as unknown as FrameCounter).pendingFrames() === 0 &&
            Array.from(document.querySelectorAll('video'))
              .filter(
                video => !!source && new RegExp(source).test(video.currentSrc),
              )
              .every(
                video =>
                  !video.seeking &&
                  (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ||
                    video.networkState !== HTMLMediaElement.NETWORK_LOADING),
              ),
          videos?.source,
        );
        last = idle ? await canvasPixels(page, selector) : [];
        return previous.length > 0 && previous.join() === last.join();
      },
      {timeout},
    )
    .toBe(true);
  return last;
};

// The time of each video that feeds a canvas or loops on the page.
const videoTimes = (page: Page) =>
  page.locator('video').evaluateAll(videos =>
    (videos as Array<HTMLVideoElement>).map(video => ({
      paused: video.paused,
      time: video.currentTime,
    })),
  );

// The state of the looping CSS animations.
const cssLoops = (page: Page) =>
  page.locator('[data-looping]').evaluateAll(elements =>
    elements
      .flatMap(element => element.getAnimations())
      .map(animation => ({
        state: animation.playState,
        time: Number(animation.currentTime),
      })),
  );

const marqueeTimes = (page: Page) =>
  page.locator('svg:has(animate)').evaluateAll(svgs =>
    (svgs as Array<SVGSVGElement>).map(svg => ({
      paused: svg.animationsPaused(),
      time: svg.getCurrentTime(),
    })),
  );

const scrollTo = (page: Page, top: number) =>
  page.evaluate(y => window.scrollTo({top: y, behavior: 'instant'}), top);

// Scroll to a part of the globe section: 0 is its top, 1 its end.
const scrollInGlobe = (page: Page, fraction: number) =>
  page.evaluate(f => {
    const section = document
      .querySelector('#distribution')!
      .closest('section')!;
    window.scrollTo({
      top: section.offsetTop + section.offsetHeight * f,
      behavior: 'instant',
    });
  }, fraction);

test.describe('the pause animations toggle', () => {
  for (const viewport of [WIDE, NARROW]) {
    test(`has a name and a pressed state, and keeps it between pages at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/privacy');
      const button = toggle(page);
      await expect(button).toHaveCount(1);
      await expect(button).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('html')).toHaveAttribute(
        'data-motion',
        'playing',
      );

      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('html')).toHaveAttribute(
        'data-motion',
        'paused',
      );

      // A link to another page of the site, and a new page load.
      await page
        .locator('footer')
        .getByRole('link', {name: 'Terms & conditions'})
        .click();
      await expect(page).toHaveURL(/\/terms$/);
      await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
      await page.reload();
      await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('html')).toHaveAttribute(
        'data-motion',
        'paused',
      );

      await toggle(page).click();
      await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
      await page.goto('/features');
      await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    });

    test(`lines up with the header icons at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/privacy');
      // The vertical center of what each icon control draws, and of the
      // header. The icons are SVG shapes, and the bars of the sound waveform
      // are empty spans.
      const centers = await page.getByRole('banner').evaluate(header => {
        const visible = (element: Element) => element.getClientRects().length;
        const middle = (rects: Array<DOMRect>) =>
          (Math.min(...rects.map(r => r.top)) +
            Math.max(...rects.map(r => r.bottom))) /
          2;
        const icons: Record<string, number> = {};
        for (const control of header.querySelectorAll('a, button')) {
          const shapes = Array.from(
            control.querySelectorAll('path, rect, span:empty'),
          ).filter(visible);
          if (visible(control) && shapes.length) {
            // The sound button takes its name from the <label> around it.
            const name =
              control.getAttribute('aria-label') ??
              ((control as HTMLButtonElement).labels?.[0] ?? control)
                .textContent!;
            icons[name] = middle(shapes.map(s => s.getBoundingClientRect()));
          }
        }
        return {header: middle([header.getBoundingClientRect()]), icons};
      });
      expect(Object.keys(centers.icons)).toEqual(
        expect.arrayContaining(
          viewport === WIDE
            ? ['Unmute', 'Pause animations']
            : ['Menu', 'Pause animations', 'Sign in'],
        ),
      );
      for (const [name, center] of Object.entries(centers.icons)) {
        expect(center, name).toBeCloseTo(centers.header, 0);
      }
    });
  }

  test('freezes the videos, the canvases and the marquee where they are', async ({
    page,
  }) => {
    // The videos load and start while the test waits. On a busy machine, that
    // takes several seconds each time.
    test.setTimeout(120_000);
    await page.setViewportSize(WIDE);
    await page.goto('/');
    // The hero videos play.
    await expect
      .poll(
        async () =>
          (await videoTimes(page)).some(v => !v.paused && v.time > 0.3),
        {timeout: 30_000},
      )
      .toBe(true);
    await expect
      .poll(async () => (await marqueeTimes(page))[0]?.time ?? 0, {
        timeout: 30_000,
      })
      .toBeGreaterThan(0.3);

    await toggle(page).click();
    await expect
      .poll(async () => (await videoTimes(page)).every(v => v.paused))
      .toBe(true);
    await expect
      .poll(async () => (await marqueeTimes(page)).every(m => m.paused))
      .toBe(true);
    const videos = await videoTimes(page);
    const marquee = await marqueeTimes(page);
    const hero = await canvasPixels(page, 'main canvas');
    // They stop where they are: they do not go back to the start.
    expect(videos.some(v => v.time > 0.3)).toBe(true);

    await page.waitForTimeout(1000);
    expect(await videoTimes(page)).toEqual(videos);
    expect(await marqueeTimes(page)).toEqual(marquee);
    expect(await canvasPixels(page, 'main canvas')).toEqual(hero);

    // The hero still follows the scroll: that is not an animation that
    // starts by itself.
    await scrollTo(page, 300);
    await expect
      .poll(() => canvasPixels(page, 'main canvas'))
      .not.toEqual(hero);

    // Play again, from where they stopped.
    await toggle(page).click();
    await expect
      .poll(async () => (await marqueeTimes(page))[0].time, {timeout: 30_000})
      .toBeGreaterThan(marquee[0].time);
    await expect
      .poll(
        async () =>
          (await videoTimes(page)).some(
            (v, i) => !v.paused && v.time > videos[i].time,
          ),
        {timeout: 30_000},
      )
      .toBe(true);
  });

  test('freezes the globe and the footer video', async ({page}) => {
    // Its videos load and seek while the test waits. On a busy machine, that
    // takes several seconds each time.
    test.setTimeout(120_000);
    await page.setViewportSize(WIDE);
    await page.goto('/');
    await scrollInGlobe(page, 0.35);
    const globe = 'main section canvas';
    const GLOBE_VIDEO = /\/videos\/globe\//;
    // The orbs drift.
    const drifting = await canvasPixels(page, globe);
    await expect.poll(() => canvasPixels(page, globe)).not.toEqual(drifting);

    // It stops. (A turn that the scroll started, or a video frame that is
    // still loading, can finish first.)
    await toggle(page).click();
    const frozen = await settledCanvasPixels(page, globe, {
      videos: GLOBE_VIDEO,
    });
    await page.waitForTimeout(1000);
    expect(await canvasPixels(page, globe)).toEqual(frozen);

    // A scroll to the next feature still turns the globe to it, and then it
    // stops again.
    await scrollInGlobe(page, 0.6);
    await expect.poll(() => canvasPixels(page, globe)).not.toEqual(frozen);
    const settled = await settledCanvasPixels(page, globe, {
      videos: GLOBE_VIDEO,
    });
    await page.waitForTimeout(1000);
    expect(await canvasPixels(page, globe)).toEqual(settled);

    // The footer video does not start while paused. It is the last video
    // that React renders (the canvas videos are at the end of the body).
    await page.evaluate(() =>
      window.scrollTo({top: document.body.scrollHeight, behavior: 'instant'}),
    );
    const footerVideo = page.locator('#__next video').last();
    const footerTime = () =>
      footerVideo.evaluate(video => (video as HTMLVideoElement).currentTime);
    await page.waitForTimeout(1000);
    expect(
      await footerVideo.evaluate(video => (video as HTMLVideoElement).paused),
    ).toBe(true);
    await toggle(page).click();
    // It loads only now. On a busy machine, that can take a few seconds.
    await expect.poll(footerTime, {timeout: 30_000}).toBeGreaterThan(0.2);
    await toggle(page).click();
    await expect
      .poll(() =>
        footerVideo.evaluate(video => (video as HTMLVideoElement).paused),
      )
      .toBe(true);
    const time = await footerTime();
    await page.waitForTimeout(500);
    expect(await footerTime()).toBe(time);
  });

  test('freezes the looping CSS animations', async ({page}) => {
    // The sound bubble drifts on narrow screens.
    await page.setViewportSize(NARROW);
    await page.goto('/privacy');
    await expect
      .poll(async () => (await cssLoops(page)).map(a => a.state))
      .toContain('running');

    await toggle(page).click();
    const loops = await cssLoops(page);
    expect(loops.length).toBeGreaterThan(0);
    expect(loops.every(a => a.state === 'paused')).toBe(true);
    await page.waitForTimeout(500);
    expect(await cssLoops(page)).toEqual(loops);
  });

  test('freezes the animated images of the menu', async ({page}) => {
    await page.setViewportSize(WIDE);
    await page.goto('/privacy');
    await page
      .getByRole('banner')
      .getByRole('button', {name: 'Learn', exact: true})
      .click();
    const images = '#site-menu canvas';
    await expect
      .poll(async () => (await canvasPixels(page, images)).length)
      .toBe(3);
    const playing = await canvasPixels(page, images);
    await expect.poll(() => canvasPixels(page, images)).not.toEqual(playing);

    await toggle(page).click();
    const frozen = await settledCanvasPixels(page, images);
    await page.waitForTimeout(800);
    expect(await canvasPixels(page, images)).toEqual(frozen);

    await toggle(page).click();
    await expect.poll(() => canvasPixels(page, images)).not.toEqual(frozen);
  });
});

test.describe('with reduced motion', () => {
  test.use({contextOptions: {reducedMotion: 'reduce'}});

  test('the animations start paused, and the user can play them', async ({
    page,
  }) => {
    await page.setViewportSize(NARROW);
    await page.goto('/');
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    const loops = await cssLoops(page);
    expect(loops.length).toBeGreaterThan(0);
    expect(loops.every(a => a.state === 'paused')).toBe(true);
    await page.waitForTimeout(500);
    // They have not started. (A video can start at a few milliseconds.)
    expect((await videoTimes(page)).every(v => v.paused && v.time < 0.05)).toBe(
      true,
    );
    expect((await marqueeTimes(page)).every(m => m.paused)).toBe(true);

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    await expect
      .poll(async () => (await cssLoops(page)).map(a => a.state))
      .toContain('running');
    await expect
      .poll(async () => (await videoTimes(page)).some(v => v.time > 0.2), {
        timeout: 30_000,
      })
      .toBe(true);
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('smooth scrolling is off', async ({page}) => {
    await page.goto('/privacy');
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe('auto');
  });

  for (const viewport of [WIDE, NARROW]) {
    test(`the page heroes keep one size at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      for (const path of [
        '/features/analytics',
        '/learn/create-a-podcast',
        '/privacy',
      ]) {
        await page.goto(path);
        const hero = page.locator('main [style*="--max-width"]');
        const before = await hero.boundingBox();
        await scrollTo(page, 600);
        await expect
          .poll(async () => (await hero.boundingBox())!.y)
          .toBeCloseTo(before!.y - 600, 0);
        expect((await hero.boundingBox())!.width).toBe(before!.width);
      }
    });

    test(`the home hero and the globe stay still at ${viewport.width}px`, async ({
      page,
    }) => {
      // The videos load while the test waits. On a busy machine, that takes
      // several seconds.
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      await page.goto('/');
      const hero = 'main > canvas';
      await expect(page.locator(hero)).toHaveCSS('position', 'absolute');
      // The hero draws the first frame of each video once it has loaded.
      await expect
        .poll(
          () =>
            page
              .locator('body > video')
              .evaluateAll(videos =>
                (videos as Array<HTMLVideoElement>).every(
                  video => video.readyState >= 3 && !video.seeking,
                ),
              ),
          {timeout: 30_000},
        )
        .toBe(true);
      const top = await settledCanvasPixels(page, hero);
      await scrollTo(page, 300);
      await page.waitForTimeout(500);
      expect(await canvasPixels(page, hero)).toEqual(top);

      const globe = 'main section canvas';
      await scrollInGlobe(page, 0.12);
      const start = await settledCanvasPixels(page, globe);
      // The feature text changes with the scroll, and the globe stays.
      await scrollInGlobe(page, 0.6);
      await expect(
        page.locator('li[aria-current="true"]').getByText(/analytics/i),
      ).toBeVisible();
      await page.waitForTimeout(1500);
      expect(await canvasPixels(page, globe)).toEqual(start);
    });
  }
});

// A choice to play the animations holds only under the reduced motion setting
// that it was made under. A choice from an earlier visit won over reduced
// motion that the user turned on later (WCAG 2.3.3).
test.describe('a choice to play the animations', () => {
  test('gives way to reduced motion that the user turns on later', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto('/privacy');
    // Pause, and play again: a choice to play.
    await toggle(page).click();
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');

    // The user turns on reduced motion: on this page, and on the next load.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');

    // A choice to play with reduced motion on holds.
    await toggle(page).click();
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');

    // A choice to pause holds with either setting.
    await toggle(page).click();
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
  });

  // The script in the head sets the state before the page scripts load. It
  // reads the stored choice as useMotion does, also the "playing" that the
  // site kept before.
  for (const [stored, state] of [
    ['playing', 'paused'],
    ['playing:no-preference', 'paused'],
    ['playing:reduce', 'playing'],
    ['paused', 'paused'],
  ]) {
    test(`with reduced motion, "${stored}" makes the page ${state} before React loads`, async ({
      page,
    }) => {
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.addInitScript(
        value => localStorage.setItem('motion', value),
        stored,
      );
      await page.route(/\/_next\/static\/chunks\//, route => route.abort());
      await page.goto('/privacy');
      await expect(page.locator('html')).toHaveAttribute('data-motion', state);
    });
  }
});

// The home hero grows its circles in CSS until the page script runs. With the
// toggle on, they show grown at once, as its canvas shows them.
test.describe('the animations that play as the page loads', () => {
  test.beforeEach(async ({page}) => {
    // The page script of the home page never comes: the static page stays.
    await page.route(/\/chunks\/pages\/index-/, route => route.abort());
  });

  const introAnimations = (page: Page) =>
    page
      .locator('[data-intro]')
      .evaluateAll(elements =>
        elements
          .flatMap(element => element.getAnimations())
          .map(animation => animation.playState),
      );

  test('play', async ({page}) => {
    await page.goto('/');
    expect(await introAnimations(page)).toContain('running');
  });

  test('show their end while the toggle is on', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('motion', 'paused'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    expect(await introAnimations(page)).toEqual([]);
  });
});

// The style block in the head pauses the looping CSS animations before the
// page script runs, and without it.
for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`without JavaScript, with ${reducedMotion}`, () => {
    test.use({
      javaScriptEnabled: false,
      contextOptions: {reducedMotion},
      viewport: NARROW,
    });

    test(`the looping CSS animations are ${
      reducedMotion === 'reduce' ? 'paused' : 'running'
    }`, async ({page}) => {
      await page.goto('/privacy');
      const states = (await cssLoops(page)).map(a => a.state);
      expect(states.length).toBeGreaterThan(0);
      expect(new Set(states)).toEqual(
        new Set([reducedMotion === 'reduce' ? 'paused' : 'running']),
      );
    });
  });
}
