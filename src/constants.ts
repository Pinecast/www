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

export const CAN_HOVER_MEDIA_QUERY = `@media (any-hover: hover)`;

export const PREFERS_REDUCED_MOTION_QUERY = `@media (prefers-reduced-motion: reduce)`;

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
