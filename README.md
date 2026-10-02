This is the marketing website for Pinecast. It currently deploys to `www-next.pinecast.com`.


## Getting Started

First, run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Checks

```sh
npm run lint        # ESLint, with the jsx-a11y recommended rules
npx tsc --noEmit
npm run build       # static export to out/
npm run check:structure  # headings, lists and alt text in out/
npm test            # Playwright: keyboard, landmark, axe, reflow, text spacing
                    # and target size checks on out/
```

`npm test` serves `out/`, so build first. It needs Playwright's Chromium once:
`npx playwright install chromium`.


## Design

The identity lives in this repo as the `--color-*` block in
`src/pages/_document.tsx`, the faces in `src/fonts.ts`, and the type roles in
`src/components/Typography.tsx`. The Figma file behind it records conventions
the code does not — see [docs/figma-workflow.md](docs/figma-workflow.md) for how
to read it, and for the places the two have drifted apart.


## Accessibility structure

Each page has one `<h1>`, and heading levels don't skip. The heading
components in `src/components/Typography.tsx` and `src/components/TextBlocks.tsx`
take a `level` prop that picks the element separately from the look, so move a
heading in the outline with `level`, not by switching to another component. In
MDX, the number of `#` still picks the look, and
`vendor/rehype-heading-levels.mjs` sets each heading's level from the outline
under the page title.

After a build, `npm run check:structure` reads the static export in `out/`. It
fails if a page doesn't have exactly one `<h1>`, skips a heading level, puts
something other than `<li>` in a list, or has an `<iframe>` with no title or an
`<img>` with no `alt`. It also fails if two different screenshots share the
same alt text.

```sh
npm run build && npm run check:structure
```


## Motion

The "Pause animations" toggle in the header pauses every animation that starts
by itself and runs for more than five seconds (WCAG 2.2.2). Each animation
stops where it is: do not show a still image in its place. With
`prefers-reduced-motion: reduce`, the animations start paused, and the user can
still play them. `src/hooks/useMotion.ts` holds the state, and keeps the choice
in `localStorage`. A choice to pause always holds. A choice to play holds only
under the reduced motion setting that it was made under, so a user who turns on
reduced motion later gets paused animations again.

When you add an animation:

- A looping CSS animation: spread `loopingAnimationProps` on the element. The
  style block in `src/pages/_document.tsx` pauses it. Reduced motion stops all
  other CSS animations and transitions at their end.
- A CSS animation that plays once as the page loads, such as the circles that
  the home hero grows before its canvas takes over: spread
  `introAnimationProps` on the element. While the toggle is on, it shows its
  end at once, as all of them do with reduced motion.
- A canvas loop or a video that feeds a canvas: use `useCanvasDrawing` and
  `useAsyncVideo`. They follow the toggle. Read `isMotionPaused()`, not the
  `paused` value of `useMotion`, in code that starts or stops media: in the
  first render in the browser, `paused` is still the value of the static
  export.
- A `<video>` on the page: use `NoncriticalVideo`. Do not give it `autoPlay`.
- An effect that follows the scroll: with reduced motion, show it in one fixed
  state (`reducedMotion` of `useMotion`), as the page heroes, the home hero and
  the globe do.

`tests/motion.spec.ts` checks each kind.

The toggle shows its pressed state as a filled square with a light icon (the
colors of the header reversed). The focus ring is an outline around the icon.
So, the four combinations of pressed and focused all look different, and the
pressed toggle does not look like a focus ring. The toggle has a tooltip, like
the one of the mute button (`Tooltip`). `tests/motion-toggle.spec.ts` checks
the four states and the tooltip.

A tooltip stays open while the pointer goes to it (WCAG 1.4.13). The bridge
under the tooltip covers the gap, and the "safe area" covers the rest: while
the pointer is inside the convex shape of its last place on the control and the
tooltip, the tooltip stays open. So, the pointer can go on a straight line from
any part of a control, also one that is taller or narrower than its tooltip,
to each part of the tooltip. A pointer that goes away, or jumps away, closes
it at once. `Tooltip` does this, so each tooltip of the site has it.
`tests/motion-toggle.spec.ts` moves the pointer 1px at a time to check it.


## Loading order of the home page

The user sees the hero first. A tile of the hero is purple or lime until its
still image is in. So the stills load first, and nothing that can wait uses the
bandwidth until they are in.

- `src/heroStills.ts` lists the stills and the layouts that draw them. Mobile
  draws one (`central`), tablet five and desktop seven.
- `src/pages/_document.tsx` preloads them, each one with the `media` of the
  layouts that draw it. `HeroV2` loads the same stills (`useAsyncImage`), and
  only the ones that its layout draws. The CSS skeleton of the hero shows them
  too, so the user sees a still when it is in, before the page script runs.
  The canvas reads `img.complete` (`isReady` in `src/canvasHelpers.ts`), so it
  does not paint a placeholder over a still that the skeleton showed.
- `src/hooks/useLoadOrder.ts` makes the rest wait. An image that calls
  `markCritical` (the stills) holds back each hook that calls
  `useAfterCritical`, until the image loads or fails. These wait: the sounds,
  the videos of the hero and of the globe, the image of the globe, the prefetch
  of the footer video, `NoncriticalVideo` (no poster and `preload="none"`
  until then) and the art of the header menu. The sounds also start at the first
  key press or pointer press, so a sound is there when the user asks for it. A
  page without critical images opens the gate after its first render, so on
  the other pages, nothing waits.

Two rules keep the stills from slowing the page script. The hero needs the
script to take over from its CSS layout, and the menu and the buttons need it
too.

- The preloads have `fetchpriority="low"`. At the normal or the high priority,
  the stills took the connections first. At 4 Mbps and 150 ms, the canvas took
  over at 5 to 8 s, not at 1.5 s.
- The preloads come after the scripts in the `<head>`. A browser asks for files
  in the order of the page, and it has six connections to a server that speaks
  HTTP/1.1. React moves a `<link>` to the start of the `<head>` unless it has an
  event handler, so the stills have a handler that does nothing.

`tests/hero-loading.spec.ts` checks the preloads, the order of the requests,
and the change from the CSS layout to the canvas. To measure the times on a
slow connection (4 Mbps and 150 ms by default, a cold cache):

```sh
npm run build
node scripts/measure-hero-loading.mjs out --runs 3 --width 1440 --height 900
```

It also takes `--width 1024` (tablet), `--width 390` (mobile), `--filmstrip`
(the share of the viewport that is still a placeholder color) and a
`CHROMIUM_PATH` for a browser other than the one of Playwright. To compare two
versions, build each one, copy `out/` aside, and run it on each copy.


## Keyboard path through the globe

The globe on the home page shows one feature at a time, as the page scrolls.
The "Learn more" link of each feature is the keyboard path: Tab goes to each one
one time. The three links on the globe (Distribution, Analytics, Monetization)
are for the pointer and for screen readers. They have `tabIndex={-1}`.

When Tab gives a "Learn more" link focus, the page scrolls to the middle of the
scroll range of its feature (`FEATURE_SCROLL_RANGES` in `Globe.tsx`), so that
the globe and the text match. The scroll is smooth. It is at once under reduced
motion and while the animations are paused (`getScrollBehavior` in
`src/hooks/useMotion.ts`). Focus that Tab did not give does not scroll the
page, and the mouse does what it did before.
`tests/globe-keyboard.spec.ts` checks this.

Two rules keep this stable on a busy page:

- Tab is known by a flag that is up during the key press (`isTabPress` in
  `Globe.tsx`), not by the time stamps of the key and of the focus. The time
  stamp of a key press is the time of the press. A busy page gets it some
  hundreds of milliseconds later, and then a window of 100 ms is too short.
- A scroll for a control that got focus starts with `stopScroll`
  (`src/hooks/useMotion.ts`), as the globe and the Play buttons of the
  testimonials do. The browser scrolls (smooth) to the control that had focus
  before, and under load that scroll can start late. A smooth scroll to the
  place where the page still is does not stop it, and then the old scroll takes
  the page away from the new place.

