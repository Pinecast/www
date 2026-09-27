This is the marketing website for Pinecast. It currently deploys to `www-next.pinecast.com`.


## Getting Started

First, run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


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
