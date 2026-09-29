import {StyleObject} from 'styletron-react';

export const DESKTOP_BREAKPOINT = 1280;
export const TABLET_BREAKPOINT = 1180;
export const MOBILE_BREAKPOINT = 700;

export const DESKTOP_MEDIA_QUERY = `@media (max-width: ${DESKTOP_BREAKPOINT}px)`;
export const TABLET_MEDIA_QUERY = `@media (max-width: ${TABLET_BREAKPOINT}px)`;
export const MOBILE_MEDIA_QUERY = `@media (max-width: ${MOBILE_BREAKPOINT}px)`;

// FYI: There's no "min. mobile" media query for "mobile-first" CSS.
export const MIN_TABLET_MEDIA_QUERY = `@media (min-width: ${
  TABLET_BREAKPOINT + 1
}px)`;
export const MIN_DESKTOP_MEDIA_QUERY = `@media (min-width: ${
  DESKTOP_BREAKPOINT + 1
}px)`;

// The maximum width and the side padding of the content section of the page
// layouts. The titles in it fit their words to the width that is left.
export const CONTENT_MAX_WIDTH = 1375;
export const CONTENT_SIDE_PADDING = 10;
export const CONTENT_SIDE_PADDING_TABLET = 150;

export const CAN_HOVER_MEDIA_QUERY = `@media (any-hover: hover)`;

export const PREFERS_REDUCED_MOTION_QUERY = `@media (prefers-reduced-motion: reduce)`;
// Put optional motion under this query, so that it is off by default.
export const NO_MOTION_PREFERENCE_QUERY = `@media (prefers-reduced-motion: no-preference)`;

export const ANTIALIASED: StyleObject = {
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmooth: 'grayscale',
};

// Removes the browser's button look, so that a <button> can take the look of
// the text or link it replaces. Spread it first and override from there.
export const BUTTON_RESET: StyleObject = {
  appearance: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  borderWidth: 0,
  color: 'inherit',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontStyle: 'inherit',
  fontWeight: 'inherit',
  letterSpacing: 'inherit',
  lineHeight: 'inherit',
  margin: 0,
  padding: 0,
  textAlign: 'inherit',
  textTransform: 'inherit',
  wordSpacing: 'inherit',
};

// The keyboard focus ring (`:focus-visible` in _document.tsx) is
// `--color-focus-ring`: primary-dark, unless a surface changes it. Spread
// DARK_SURFACE on a dark surface, so that the ring is white on it. Spread
// ADAPTIVE_SURFACE on the header parts, whose colors follow the dark
// sections, and on a light surface inside a dark one after it sets its own
// primary-dark.
export const DARK_SURFACE: StyleObject = {
  '--color-focus-ring': 'var(--color-white)',
};
export const ADAPTIVE_SURFACE: StyleObject = {
  '--color-focus-ring': 'var(--color-primary-dark)',
};
