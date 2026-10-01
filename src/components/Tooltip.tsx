import * as React from 'react';
import {flushSync} from 'react-dom';
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

type Point = {x: number; y: number};

// How far the safe area goes past each side of the tooltip. A pointer on a
// straight line to a point at the edge of the tooltip stays inside it.
const SAFE_AREA_MARGIN = 4;

// The smallest convex polygon that holds all of the points (Andrew's monotone
// chain). The points go around it in the same direction, as `isInPolygon`
// needs.
const convexHull = (points: ReadonlyArray<Point>): Array<Point> => {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = (input: ReadonlyArray<Point>) => {
    const chain: Array<Point> = [];
    for (const point of input) {
      while (
        chain.length >= 2 &&
        cross(chain[chain.length - 2], chain[chain.length - 1], point) <= 0
      ) {
        chain.pop();
      }
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
};

// Whether the point is in the convex polygon, or on its edge, or less than a
// pixel outside it: a pointer on a line to the edge of the tooltip can be
// there, with the rounding of its place.
const isInPolygon = (polygon: ReadonlyArray<Point>, {x, y}: Point) =>
  polygon.every((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    return (
      length === 0 ||
      ((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x)) / length >= -1
    );
  });

type TooltipProps = {
  backgroundColor?: string;
  // Gets the id of the tooltip while it is active. Put it in the
  // `aria-describedby` of the control that the tooltip is for.
  children: (describedBy: string | undefined) => React.ReactNode;
  isActive?: boolean;
  position?: TooltipPosition;
  // Styles for the element that wraps the control, for example to place it in
  // the layout of its parent.
  style?: StyleObject;
  text: string;
  textColor?: string;
};

export const Tooltip = React.memo(function Tooltip({
  backgroundColor = 'var(--color-primary-dark)',
  children,
  isActive = true,
  position = TooltipPosition.BOTTOM,
  style,
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

  // An invisible part of the tooltip that fills the gap between the control
  // and the tooltip, and a little more on each side. The pointer is on one of
  // the two all the way to the tooltip, so the tooltip does not close while
  // the pointer moves onto it (WCAG 1.4.13). It takes its pointer-events from
  // the tooltip, so it is there only while the tooltip shows.
  const bridgePlacementStyles: StyleObject = React.useMemo(() => {
    const across = {
      top: 'calc(-1 * var(--tooltip-gap))',
      bottom: 'calc(-1 * var(--tooltip-gap))',
      width: 'var(--tooltip-gap)',
    };
    const along = {
      left: 'calc(-1 * var(--tooltip-gap))',
      right: 'calc(-1 * var(--tooltip-gap))',
      height: 'var(--tooltip-gap)',
    };
    switch (position) {
      case TooltipPosition.TOP:
        return {...along, top: '100%'};
      case TooltipPosition.RIGHT:
        return {...across, right: '100%'};
      case TooltipPosition.BOTTOM:
        return {...along, bottom: '100%'};
      case TooltipPosition.LEFT:
        return {...across, left: '100%'};
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
  const tooltipRef = React.useRef<HTMLSpanElement>(null);
  // Keyboard focus on the control shows the tooltip, as a hover does. A
  // mouse click, which also gives focus, does not.
  const [hasFocusVisible, setHasFocusVisible] = React.useState(false);
  // Escape hides the tooltip until the pointer and the focus have both left
  // (WCAG 1.4.13).
  const [dismissed, setDismissed] = React.useState(false);
  // The pointer has left the control, and it goes to the tooltip. The tooltip
  // stays open while the pointer is inside this polygon (WCAG 1.4.13). The
  // invisible bridge covers only the gap between the control and the tooltip.
  // The polygon covers all of the straight lines from the last place of the
  // pointer on the control to each part of the tooltip, also where the control
  // is taller or narrower than the tooltip.
  const [safeArea, setSafeArea] = React.useState<Array<Point> | null>(null);
  // The last place of the pointer on the control (not on the tooltip). The
  // pointer can leave in one jump, so the place where it left says little
  // about where it goes. The line from the place before it does.
  const lastPointerRef = React.useRef<Point | null>(null);
  const trackPointer = (evt: React.PointerEvent) => {
    lastPointerRef.current = tooltipRef.current?.contains(evt.target as Node)
      ? null
      : {x: evt.clientX, y: evt.clientY};
  };

  React.useEffect(() => {
    if (!safeArea) {
      return;
    }
    const end = () => setSafeArea(null);
    const handlePointerMove = (evt: PointerEvent) => {
      if (!isInPolygon(safeArea, {x: evt.clientX, y: evt.clientY})) {
        end();
      }
    };
    // The polygon is for the page as it was when the pointer left. A press or
    // a scroll ends it, and so does a pointer that leaves the page, because a
    // page gets no move from it.
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerdown', end, true);
    document.addEventListener('scroll', end, true);
    document.documentElement.addEventListener('mouseleave', end);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', end, true);
      document.removeEventListener('scroll', end, true);
      document.documentElement.removeEventListener('mouseleave', end);
    };
  }, [safeArea]);

  React.useEffect(() => {
    if (!isActive || dismissed) {
      return;
    }
    const handleKeyDown = (evt: KeyboardEvent) => {
      const wrapper = wrapperRef.current;
      const isHovered = !!wrapper?.matches(':hover');
      // Only while the tooltip shows: on hover, on keyboard focus, or while
      // the pointer goes from the control to the tooltip.
      if (
        evt.key !== 'Escape' ||
        !wrapper ||
        !(isHovered || hasFocusVisible || safeArea)
      ) {
        return;
      }
      // This listens in the capture phase and stops the event, so that
      // Escape hides only the tooltip. Other Escape handlers on the page, such
      // as the open header menu (useDismiss), do not get it.
      evt.stopPropagation();
      // With the pointer and the focus gone, there is nothing left to wait
      // for, and the tooltip can show again at once.
      if (isHovered || hasFocusVisible) {
        setDismissed(true);
      }
      setSafeArea(null);
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [dismissed, hasFocusVisible, isActive, safeArea]);

  const shown: StyleObject = {
    opacity: '1',
    pointerEvents: 'unset',
    visibility: 'visible',
  };
  const canShow = isActive && !dismissed;
  const isShown = canShow && (hasFocusVisible || safeArea !== null);

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
        ...style,
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
      // Pointer events, not mouse events: they give the place of the pointer
      // with its fraction, and the direction of a pointer that moves 1px at a
      // time needs it.
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
      onPointerLeave={evt => {
        const tooltip = tooltipRef.current;
        const from = lastPointerRef.current;
        lastPointerRef.current = null;
        // A pointer that leaves the page (no related target) does not come
        // back to the tooltip on a line.
        if (canShow && tooltip && from && evt.relatedTarget) {
          const box = tooltip.getBoundingClientRect();
          const left = box.left - SAFE_AREA_MARGIN;
          const right = box.right + SAFE_AREA_MARGIN;
          const top = box.top - SAFE_AREA_MARGIN;
          const bottom = box.bottom + SAFE_AREA_MARGIN;
          const area = convexHull([
            from,
            {x: left, y: top},
            {x: right, y: top},
            {x: right, y: bottom},
            {x: left, y: bottom},
          ]);
          // Only a pointer that goes toward the tooltip. One that goes away,
          // or jumps away, closes it at once.
          if (isInPolygon(area, {x: evt.clientX, y: evt.clientY})) {
            // At once: until the new state is in the page, the hover has
            // ended and the tooltip would start to fade out.
            flushSync(() => setSafeArea(area));
          }
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
          ref={tooltipRef}
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
            '::before': {
              ...bridgePlacementStyles,
              content: '""',
              position: 'absolute',
            },
          })}
        >
          {text}
        </span>
      )}
    </div>
  );
});
