import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {useCSS} from '@/hooks/useCSS';
import {useMotion} from '@/hooks/useMotion';
import {Pause} from '@/icons/Pause';
import {ScreenReaderText} from './ScreenReaderText';

// With the 2px outline, the pressed toggle is a 20px square: about the size
// and the stroke of the sign-in and menu icons.
const ICON_SIZE = 16;

// The "Pause animations" toggle of the header. Its name stays the same, and
// `aria-pressed` tells whether the animations are paused. On screen, the pause
// icon gets a ghost outline while it is pressed.
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
        // The button is as tall as the header. Put the focus ring around
        // the icon, as for the pressed state.
        ':focus-visible': {outline: 'none'},
        ':focus-visible [data-focus-ring]': {
          outline: '2px solid var(--color-focus-ring)',
          outlineOffset: '2px',
        },
        ...style,
      })}
      onClick={evt => {
        evt.preventDefault();
        togglePaused();
      }}
    >
      <ScreenReaderText>Pause animations</ScreenReaderText>
      <span
        data-focus-ring
        className={css({
          // Transparent while not pressed, so that the icon does not move.
          borderColor: paused ? 'currentcolor' : 'transparent',
          borderRadius: '5px',
          borderStyle: 'solid',
          borderWidth: '2px',
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
