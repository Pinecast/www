// Measures when the stills of the home hero are in, on a slow connection.
//
//   npm run build
//   node scripts/measure-hero-loading.mjs [out-dir] [options]
//
//   --runs 3          number of loads (the output has the median)
//   --width 1440      viewport: 1440 is desktop, 1024 tablet, 390 mobile
//   --height 900
//   --mbps 4          download speed
//   --latency 150     added to each request, in ms
//   --cache off       `off` loads as if the cache were off (DevTools
//                     "Disable cache"), `on` is a first visit with a new profile
//   --seconds 14      how long to watch each load. A file that is not in by
//                     then does not count, so use a time past the slowest one
//   --filmstrip       also take a screenshot every 0.5 to 2 s, and print the
//                     share of the viewport that is a placeholder color
//
// It serves out-dir (default: out) with `serve`, as playwright.config.ts does,
// and slows the network down with the DevTools protocol. The times are in ms
// from the start of the navigation. Set CHROMIUM_PATH to use a browser other
// than the one of Playwright (on a Mac, the headless shell in
// ~/Library/Caches/ms-playwright).
//
// To compare two versions, build each one, copy out/ aside, and run the script
// on each copy.
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from '@playwright/test';

const argv = process.argv.slice(2);
const dir = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'out';
const option = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const RUNS = Number(option('runs', 3));
const WIDTH = Number(option('width', 1440));
const HEIGHT = Number(option('height', 900));
const MBPS = Number(option('mbps', 4));
const LATENCY = Number(option('latency', 150));
const CACHE_OFF = option('cache', 'off') === 'off';
const SECONDS = Number(option('seconds', 14));
const FILMSTRIP = argv.includes('--filmstrip');
const PORT = 3200 + Math.floor(Math.random() * 500);

// The colors that a tile of the hero has until its still is in.
const PLACEHOLDERS = [
  [0xcf, 0x8a, 0xea],
  [0xc4, 0xff, 0x7e],
];

const group = url => {
  const path = new URL(url).pathname;
  if (path === '/') return 'page';
  if (/^\/images\/hero\/.*\.jpg$/.test(path)) return 'still';
  if (/^\/sounds\//.test(path)) return 'sound';
  if (/^\/videos\/hero\//.test(path)) return 'hero video';
  if (/^\/videos\/globe\//.test(path) || path === '/images/globe-full.jpg') {
    return 'globe';
  }
  if (/^\/(videos|images\/art)\//.test(path)) return 'below the fold';
  if (/^\/fonts\//.test(path)) return 'font';
  if (
    /^\/_next\/static\/chunks\/(pages\/index-|main-|framework-|webpack-)/.test(
      path,
    )
  ) {
    return 'page script';
  }
  return 'other';
};

const median = values =>
  values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];

const server = spawn(
  'npx',
  ['serve', dir, '--listen', String(PORT), '--no-request-logging'],
  {stdio: 'ignore', detached: true},
);
const stopServer = () => {
  try {
    process.kill(-server.pid);
  } catch {
    // It has stopped already.
  }
};
process.on('exit', stopServer);

for (let i = 0; ; i++) {
  try {
    if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
  } catch {
    // Not up yet.
  }
  if (i > 100) throw new Error('The server did not start.');
  await sleep(100);
}

// The share of the pixels of a PNG that have a placeholder color.
async function placeholderShare(page, png) {
  return page.evaluate(
    async ([base64, placeholders]) => {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const bitmap = await createImageBitmap(
        new Blob([bytes], {type: 'image/png'}),
      );
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const {data} = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (
          placeholders.some(
            ([r, g, b]) =>
              Math.abs(data[i] - r) <= 3 &&
              Math.abs(data[i + 1] - g) <= 3 &&
              Math.abs(data[i + 2] - b) <= 3,
          )
        ) {
          count++;
        }
      }
      return count / (data.length / 4);
    },
    [png.toString('base64'), PLACEHOLDERS],
  );
}

async function load(browser) {
  const context = await browser.newContext({
    viewport: {width: WIDTH, height: HEIGHT},
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', {cacheDisabled: CACHE_OFF});
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: LATENCY,
    downloadThroughput: (MBPS * 1024 * 1024) / 8,
    uploadThroughput: (MBPS * 1024 * 1024) / 8,
  });

  // The protocol times are on a clock of their own. `wall` puts them on that
  // of `performance.timeOrigin`.
  let wallOffset;
  const requests = new Map();
  client.on('Network.requestWillBeSent', e => {
    wallOffset ??= e.wallTime - e.timestamp;
    requests.set(e.requestId, {
      url: e.request.url,
      priority: e.request.initialPriority,
      start: (e.timestamp + wallOffset) * 1000,
    });
  });
  const finish = e => {
    const request = requests.get(e.requestId);
    if (request) request.end = (e.timestamp + wallOffset) * 1000;
  };
  client.on('Network.loadingFinished', finish);
  client.on('Network.loadingFailed', finish);

  // The first frame of the canvas hides the CSS layout of the hero.
  await page.addInitScript(() => {
    window.__heroMarks = {};
    const tick = () => {
      const section = document.querySelector('main section');
      if (
        section &&
        !window.__heroMarks.canvas &&
        getComputedStyle(section).getPropertyValue('--hero-skeleton') ===
          'hidden'
      ) {
        window.__heroMarks.canvas = performance.now();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const started = Date.now();
  await page.goto(`http://localhost:${PORT}/`, {waitUntil: 'commit'});
  const shares = [];
  if (FILMSTRIP) {
    const frames = [];
    for (const t of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10, 12]) {
      if (t > SECONDS) break;
      await sleep(Math.max(0, t * 1000 - (Date.now() - started)));
      frames.push([t, await page.screenshot({type: 'png'})]);
    }
    const reader = await context.newPage();
    for (const [t, png] of frames) {
      shares.push([t, await placeholderShare(reader, png)]);
    }
  }
  await sleep(Math.max(0, SECONDS * 1000 - (Date.now() - started)));

  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  const marks = await page.evaluate(() => window.__heroMarks);
  await context.close();

  const relative = ms =>
    ms === undefined ? undefined : Math.round(ms - timeOrigin);
  return {
    canvas: marks.canvas && Math.round(marks.canvas),
    shares,
    requests: [...requests.values()].map(request => ({
      group: group(request.url),
      path: new URL(request.url).pathname,
      priority: request.priority,
      start: relative(request.start),
      end: relative(request.end),
    })),
  };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const results = [];
for (let run = 1; run <= RUNS; run++) {
  const result = await load(browser);
  results.push(result);

  console.log(
    `\nRun ${run}: ${WIDTH}x${HEIGHT}, ${MBPS} Mbps, ${LATENCY} ms, cache ${CACHE_OFF ? 'off' : 'on'}`,
  );
  console.log(
    `  The canvas takes over from the CSS layout (the page script is in): ${result.canvas ?? 'not in time'} ms`,
  );
  const groups = new Map();
  for (const request of result.requests) {
    const g = groups.get(request.group) ?? {
      count: 0,
      first: Infinity,
      last: -Infinity,
      open: 0,
      priorities: new Set(),
    };
    g.count++;
    g.first = Math.min(g.first, request.start);
    if (request.end === undefined) g.open++;
    else g.last = Math.max(g.last, request.end);
    g.priorities.add(request.priority);
    groups.set(request.group, g);
  }
  for (const [name, g] of [...groups].sort((a, b) => a[1].first - b[1].first)) {
    console.log(
      `  ${name.padEnd(15)} ${String(g.count).padStart(3)} requests, first start ${String(g.first).padStart(5)} ms, last end ${g.last === -Infinity ? '    -' : String(g.last).padStart(5)} ms${g.open ? `, ${g.open} not in yet` : ''}  [${[...g.priorities].join(', ')}]`,
    );
  }
  if (result.shares.length) {
    console.log(
      '  Placeholder share of the viewport: ' +
        result.shares
          .map(([t, share]) => `${t}s ${Math.round(share * 100)}%`)
          .join(', '),
    );
  }
}

const lastStill = results.map(({requests}) => {
  const stills = requests.filter(r => r.group === 'still');
  return stills.some(r => r.end === undefined)
    ? undefined
    : Math.max(...stills.map(r => r.end));
});
console.log(
  `\nMedian of ${RUNS}: last still in ${
    lastStill.includes(undefined) ? 'not in time' : `${median(lastStill)} ms`
  }, canvas takes over ${median(results.map(r => r.canvas ?? Infinity))} ms`,
);
console.log(`All runs, last still: ${lastStill.join(', ')} ms`);

await browser.close();
stopServer();
