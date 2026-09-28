import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {useCSS} from '@/hooks/useCSS';
import {useMotion} from '@/hooks/useMotion';
import {Pause} from '@/icons/Pause';
import {ScreenReaderText} from './ScreenReaderText';

// The "Pause animations" toggle of the header. Its name stays the same, and
// `aria-pressed` tells whether the animations are paused. On screen, the pause
// icon sits in a filled square while it is pressed.
export const MotionToggle = ({
  iconSize,
  style,
}: {
  iconSize: number;
  style?: StyleObject;
}) => {
  const css = useCSS();
  const {paused, togglePaused} = useMotion();
  return (
    <button
      type="button"
      aria-pressed={paused}
      className={css({
        appearance: 'none',
        backgroundColor: 'transparent',
        borderWidth: '0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        ...style,
      })}
      onClick={evt => {
        evt.preventDefault();
        togglePaused();
      }}
    >
      <ScreenReaderText>Pause animations</ScreenReaderText>
      <span
        className={css({
          backgroundColor: paused ? 'var(--color-primary-dark)' : 'transparent',
          borderRadius: '6px',
          display: 'block',
          lineHeight: 0,
          padding: '3px',
          transition: 'background-color 0.2s ease-in-out',
        })}
      >
        <Pause
          size={iconSize}
          color={
            paused ? 'var(--color-primary-light)' : 'var(--color-primary-dark)'
          }
        />
      </span>
    </button>
  );
};
