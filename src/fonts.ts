const GINTO_NORD_CONDENSED = '/fonts/ginto-nord-condensed.woff2';
const MONUMENT_GROTESK_BOLD = '/fonts/monument-grotesk-bold.woff2';
const MONUMENT_GROTESK_REGULAR = '/fonts/monument-grotesk-regular.woff2';
const MONUMENT_GROTESK_SEMIMONO = '/fonts/monument-grotesk-semimono.woff2';

// Each page has text in all four faces at the top. _document preloads them, so
// that the browser fetches them with the page, not once it has laid out the
// text: until a face is in, its text is invisible or in a fallback face.
export const FONT_URLS = [
  GINTO_NORD_CONDENSED,
  MONUMENT_GROTESK_BOLD,
  MONUMENT_GROTESK_REGULAR,
  MONUMENT_GROTESK_SEMIMONO,
];

export const GintoNordCondensed = {
  fontFamily: {
    src: `url(${GINTO_NORD_CONDENSED})`,
  },
};
export const MonumentGroteskBold = {
  fontFamily: {
    src: `url(${MONUMENT_GROTESK_BOLD})`,
  },
};
export const MonumentGroteskRegular = {
  fontFamily: {
    src: `url(${MONUMENT_GROTESK_REGULAR})`,
  },
};
export const MonumentGroteskSemiMono = {
  fontFamily: {
    src: `url(${MONUMENT_GROTESK_SEMIMONO})`,
  },
};
