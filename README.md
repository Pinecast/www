This is the marketing website for Pinecast. It currently deploys to `www-next.pinecast.com`.


## Getting Started

First, run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Checks

```sh
npm run lint
npx tsc --noEmit
npm run build       # static export to out/
npm test            # Playwright: keyboard, landmark and axe checks on out/
```

`npm test` serves `out/`, so build first. It needs Playwright's Chromium once:
`npx playwright install chromium`.


## Design

The identity lives in this repo as the `--color-*` block in
`src/pages/_document.tsx`, the faces in `src/fonts.ts`, and the type roles in
`src/components/Typography.tsx`. The Figma file behind it records conventions
the code does not — see [docs/figma-workflow.md](docs/figma-workflow.md) for how
to read it, and for the places the two have drifted apart.
