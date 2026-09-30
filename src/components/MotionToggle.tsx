import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {useCSS} from '@/hooks/useCSS';
import {useMotion} from '@/hooks/useMotion';
import {Pause} from '@/icons/Pause';
import {ScreenReaderText} from './ScreenReaderText';
import {Tooltip, TooltipPosition} from './Tooltip';

// With the 2px border, the toggle is a 20px square: about the size and the
// stroke of the sign-in and menu icons.
const ICON_SIZE = 16;

// The "Pause animations" toggle of the header. Its name stays the same, and
// `aria-pressed` tells whether the animations are paused.
//
// On screen, the pressed toggle is a filled button with the colors of the
// header reversed: a dark square with a light icon. The focus ring is an
// outline around the icon. So, the four combinations of pressed and focused
// all look different:
// - not pressed, no focus: the icon
// - not pressed, focus: the icon in a ring
// - pressed, no focus: a filled square with a light icon
// - pressed, focus: a filled square with a light icon, in a ring
//
// The tooltip shows the name on hover and on keyboard focus, as the one of the
// mute button does (WCAG 1.4.13).
export const MotionToggle = ({
  style,
  wrapperStyle,
}: {
  // Styles for the button.
  style?: StyleObject;
  // Styles for the element that holds the button and its tooltip.
  wrapperStyle?: StyleObject;
}) => {
  const css = useCSS();
  const {paused, togglePaused} = useMotion();
  return (
    <Tooltip
      position={TooltipPosition.BOTTOM}
      style={{display: 'flex', ...wrapperStyle}}
      text="Pause animations"
    >
      {/* The tooltip says what the name of the button says. So, the button
          does not point to it with `aria-describedby`: a screen reader would
          say the name two times. */}
      {() => (
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
            // The button is as tall as the header. Put the focus ring
            // around the icon, not around the button.
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
              // The fill goes under the transparent border, so that the
              // pressed square is as large as the border box.
              backgroundColor: paused
                ? 'var(--color-primary-dark)'
                : 'transparent',
              borderColor: 'transparent',
              borderRadius: '5px',
              borderStyle: 'solid',
              borderWidth: '2px',
              // The icon takes the color of the span.
              color: paused ? 'var(--color-primary-light)' : 'inherit',
              display: 'block',
              lineHeight: 0,
              transition:
                'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
            })}
          >
            <Pause size={ICON_SIZE} />
          </span>
        </button>
      )}
    </Tooltip>
  );
};
