import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {useCSS} from '@/hooks/useCSS';
import {useMotion} from '@/hooks/useMotion';
import {Pause} from '@/icons/Pause';
import {ScreenReaderText} from './ScreenReaderText';

// The pause bars are 12px tall at this size, as tall as the sound waveform and
// the menu icon beside them.
const ICON_SIZE = 18;

// The "Pause animations" toggle of the header. Its name stays the same, and
// `aria-pressed` tells whether the animations are paused. On screen, the pause
// icon gets the ghost outline of the secondary buttons while it is pressed.
export const MotionToggle = ({style}: {style?: StyleObject}) => {
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
        color: 'var(--color-primary-dark)',
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
          // Transparent while not pressed, so that the icon does not move.
          borderColor: paused ? 'currentcolor' : 'transparent',
          borderRadius: '5px',
          borderStyle: 'solid',
          borderWidth: '1px',
          display: 'block',
          lineHeight: 0,
          transition: 'border-color 0.2s ease-in-out',
        })}
      >
        <Pause size={ICON_SIZE} />
      </span>
    </button>
  );
};
