export const DESKTOP_BREAKPOINT = 1280;
export const TABLET_BREAKPOINT = 1180;
export const MOBILE_BREAKPOINT = 700;

export const DESKTOP_MEDIA_QUERY = `@media (max-width: ${DESKTOP_BREAKPOINT}px)`;
export const TABLET_MEDIA_QUERY = `@media (max-width: ${TABLET_BREAKPOINT}px)`;
export const MOBILE_MEDIA_QUERY = `@media (max-width: ${MOBILE_BREAKPOINT}px)`;

// FYI: There's no "min. mobile" media query for "mobile-first" CSS.
export const MIN_TABLET_MEDIA_QUERY = `@media (min-width: ${TABLET_BREAKPOINT + 1}px)`;
export const MIN_DESKTOP_MEDIA_QUERY = `@media (min-width: ${DESKTOP_BREAKPOINT + 1}px)`;

export const CAN_HOVER_MEDIA_QUERY = `@media (any-hover: hover)`;
