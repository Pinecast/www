# Reading the design system out of Figma

This repo is the working source of truth for the Pinecast identity — the
`--color-*` block in `src/pages/_document.tsx`, the four faces in `src/fonts.ts`,
and the type roles in `src/components/Typography.tsx`. But it is not the
_authoritative_ one: the Figma file below defines conventions the code does not
record, and the two have drifted in a few places.

This document is the workflow for reading the Figma system, written up after
using it to restyle the [changelog](https://github.com/Pinecast/changelog).

## The file

**"Pinecast — Website Identity"**, file key `QzDwa534AXyNpHnDAILOR7`.

Five pages: `Cover`, a divider, `Website`, `Sound Design`, and **`Design System`**
(node `1:29`). The Design System page is the one that matters — it holds the
local variables, the local paint and text styles, and ~40 component sets
(`Buttons` `11:501`, `Icons`, `Logo`, `Desktop/Navigation` `11:547`,
`Desktop/Footer`, and the `Mobile/*` equivalents).

The components are **not published as a library**. `get_libraries` on this file
returns only community UI kits, so `search_design_system` and Code Connect have
nothing Pinecast-specific to resolve. Publishing the library is the unlock for
component-level design-to-code; until then, read the styles directly.

## Prerequisites

- A **Full seat** on a paid plan _in the org that owns the file_. MCP tool calls
  are quota'd per seat, and a View seat exhausts the quota in a handful of calls.
  `whoami` reports the seat for your plan, which is not necessarily the plan that
  governs a given file — the rate-limit error names the one that actually applies.
- The **Figma desktop app installed and running**. Selection-based tools
  (`get_variable_defs`) talk to it, and fail with "You currently have nothing
  selected" when it is not up.

## Two traps

**`get_metadata` under-reports this file.** It lists only the pages Figma has
loaded, which meant it reported a single-page file (`Cover`) when there are five
— including the entire design system. It also fails outright on the large pages
with `Failed to parse SSE message / Invalid JSON: EOF`, at any seat level; the
board is too big for the response. Do not use it to survey this file.

**Load the `figma-use` skill before calling `use_figma`.** Read
`skill://figma/figma-use/SKILL.md` via `get_figma_skill` if the plugin skill is
not available. It documents the Plugin API rules that `use_figma` enforces.

## The workflow

Drive the Plugin API with read-only `use_figma` scripts instead. This sidesteps
both traps and returns exactly the fields you want.

Survey the file:

```js
return figma.root.children.map((p) => ({ id: p.id, name: p.name }));
```

Dump the system (switch pages at most once per call):

```js
const ds = figma.root.children.find((p) => p.name === 'Design System');
await figma.setCurrentPageAsync(ds);

const hex = (c) => {
  if (!c) return null;
  const n = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return '#' + n(c.r) + n(c.g) + n(c.b) + (c.a !== undefined && c.a < 1 ? n(c.a) : '');
};

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const col = collections[0];
const vars = [];
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  vars.push({
    name: v.name,
    byMode: col.modes.map((m) => ({ mode: m.name, value: hex(v.valuesByMode[m.modeId]) })),
  });
}

return {
  variables: vars,
  paintStyles: (await figma.getLocalPaintStylesAsync()).map((s) => ({
    name: s.name,
    hex: hex(s.paints[0]?.color),
  })),
  textStyles: (await figma.getLocalTextStylesAsync()).map((s) => ({
    name: s.name,
    font: `${s.fontName.family} ${s.fontName.style}`,
    size: s.fontSize,
    lineHeight: s.lineHeight?.value,
    letterSpacing: s.letterSpacing?.value,
    case: s.textCase,
  })),
  components: ds
    .findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] })
    .map((n) => ({ name: n.name, id: n.id })),
};
```

`get_screenshot` still works well for individual nodes — it is the fastest way
to check a component's states against what the code renders.

## What the system encodes that the code does not

### Core vs Illustration is a rule, not a label

The paint styles are split into `Core - *` and `Illustration - *`. Core colours
are for UI; Illustration colours are for artwork. That means the UI accent
palette is only **Orchid** and **Lime** — Grape, Sky, Forest, Sunrise, Sunset
and Rose are not accent colours, however useful they look.

| Core | |
| --- | --- |
| Primary Dark (Space) | `#090909` |
| Primary Light (Sand) | `#f8f4eb` |
| Accent (**Stone**) | `#888888` |
| Secondary brand (Orchid) | `#dbaeff` |
| Secondary brand (Lime) | `#c4ff7e` |
| Secondary Light (White) | `#ffffff` |

Illustration ramps are Grape, Sky, Forest, Sunrise, Sunset, Rose. The neutral
`#888` has a name — **Stone** — that the code only knows as `--color-core-accent`.

### Ginto Nord is for top-level titles only

`H1`/`H2`/`H3` are ABC Ginto Nord Condensed **Black**, uppercase. Everything
inside prose is Monument Grotesk: `Subhead`, `Body 1`, `Body 3` are Bold;
`Body 2`, `Body 4` are Regular. `mdx-components.tsx` already follows this by
mapping `##` to `Subtitle`.

Semi-Mono is reserved for four roles: **`Link`**, **`Overline`**, **`Caption`**
and **`Ticker`**. Notably `Pill Button 1` and `Pill Button 2` are Monument
Grotesk *Regular*, not Semi-Mono.

Tracking: H1/H2 are −4% at 90% line height; H3 drops to 0%. `Link`, `Overline`
and `Caption` are all **0%** — Semi-Mono is wide enough already.

## Where this repo diverges from the Figma system

These are live discrepancies, not bugs to fix blindly — but they should be
reconciled deliberately rather than by accident.

| | Figma | This repo |
| --- | --- | --- |
| `Line` | Space @ 50% (`#09090980`) light, White @ 50% dark | solid `var(--color-space)` light, `#888` dark |
| MDX link tracking | `Link` style is 0% | `mdx-components.tsx` adds `-1px` |
| Focus ring | no Illustration colour in UI | `PrimaryButton`/`SecondaryButton` use `--color-sky` |
| Pale ramp step | named `20%` | named `-25` (`--color-sky-25`, etc.) |
| Grape ramp | 100% and 50% only | also defines `--color-grape-25` |

The dark-mode `Line` values are effectively equivalent (`#888` is about what
White @ 50% resolves to over Space), so the light mode solid hairline is the
real divergence — it renders much heavier than the system specifies.
