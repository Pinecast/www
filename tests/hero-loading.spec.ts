import {expect, test, type CDPSession, type Page} from '@playwright/test';

// The home page loads the stills of its hero first, and nothing that can wait
// takes bandwidth from them (src/hooks/useLoadOrder.ts, the preloads in
// src/pages/_document.tsx). Run `npm run build` first.
//
// The tests that watch the order slow the network down (4 Mbps, 150 ms: the
// connection that the order is for), so that the stills take seconds, and a
// file that does not wait would start before they are in.

const STILLS = {
  central: '/images/hero/central.jpg',
  corners: [
    '/images/hero/t-l.jpg',
    '/images/hero/t-r.jpg',
    '/images/hero/b-l.jpg',
    '/images/hero/b-r.jpg',
  ],
  inner: ['/images/hero/ml.jpg', '/images/hero/mr.jpg'],
};
const DRAWN = {
  mobile: [STILLS.central],
  tablet: [STILLS.central, ...STILLS.corners],
  desktop: [STILLS.central, ...STILLS.corners, ...STILLS.inner],
};
const VIEWPORTS = {
  mobile: {width: 390, height: 844},
  // 701px is the narrowest tablet, and 1180px the widest.
  tablet: {width: 1024, height: 768},
  desktop: {width: 1440, height: 900},
} as const;

// What waits for the stills, and what the page loads from the first byte.
const WAITS = /\/(sounds\/|videos\/|images\/globe-full\.jpg|images\/art\/)/;
const isStill = (url: string) => /\/images\/hero\/.*\.jpg$/.test(url);

async function slowDown(page: Page): Promise<CDPSession> {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (4 * 1024 * 1024) / 8,
  });
  return client;
}

// When each file starts (the request) and ends (the response), in ms.
function watchRequests(page: Page) {
  const t0 = Date.now();
  const starts = new Map<string, number>();
  const ends = new Map<string, number>();
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (!starts.has(path)) starts.set(path, Date.now() - t0);
  });
  page.on('requestfinished', request => {
    ends.set(new URL(request.url()).pathname, Date.now() - t0);
  });
  return {starts, ends};
}

for (const [layout, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`at the ${layout} layout`, () => {
    test.use({viewport});

    test('the page preloads the stills that the hero draws, and loads each one once', async ({
      page,
    }) => {
      test.setTimeout(60_000);
      const requests: Array<string> = [];
      const sounds: Array<string> = [];
      page.on('request', request => {
        const path = new URL(request.url()).pathname;
        if (isStill(request.url())) {
          requests.push(path);
        } else if (path.startsWith('/sounds/')) {
          sounds.push(path);
        }
      });
      await page.goto('/');

      const preloaded = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLLinkElement>(
            'link[rel="preload"][as="image"]',
          ),
        ]
          .filter(link => matchMedia(link.media || 'all').matches)
          .map(link => ({
            href: new URL(link.href).pathname,
            priority: link.getAttribute('fetchpriority'),
          })),
      );
      expect(preloaded.map(link => link.href).sort()).toEqual(
        DRAWN[layout as keyof typeof DRAWN].slice().sort(),
      );
      // The stills must not take the bandwidth of the page script.
      expect(new Set(preloaded.map(link => link.priority))).toEqual(
        new Set(['low']),
      );

      // The hero loads the same files, and the preloads and the CSS skeleton
      // are not extra requests for them. The sounds start when the stills are
      // in, so the stills have been asked for by then.
      await expect
        .poll(() => sounds.length, {timeout: 20_000})
        .toBeGreaterThan(0);
      expect(requests.slice().sort()).toEqual(
        DRAWN[layout as keyof typeof DRAWN].slice().sort(),
      );
    });
  });
}

test('the preloads of the stills come after the scripts of the page', async ({
  page,
}) => {
  // A <link> ahead of the scripts takes the connections first (HTTP/1.1), and
  // the script that takes the hero over from its CSS layout comes late.
  // React moves a <link> to the start of the <head> unless it has a handler:
  // see the stills in _document.tsx.
  await page.goto('/');
  const order = await page.evaluate(() => {
    const nodes = [...document.head.children];
    const lastScript = nodes.findLastIndex(
      node => node.tagName === 'SCRIPT' && node.hasAttribute('src'),
    );
    const firstStill = nodes.findIndex(
      node =>
        node.tagName === 'LINK' &&
        node.getAttribute('rel') === 'preload' &&
        node.getAttribute('as') === 'image',
    );
    return {lastScript, firstStill};
  });
  expect(order.lastScript).toBeGreaterThan(-1);
  expect(order.firstStill).toBeGreaterThan(order.lastScript);
});

test.describe('on a slow connection', () => {
  test.use({viewport: VIEWPORTS.desktop});

  test('the sounds, the videos and the globe wait for the stills', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await slowDown(page);
    const {starts, ends} = watchRequests(page);
    await page.goto('/');
    // The stills are in. The files that waited start now.
    await expect
      .poll(() => DRAWN.desktop.every(path => ends.has(path)), {
        timeout: 30_000,
      })
      .toBe(true);
    await expect
      .poll(() => [...starts.keys()].filter(path => WAITS.test(path)).length, {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);

    const lastStill = Math.max(...DRAWN.desktop.map(path => ends.get(path)!));
    const early = [...starts]
      .filter(([path]) => WAITS.test(path))
      .filter(([, start]) => start < lastStill)
      .map(([path]) => path);
    expect(early).toEqual([]);
  });

  test('the sounds also load from the first key press, to be there for what the user does next', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await slowDown(page);
    const {starts, ends} = watchRequests(page);
    const stillsIn = () => DRAWN.desktop.every(path => ends.has(path));
    const soundsStarted = () =>
      [...starts.keys()].some(path => /\/sounds\//.test(path));
    // Not `load`: the preloaded stills delay that event.
    await page.goto('/', {waitUntil: 'commit'});

    // The page script is in, and the stills are still on their way. (The
    // script is small, and the stills are not: this is also a check that the
    // stills do not hold the script up.)
    await expect
      .poll(
        () =>
          [...ends.keys()].some(path => /\/chunks\/pages\/index-/.test(path)),
        {timeout: 15_000},
      )
      .toBe(true);
    expect(stillsIn()).toBe(false);
    expect(soundsStarted()).toBe(false);

    // The page takes a key press once it has hydrated, so press until it does.
    await expect
      .poll(
        async () => {
          await page.keyboard.press('Shift');
          return soundsStarted();
        },
        {timeout: 5_000, intervals: [100]},
      )
      .toBe(true);
    // The key press started the sounds, not the stills: they are not in yet.
    expect(stillsIn()).toBe(false);
  });
});

// Where the canvas draws the centers of the tiles, at the desktop layout: the
// tile in the top left corner (a still), the bottom one on the left, the
// inner left column, and the central tile.
const TILES = [
  {name: 'top left', x: 130, y: 340},
  {name: 'bottom left', x: 130, y: 730},
  {name: 'inner left', x: 365, y: 700},
  {name: 'central', x: 720, y: 760},
  {name: 'inner right', x: 1075, y: 700},
  {name: 'bottom right', x: 1310, y: 730},
  {name: 'top right', x: 1310, y: 340},
];
const PLACEHOLDERS = [
  [0xcf, 0x8a, 0xea],
  [0xc4, 0xff, 0x7e],
];

// The color at each point of a screenshot.
async function colorsAt(
  page: Page,
  png: Buffer,
  points: Array<{x: number; y: number}>,
): Promise<Array<[number, number, number]>> {
  return page.evaluate(
    async ([base64, points]) => {
      const bytes = Uint8Array.from(atob(base64 as string), c =>
        c.charCodeAt(0),
      );
      const bitmap = await createImageBitmap(
        new Blob([bytes], {type: 'image/png'}),
      );
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      return (points as Array<{x: number; y: number}>).map(({x, y}) => {
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        return [r, g, b] as [number, number, number];
      });
    },
    [png.toString('base64'), points] as const,
  );
}

const isPlaceholder = ([r, g, b]: [number, number, number]) =>
  PLACEHOLDERS.some(
    ([pr, pg, pb]) =>
      Math.abs(r - pr) <= 3 && Math.abs(g - pg) <= 3 && Math.abs(b - pb) <= 3,
  );

test.describe('the hand-off from the CSS layout to the canvas', () => {
  test.use({viewport: VIEWPORTS.desktop});

  test('the CSS layout shows the stills, and the canvas does not paint a placeholder over them', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    // The videos replace the stills once they play. Keep them out, so that the
    // canvas has only the stills to draw.
    await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());

    // Hold the page script back until the stills are in and painted, so that
    // the CSS layout is what shows them. Then watch the first frame of the
    // canvas.
    let release!: () => void;
    const held = new Promise<void>(resolve => (release = resolve));
    await page.route(/\/chunks\/pages\/index-/, async route => {
      await held;
      await route.continue();
    });
    // React hears of a loaded image from its `onload` property, and it can
    // hear late: the `load` event is a task of its own, and a frame can come
    // first. Delay the handlers by 3 s, as if each still had arrived a moment
    // before the first frame. Then only the `complete` flag of the image says
    // that the still is in.
    await page.addInitScript(() => {
      Object.defineProperty(HTMLImageElement.prototype, 'onload', {
        configurable: true,
        get: () => null,
        set(this: HTMLImageElement, handler: unknown) {
          if (typeof handler === 'function') {
            this.addEventListener(
              'load',
              event => setTimeout(() => handler.call(this, event), 3000),
              {once: true},
            );
          }
        },
      });
    });
    await page.addInitScript(() => {
      const w = window as unknown as {__firstFrame?: Array<Array<number>>};
      const watch = () => {
        const section = document.querySelector('main section');
        const canvas = document.querySelector<HTMLCanvasElement>('main canvas');
        if (!section || !canvas) {
          requestAnimationFrame(watch);
          return;
        }
        new MutationObserver((_, observer) => {
          if (
            (section as HTMLElement).style.getPropertyValue(
              '--hero-skeleton',
            ) !== 'hidden'
          ) {
            return;
          }
          // The callback of the first frame that the canvas painted has run.
          const ctx = canvas.getContext('2d')!;
          const ratio = canvas.width / canvas.getBoundingClientRect().width;
          w.__firstFrame = [
            [130, 340],
            [130, 730],
            [365, 700],
            [720, 760],
            [1075, 700],
            [1310, 730],
            [1310, 340],
          ].map(([x, y]) => [
            ...ctx.getImageData(x * ratio, y * ratio, 1, 1).data.slice(0, 3),
          ]);
          observer.disconnect();
        }).observe(section, {attributes: true, attributeFilter: ['style']});
      };
      requestAnimationFrame(watch);
    });

    await page.goto('/', {waitUntil: 'commit'});
    // The skeleton shows each still once it is in: wait until no tile of it
    // shows a placeholder. (The hero is on the page, and its script is not.)
    await expect
      .poll(
        async () => {
          const colors = await colorsAt(
            page,
            await page.screenshot({type: 'png'}),
            TILES,
          );
          return colors.filter(isPlaceholder).length;
        },
        {timeout: 30_000, intervals: [250]},
      )
      .toBe(0);
    await expect(page.locator('main section').first()).not.toHaveCSS(
      '--hero-skeleton',
      'hidden',
    );

    release();
    await expect(page.locator('main section').first()).toHaveCSS(
      '--hero-skeleton',
      'hidden',
    );
    const firstFrame = await page.evaluate(
      () =>
        (window as unknown as {__firstFrame?: Array<[number, number, number]>})
          .__firstFrame,
    );
    expect(firstFrame, 'the canvas painted a first frame').toBeDefined();
    firstFrame!.forEach((color, i) => {
      expect(isPlaceholder(color), `${TILES[i].name} tile: ${color}`).toBe(
        false,
      );
    });
  });
});
