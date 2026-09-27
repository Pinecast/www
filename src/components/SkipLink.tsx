import {NO_MOTION_PREFERENCE_QUERY} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';

// The id of the <main> element on each page, which the skip link goes to.
export const MAIN_CONTENT_ID = 'main-content';

// Off screen, past the top-left corner, turned and a little small. When the
// link gets focus, it slides out from the corner to its place.
const TUCKED_AWAY = {
  rotate: '-8deg',
  scale: '0.8',
  translate: 'calc(-100% - 16px) calc(-100% - 16px)',
};

// The first focusable element on each page. It waits off screen until it has
// keyboard focus, and then it shows above the header like a speech bubble.
export const SkipLink = () => {
  const css = useCSS();
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={css({
        ...MonumentGroteskBold,
        backgroundColor: 'var(--color-white)',
        borderColor: 'var(--color-space)',
        // The tight corner points at the corner of the screen, like the tail
        // of a speech bubble.
        borderRadius: '3px 22px 22px 22px',
        borderStyle: 'solid',
        borderWidth: '2px',
        boxShadow: '3px 4px 0 rgba(9, 9, 9, 0.18)',
        color: 'var(--color-space)',
        fontSize: '16px',
        left: '10px',
        lineHeight: '20px',
        padding: '16px 22px',
        position: 'fixed',
        textDecoration: 'none',
        top: '10px',
        transformOrigin: 'top left',
        whiteSpace: 'nowrap',
        zIndex: 200,
        // The slide stops without overshoot. Only the turn and the size go a
        // little past their end and come back, so that the link pops into
        // place instead of lurching.
        [NO_MOTION_PREFERENCE_QUERY]: {
          transition:
            'translate 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), ' +
            'rotate 0.4s cubic-bezier(0.34, 1.8, 0.64, 1), ' +
            'scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        ':not(:focus)': {
          ...TUCKED_AWAY,
          [NO_MOTION_PREFERENCE_QUERY]: {
            transition:
              'translate 0.15s ease-in, rotate 0.15s ease-in, scale 0.15s ease-in',
          },
        },
      })}
    >
      Skip to main content
    </a>
  );
};
