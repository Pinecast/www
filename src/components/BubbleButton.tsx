import * as React from 'react';
import {KeyframesObject} from 'styletron-standard';
import {useCSS} from '@/hooks/useCSS';
import {CAN_HOVER_MEDIA_QUERY, PREFERS_REDUCED_MOTION_QUERY} from '@/constants';

const DRIFT_ANIMATION: KeyframesObject = {
  '0%, 100%': {translate: '0 -10%'},
  '50%': {translate: '0 10%'},
};

export const BubbleButton = ({
  children,
  onClick,
  offsetX = 28,
  offsetY = 14,
  size = 96,
}: {
  children: React.ReactNode;
  onClick?: (evt: React.MouseEvent) => void;
  offsetX?: number;
  offsetY?: number;
  size?: number;
}) => {
  const css = useCSS();
  return (
    <button
      type="button"
      onClick={onClick}
      className={css({
        '--bubble-bg-color': 'var(--color-primary-light)',
        '--bubble-border-color': 'rgba(0, 0, 0, 0.05)',
        '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.25)',
        '--bubble-drop-shadow': '0 2px 2px var(--bubble-drop-shadow-color)',
        '--bubble-inset-color-first': '#555',
        '--bubble-inset-color-last': '#fff',
        '--bubble-size': `${size}px`,
        '--bubble-inset-transition': 'all 1s linear',
        animationDuration: '6s',
        animationIterationCount: 'infinite',
        animationName: DRIFT_ANIMATION,
        animationDelay: '0.2s',
        animationTimingFunction: 'linear',
        appearance: 'none',
        backgroundColor: 'var(--bubble-bg-color)',
        borderColor: 'var(--bubble-border-color)',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: '2px',
        boxShadow:
          'inset 0 0 calc(var(--bubble-size) / 8) rgba(255, 255, 255, 0.25)',
        display: 'grid',
        cursor: 'pointer',
        filter: 'drop-shadow(var(--bubble-drop-shadow))',
        height: 'var(--bubble-size)',
        left: `${offsetX}px`,
        padding: '0',
        position: 'absolute',
        placeSelf: 'center',
        placeItems: 'center',
        top: `${offsetY}px`,
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        width: 'var(--bubble-size)',
        [PREFERS_REDUCED_MOTION_QUERY]: {
          animationDuration: '0.01ms',
          animationIterationCount: '1',
          transitionDuration: '0.01ms',
        },
        ':hover': {
          '--bubble-bg-color': 'rgba(255, 255, 255, 1)',
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
          zIndex: 120,
          transition: 'var(--bubble-inset-transition)',
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transitionDuration: '0.01ms',
          },
        },

        ['::after']: {
          borderBottom: 'calc(var(--bubble-size) / 24) solid purple',
          borderTop: '10px solid green',
          borderRadius: '50%',
          content: '""',
          filter: 'blur(calc(var(--bubble-size) / 15))',
          inset: 'calc(var(--bubble-size) / 24)',
          position: 'absolute',
          top: 0,
          bottom: 0,
          height: '96px',
          zIndex: 100,
          transform: 'rotate(-30deg)',
          transition: 'var(--bubble-inset-transition)',
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transitionDuration: '0.01ms',
          },
        },
      })}
    >
      {children}
    </button>
  );
};
330 - 360;
