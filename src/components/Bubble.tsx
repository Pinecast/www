import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {KeyframesObject} from 'styletron-standard';
import {useCSS} from '@/hooks/useCSS';
import {CAN_HOVER_MEDIA_QUERY, PREFERS_REDUCED_MOTION_QUERY} from '@/constants';
import {loopingAnimationProps} from '@/hooks/useMotion';

// One keyframe selector per key: styletron does not hydrate a list such as
// '0%, 100%', and it then gives the name of these keyframes to the next ones
// that the browser renders, over the keyframes that have that name.
const DRIFT_ANIMATION: KeyframesObject = {
  '0%': {translate: '0 -5%'},
  '50%': {translate: '0 5%'},
  '100%': {translate: '0 -5%'},
};

const INSET_GLOW =
  'inset 0 0 calc(var(--bubble-size) / 8) rgba(255, 255, 255, 0.25)';

// The focus ring of a control that shows a bubble. Spread it on the bubble
// while the control has `:focus-visible`. It has two colors, the icon color
// next to the bubble and the bubble color outside that, because the bubble
// floats over any part of the page: one of them stands out on what is behind.
export const BUBBLE_FOCUS_RING: StyleObject = {
  boxShadow: `0 0 0 2px var(--bubble-text-color), ${INSET_GLOW}`,
  outline: '2px solid var(--bubble-bg-color)',
  outlineOffset: '2px',
};

type BubbleProps = {
  color?: string;
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
  size?: number;
};

export const Bubble = ({
  color = 'var(--color-primary-light)',
  children,
  offsetX = 28,
  offsetY = 14,
  size = 96,
}: BubbleProps) => {
  const css = useCSS();
  return (
    <div
      // The drift loops: the "Pause animations" toggle pauses it, and it
      // starts paused with reduced motion.
      {...loopingAnimationProps}
      className={css({
        '--bubble-bg-color': color,
        '--bubble-border-color': 'rgba(0, 0, 0, 0.05)',
        '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.25)',
        '--bubble-drop-shadow': '0 2px 2px var(--bubble-drop-shadow-color)',
        '--bubble-inset-color-first': '#555',
        '--bubble-inset-color-last': '#fff',
        '--bubble-size': `${size}px`,
        '--bubble-inset-transition': 'all 1s linear',
        '--bubble-text-color': 'var(--color-primary-light)',
        animationDuration: '6s',
        animationIterationCount: 'infinite',
        animationName: DRIFT_ANIMATION,
        animationDelay: '0.2s',
        animationTimingFunction: 'linear',
        backgroundColor: 'var(--bubble-bg-color)',
        borderColor: 'var(--bubble-border-color)',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: '2px',
        boxShadow: INSET_GLOW,
        display: 'grid',
        cursor: 'pointer',
        filter: 'drop-shadow(var(--bubble-drop-shadow))',
        height: 'var(--bubble-size)',
        left: `${offsetX}px`,
        position: 'absolute',
        placeSelf: 'center',
        placeItems: 'center',
        top: `${offsetY}px`,
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        width: 'var(--bubble-size)',
        [PREFERS_REDUCED_MOTION_QUERY]: {
          transitionDuration: '0.01ms',
        },
        ':hover': {
          animationPlayState: 'paused',
          [CAN_HOVER_MEDIA_QUERY]: {
            '--bubble-border-color': 'rgba(255, 255, 255, 0.25)',
            '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.75)',
          },
        },

        ['::before']: {
          borderLeft:
            'calc(var(--bubble-size) / 12) solid var(--bubble-inset-color-first)',
          borderRadius: '50%',
          content: '""',
          filter: 'blur(calc(var(--bubble-size) / 15))',
          inset: 'calc(var(--bubble-size) / 24)',
          position: 'absolute',
          transition: 'var(--bubble-inset-transition)',
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transitionDuration: '0.01ms',
          },
        },

        ['::after']: {
          borderBottom: 'calc(var(--bubble-size) / 24) solid purple',
          borderRadius: '50%',
          content: '""',
          filter: 'blur(calc(var(--bubble-size) / 15))',
          inset: 'calc(var(--bubble-size) / 24)',
          position: 'absolute',
          transform: 'rotate(-30deg)',
          transition: 'var(--bubble-inset-transition)',
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transitionDuration: '0.01ms',
          },
        },
      })}
    >
      {children}
    </div>
  );
};
