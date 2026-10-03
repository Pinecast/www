import {
  mediaCondition,
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from './constants';

// The layouts of the home hero, from the narrowest one.
export type Layout = 'mobile' | 'tablet' | 'desktop';
const LAYOUTS: ReadonlyArray<Layout> = ['mobile', 'tablet', 'desktop'];

// The still images of the home hero. Its canvas draws a still in each tile
// until the video of the tile loads. A layout draws only some of the tiles:
// `from` is the narrowest layout that draws the still, and the wider ones
// draw it too. Mobile draws the central tile only, tablet adds the four corner
// tiles, and desktop adds the two inner ones.
//
// Both the page (`<link rel="preload">` in pages/index.tsx) and the hero (the
// images that it loads, and the tiles of its CSS skeleton) read this list, so
// that they ask for the same files.
export const HERO_STILLS = {
  central: {src: '/images/hero/central.jpg', from: 'mobile'},
  tl: {src: '/images/hero/t-l.jpg', from: 'tablet'},
  tr: {src: '/images/hero/t-r.jpg', from: 'tablet'},
  bl: {src: '/images/hero/b-l.jpg', from: 'tablet'},
  br: {src: '/images/hero/b-r.jpg', from: 'tablet'},
  ml: {src: '/images/hero/ml.jpg', from: 'desktop'},
  mr: {src: '/images/hero/mr.jpg', from: 'desktop'},
} as const satisfies Record<string, {src: string; from: Layout}>;

export type HeroStill = (typeof HERO_STILLS)[keyof typeof HERO_STILLS];

export const drawsStill = (layout: Layout, still: HeroStill): boolean =>
  LAYOUTS.indexOf(layout) >= LAYOUTS.indexOf(still.from);

// The `media` attribute of the `<link rel="preload">` of a still: it matches
// where the hero draws the still. The layouts are the ones of `getLayout` in
// HeroV2: mobile is where MOBILE_MEDIA_QUERY matches, tablet is where
// TABLET_MEDIA_QUERY matches and MOBILE_MEDIA_QUERY does not, and desktop is
// where TABLET_MEDIA_QUERY does not match. `not all and` is the exact opposite
// of a query, also at a fractional width, where `min-width` is not.
export const stillMedia = (still: HeroStill): string | undefined =>
  ({
    mobile: undefined,
    tablet: `not all and ${mediaCondition(MOBILE_MEDIA_QUERY)}`,
    desktop: `not all and ${mediaCondition(TABLET_MEDIA_QUERY)}`,
  })[still.from];
