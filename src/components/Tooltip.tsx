import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {KeyframesObject} from 'styletron-standard';
import {MonumentGroteskSemiMono} from '@/fonts';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {useCSS} from '@/hooks/useCSS';

const TOOLTIP_FADE_TRANSITION_DURATION = 200;
const TOOLTIP_BOUNCE_ANIMATION_DURATION = 1000;
const TOOLTIP_BOUNCE_ANIMATION: KeyframesObject = {
  '0%': {
    translate:
      'calc(1 * var(--tooltip-bounce-x)) calc(1 * var(--tooltip-bounce-y))',
  },
  '15%': {
    translate:
      'calc(-0.25 * var(--tooltip-bounce-x)) calc(-0.25 * var(--tooltip-bounce-y))',
  },
  '30%': {
    translate:
      'calc(-0.2 * var(--tooltip-bounce-x)) calc(-0.2 * var(--tooltip-bounce-y))',
  },
  '45%': {
    translate:
      'calc(-0.15 * var(--tooltip-bounce-x)) calc(-0.15 * var(--tooltip-bounce-y))',
  },
  '60%': {
    translate:
      'calc(0.10 * var(--tooltip-bounce-x)) calc(0.10 * var(--tooltip-bounce-y))',
  },
  '75%': {
    translate:
      'calc(-0.05 * var(--tooltip-bounce-x)) calc(-0.05 * var(--tooltip-bounce-y))',
  },
  '100%': {
    translate:
      'calc(0 * var(--tooltip-bounce-x)) calc(0 * var(--tooltip-bounce-y))',
  },
};

const sharedPseudoelementStyles = {
  animationDuration: `${TOOLTIP_BOUNCE_ANIMATION_DURATION}ms`,
  animationName: TOOLTIP_BOUNCE_ANIMATION,
  animationTimingFunction: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
  display: 'none',
  opacity: '0',
  pointerEvents: 'none',
  position: 'absolute',
  transition: `opacity ${TOOLTIP_FADE_TRANSITION_DURATION}ms ease-in-out 0.05s allow-discrete`,
  zIndex: 100,
} as const;

export enum TooltipPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

type TooltipProps = {
  backgroundColor?: string;
  // Gets the id of the tooltip while it is active. Put it in the
  // `aria-describedby` of the control that the tooltip is for.
  children: (describedBy: string | undefined) => React.ReactNode;
  isActive?: boolean;
  position?: TooltipPosition;
  text: string;
  textColor?: string;
};

export const Tooltip = React.memo(function Tooltip({
  backgroundColor = 'var(--color-primary-dark)',
  children,
  isActive = true,
  position = TooltipPosition.BOTTOM,
  text,
  textColor = 'var(--color-primary-light)',
}: TooltipProps) {
  const css = useCSS();

  const triangleBorderStyles: StyleObject = React.useMemo(() => {
    switch (position) {
      case TooltipPosition.TOP:
        return {
          borderTopColor: 'var(--tooltip-bg)',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        };
      case TooltipPosition.RIGHT:
        return {
          borderTopColor: 'transparent',
          borderRightColor: 'var(--tooltip-bg)',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        };
      case TooltipPosition.BOTTOM:
        return {
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'var(--tooltip-bg)',
          borderLeftColor: 'transparent',
        };
      case TooltipPosition.LEFT:
        return {
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'var(--tooltip-bg)',
        };
    }
  }, [position]);

  const trianglePlacementStyles: StyleObject = React.useMemo(() => {
    switch (position) {
      case TooltipPosition.TOP:
        return {
          left: '50%',
          marginLeft: 'calc(-0.5 * var(--tooltip-triangle-inline-width))',
          bottom:
            'calc(100% + var(--tooltip-gap) - 2 * var(--tooltip-triangle-block-width) + 0.5px)',
        };
      case TooltipPosition.RIGHT:
        return {
          top: '50%',
          marginTop: 'calc(-0.5 * var(--tooltip-triangle-block-width))',
          left: 'calc(100% + var(--tooltip-gap) - 2 * var(--tooltip-triangle-inline-width) + 0.5px)',
        };
      case TooltipPosition.BOTTOM:
        return {
          left: '50%',
          marginLeft: 'calc(-0.5 * var(--tooltip-triangle-inline-width))',
          top: 'calc(100% + var(--tooltip-gap) - 2 * var(--tooltip-triangle-block-width) + 0.5px)',
        };
      case TooltipPosition.LEFT:
        return {
          top: '50%',
          marginTop: 'calc(-0.5 * var(--tooltip-triangle-block-width))',
          right:
            'calc(100% + var(--tooltip-gap) - 2 * var(--tooltip-triangle-inline-width) + 0.5px)',
        };
    }
  }, [position]);

  const tooltipPlacementStyles: StyleObject = React.useMemo(() => {
    switch (position) {
      case TooltipPosition.TOP:
        return {
          left: '50%',
          bottom: 'calc(100% + var(--tooltip-gap))',
          transform:
            'translateX(calc(-50% + 0.5 * var(--tooltip-triangle-inline-width)))',
          minWidth: '100px',
          padding: '10px 10px 6px',
        };
      case TooltipPosition.RIGHT:
        return {
          top: '50%',
          left: 'calc(100% + var(--tooltip-gap))',
          transform:
            'translateY(calc(-50% + 0.5 * var(--tooltip-triangle-block-width)))',
          minWidth: '145px',
          padding: '10px 10px 8px',
        };
      case TooltipPosition.BOTTOM:
        return {
          left: '50%',
          top: 'calc(100% + var(--tooltip-gap))',
          transform:
            'translateX(calc(-50% + 0.5 * var(--tooltip-triangle-inline-width)))',
          minWidth: '100px',
          padding: '10px 10px 6px',
        };
      case TooltipPosition.LEFT:
        return {
          top: '50%',
          right: 'calc(100% + var(--tooltip-gap))',
          transform:
            'translateY(calc(-50% + 0.5 * var(--tooltip-triangle-block-width)))',
          minWidth: '145px',
          padding: '10px 10px 8px',
        };
    }
  }, [position]);

  const baseStyles: StyleObject = React.useMemo(() => {
    switch (position) {
      case TooltipPosition.TOP:
        return {
          '--tooltip-bounce-x': '0px',
          '--tooltip-bounce-y': 'calc(-1 * var(--tooltip-bounce-distance))',
          '--tooltip-triangle-block-width': 'var(--tooltip-triangle-height)',
          '--tooltip-triangle-inline-width': 'var(--tooltip-triangle-width)',
        };
      case TooltipPosition.RIGHT:
        return {
          '--tooltip-bounce-x': 'var(--tooltip-bounce-distance)',
          '--tooltip-bounce-y': '0px',
          '--tooltip-triangle-block-width': 'var(--tooltip-triangle-width)',
          '--tooltip-triangle-inline-width': 'var(--tooltip-triangle-height)',
        };
      case TooltipPosition.BOTTOM:
        return {
          '--tooltip-bounce-x': '0px',
          '--tooltip-bounce-y': 'var(--tooltip-bounce-distance)',
          '--tooltip-triangle-block-width': 'var(--tooltip-triangle-height)',
          '--tooltip-triangle-inline-width': 'var(--tooltip-triangle-width)',
        };
      case TooltipPosition.LEFT:
        return {
          '--tooltip-bounce-x': 'calc(-1 * var(--tooltip-bounce-distance))',
          '--tooltip-bounce-y': '0px',
          '--tooltip-triangle-block-width': 'var(--tooltip-triangle-width)',
          '--tooltip-triangle-inline-width': 'var(--tooltip-triangle-height)',
        };
    }
  }, [position]);

  const tooltipId = React.useId();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  // Keyboard focus on the control shows the tooltip, as a hover does. A
  // mouse click, which also gives focus, does not.
  const [hasFocusVisible, setHasFocusVisible] = React.useState(false);
  // Escape hides the tooltip until the pointer and the focus have both left
  // (WCAG 1.4.13).
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!isActive) {
      return;
    }
    const handleKeyDown = (evt: KeyboardEvent) => {
      const wrapper = wrapperRef.current;
      if (
        evt.key === 'Escape' &&
        wrapper &&
        (wrapper.matches(':hover') || wrapper.contains(document.activeElement))
      ) {
        setDismissed(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  const shown: StyleObject = {
    opacity: '1',
    pointerEvents: 'unset',
    visibility: 'visible',
  };
  const canShow = isActive && !dismissed;
  const isShown = canShow && hasFocusVisible;

  return (
    <div
      ref={wrapperRef}
      className={css({
        ...baseStyles,
        '--tooltip-bg': backgroundColor,
        '--tooltip-bounce-distance': '10px',
        '--tooltip-gap': '10px',
        '--tooltip-triangle-height': '4px',
        '--tooltip-triangle-width': '6px',
        cursor: 'pointer',
        position: 'relative',
        // TODO: Handle touchstart/touchend on mobile.
        ...(canShow
          ? {
              ':hover::after': {display: 'block', ...shown},
              ':hover > [role=tooltip]': shown,
            }
          : {}),
        ['::after']: {
          ...sharedPseudoelementStyles,
          ...triangleBorderStyles,
          ...trianglePlacementStyles,
          borderBlockWidth: 'var(--tooltip-triangle-block-width)',
          borderInlineWidth: 'var(--tooltip-triangle-inline-width)',
          borderStyle: 'solid',
          content: '""',
          display: isActive ? 'unset' : 'none',
          height: '0',
          width: '0',
          ...(isShown ? {display: 'block', ...shown} : {}),
        },
      })}
      onFocus={evt => setHasFocusVisible(evt.target.matches(':focus-visible'))}
      onBlur={evt => {
        setHasFocusVisible(false);
        if (
          !wrapperRef.current?.contains(evt.relatedTarget) &&
          !wrapperRef.current?.matches(':hover')
        ) {
          setDismissed(false);
        }
      }}
      onMouseLeave={() => {
        if (!wrapperRef.current?.contains(document.activeElement)) {
          setDismissed(false);
        }
      }}
    >
      {children(isActive ? tooltipId : undefined)}
      {isActive && (
        // A real element, not generated content, so that the control can
        // point to it with `aria-describedby`.
        <span
          id={tooltipId}
          role="tooltip"
          className={css({
            ...sharedPseudoelementStyles,
            ...MonumentGroteskSemiMono,
            ...tooltipPlacementStyles,
            backgroundColor: 'var(--tooltip-bg)',
            borderRadius: '4px',
            color: textColor,
            display: 'block',
            fontWeight: 400,
            fontSize: '11px',
            lineHeight: '13px',
            textAlign: 'center',
            // Hidden also from assistive technology until it shows. The
            // description stays: `aria-describedby` reads hidden text.
            transition:
              `opacity ${TOOLTIP_FADE_TRANSITION_DURATION}ms ease-in-out 0.05s, ` +
              `visibility ${TOOLTIP_FADE_TRANSITION_DURATION}ms ease-in-out 0.05s`,
            visibility: 'hidden',
            [MIN_TABLET_MEDIA_QUERY]: {
              fontSize: '12px',
              lineHeight: '14px',
            },
            ...(isShown ? shown : {}),
          })}
        >
          {text}
        </span>
      )}
    </div>
  );
});
