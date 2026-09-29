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
