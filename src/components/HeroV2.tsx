import {StyleObject} from 'styletron-react';
import {KeyframesObject} from 'styletron-standard';
import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {
  MOBILE_MEDIA_QUERY,
  TABLET_BREAKPOINT,
  TABLET_MEDIA_QUERY,
} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import * as React from 'react';
import {useCalculateResizableValue} from '@/hooks/useCalculateResizableValue';
import {
  AV1_MIME,
  preferDrawable,
  useAsyncImage,
  useAsyncVideo,
} from '@/hooks/useAsyncResource';
import {
  dpi,
  drawImageInRoundedRect,
  drawImageProp,
  roundedRectPath,
} from '@/canvasHelpers';
import {useCanvasDrawing} from '@/hooks/useCanvasDrawing';
import {
  introAnimationProps,
  isMotionPaused,
  useMotion,
} from '@/hooks/useMotion';

const RADIUS_OFFSET = 60;
const RADIUS_OFFSET_TABLET = 60;
const RADIUS_OFFSET_MOBILE = 40;

const PADDING_TOP = 120;
const PADDING_TOP_MOBILE = 106;

// The tiles that the canvas draws, in fractions of the space between the 20px
// gaps. On desktop, five columns: an outer and an inner one on each side of the
// central one. On tablet, three: one on each side of the central one. An outer
// column has two tiles, and an inner one two windows on one image. The central
// tile starts 20px under the text.
const SIDE = 256;
const CENTRAL = 530;
const TABLET_SIDE = 176;
const TABLET_CENTRAL = 371;
const OUTER_TOP = 46;
const OUTER_BOTTOM = 32;
const INNER_TOP = 24;
const INNER_BOTTOM = 54;
// OUTER_TOP + OUTER_BOTTOM, and INNER_TOP + INNER_BOTTOM.
const ROWS = 78;

// What a tile shows until its image or video loads.
const PLACEHOLDER_TOP = '#cf8aea'; // --color-grape-50
const PLACEHOLDER_BOTTOM = '#c4ff7e'; // --color-lime

// The middle and the outer circle reach these parts of the height of the hero
// below their center, and this part of half its width plus 20 device pixels to
// the sides of it. The middle one only shows where the hero is wider than
// MIDDLE_CIRCLE_MIN_WIDTH device pixels.
const MIDDLE_CIRCLE_DOWN = 24 / 78;
const OUTER_CIRCLE_DOWN = 48 / 78;
const CIRCLE_ACROSS = 2.5 / 4;
const MIDDLE_CIRCLE_MIN_WIDTH = 1400;

type RadiusTween = {
  inner: number;
  middle: number;
  outer: number;
};

// The circles grow when the page loads. In each frame at 60fps, each one grows
// by this part of what it has left to grow.
const GROWTH: RadiusTween = {inner: 0.1, middle: 0.05, outer: 0.025};

type Layout = 'mobile' | 'tablet' | 'desktop';

// The canvas switches its layout where the grid of the hero does.
const getLayout = (): Layout =>
  matchMedia(MOBILE_MEDIA_QUERY.replace(/^@media\s*/, '')).matches
    ? 'mobile'
    : matchMedia(TABLET_MEDIA_QUERY.replace(/^@media\s*/, '')).matches
      ? 'tablet'
      : 'desktop';

function drawRadius(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#f8f4eb';
  ctx.fill();
}

// The canvas can only draw once the script has loaded. Until then, the
// skeleton shows the first frame that it draws: the tiles in their placeholder
// colors, and the circles that cut into them as they grow. It lays out the same
// shapes in CSS (keep the two in step), above the canvas and under the text.
// When the canvas paints its first frame, it hides the skeleton with
// `--hero-skeleton` on the hero.
const SKELETON_VISIBILITY =
  // The type of `visibility` has no room for `var()`.
  'var(--hero-skeleton, visible)' as 'visible';

// The canvas measures in device pixels at a ratio of at most 2 (`dpi`), and
// some sizes of the circles are in device pixels. CSS has no unit for them, so
// these steps of the ratio give `--hero-device-pixel`, a device pixel in CSS
// pixels, and the width where the middle circle shows.
const DEVICE_PIXEL_RATIOS = [
  0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
];
const deviceMedia = (
  callback: (ratio: number) => [string, StyleObject],
): StyleObject =>
  Object.fromEntries(
    DEVICE_PIXEL_RATIOS.map((ratio, i) => {
      const next = DEVICE_PIXEL_RATIOS[i + 1];
      const query =
        i === 0
          ? `(resolution < ${next}dppx)`
          : next === undefined
            ? `(resolution >= ${ratio}dppx)`
            : `(${ratio}dppx <= resolution < ${next}dppx)`;
      const [extra, style] = callback(ratio);
      return [`@media ${query}${extra}`, style];
    }),
  );

// What is left to grow shrinks by the same part in the same time: the circles
// follow 1 - e^(-t/τ). The skeleton grows them on that curve from the first
// paint, for six time constants, scaled to end at their full size. The canvas
// goes on from where they are.
const GROW_TIME_CONSTANTS = 6;
const GROW_EASING = `linear(${Array.from({length: 41}, (_, i) =>
  (
    (1 - Math.exp((-GROW_TIME_CONSTANTS * i) / 40)) /
    (1 - Math.exp(-GROW_TIME_CONSTANTS))
  ).toFixed(4),
).join(', ')})`;
const GROW_ANIMATION: KeyframesObject = {
  from: {scale: '0'},
  to: {scale: '1'},
};

const skeletonCircle = (growth: number): StyleObject => ({
  animationDuration: `${Math.round(
    (GROW_TIME_CONSTANTS * -1000) / (60 * Math.log(1 - growth)),
  )}ms`,
  animationName: GROW_ANIMATION,
  animationTimingFunction: GROW_EASING,
  aspectRatio: '1',
  backgroundColor: 'var(--color-sand)',
  borderRadius: '50%',
  left: '50%',
  position: 'absolute',
  top: `${RADIUS_OFFSET}px`,
  translate: '-50% -50%',
});

// The diameter of the middle or the outer circle. The skeleton covers the
// hero: `100%` is its height, and `100cqw + 40px` its width (`cqw` measures
// inside its 20px padding).
const skeletonCircleSize = (down: number) =>
  `calc(2 * hypot((100cqw + 40px) / 2 * ${CIRCLE_ACROSS} + 20 * var(--hero-device-pixel), 100% * ${down} + ${RADIUS_OFFSET}px))`;

// The diameter of the inner circle, in the text: it reaches the corners of the
// column of the text, 20px under it. `columnHalf` is half the width of that
// column, from `100cqw`, the width of the content of the hero.
const skeletonInnerCircleSize = (columnHalf: string, offset: number) =>
  `calc(2 * hypot(${columnHalf}, 100% + ${offset + 20}px))`;

const skeletonTile = (
  grow: number,
  color: string,
  zIndex: number,
): StyleObject => ({
  backgroundColor: color,
  borderRadius: '20px',
  flex: `${grow} 1 0`,
  minHeight: 0,
  // The canvas paints the bottom tiles of the outer columns, the outer circle,
  // the top tiles, the middle circle, and then the inner columns.
  zIndex,
});

const skeletonColumn = (hideFrom: string): StyleObject => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  minWidth: 0,
  [hideFrom]: {display: 'none'},
});

// The central tile is in the grid of the text, under it, as wide as the
// canvas draws it.
const skeletonCentralTile = (width: string): StyleObject => ({
  marginLeft: `calc((100% - ${width}) / 2)`,
  width: `calc(${width})`,
});

export const HeroV2 = () => {
  const css = useCSS();

  const wrapper = React.useRef<HTMLElement>(null);
  const size = React.useRef({
    width: 0,
    height: 0,
    windowHeight: 0,
    layout: 'mobile' as Layout,
  });
  if (!size.current.width && typeof document !== 'undefined') {
    size.current.width = document.body.offsetWidth;
    size.current.height = window.innerHeight;
    size.current.windowHeight = window.innerHeight;
    size.current.layout = getLayout();
  }

  const [isMobile, setIsMobile] = React.useState(
    size.current.layout === 'mobile',
  );
  const [isTablet, setIsTablet] = React.useState(
    size.current.layout === 'tablet',
  );

  const canvas = React.useRef<HTMLCanvasElement>(null);
  const innerCircle = React.useRef<HTMLDivElement>(null);
  const middleCircle = React.useRef<HTMLDivElement>(null);
  const outerCircle = React.useRef<HTMLDivElement>(null);
  const skeletonShown = React.useRef(true);
  const lastFrame = React.useRef<number | undefined>(undefined);

  // With reduced motion, the hero does not follow the scroll: it shows how it
  // looks at the top of the page, and it scrolls away with the page. (The
  // videos and the canvas loop follow the "Pause animations" toggle by
  // themselves.)
  const {reducedMotion: isStatic} = useMotion();

  const tli = useAsyncImage('/images/hero/t-l.jpg');
  const tri = useAsyncImage('/images/hero/t-r.jpg');
  const bli = useAsyncImage('/images/hero/b-l.jpg');
  const bri = useAsyncImage('/images/hero/b-r.jpg');
  const mli = useAsyncImage('/images/hero/ml.jpg');
  const mri = useAsyncImage('/images/hero/mr.jpg');
  const ci = useAsyncImage('/images/hero/central.jpg');

  const tlv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/t-l.mp4',
      [AV1_MIME]: '/videos/hero/t-l.av1.mp4',
    },
    !isMobile,
    true,
  );
  const trv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/t-r.mp4',
      [AV1_MIME]: '/videos/hero/t-r.av1.mp4',
    },
    !isMobile,
    true,
  );
  const blv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/b-l.mp4',
      [AV1_MIME]: '/videos/hero/b-l.av1.mp4',
    },
    !isMobile,
    true,
  );
  const brv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/b-r.mp4',
      [AV1_MIME]: '/videos/hero/b-r.av1.mp4',
    },
    !isMobile,
    true,
  );
  const mlv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/ml.mp4',
      [AV1_MIME]: '/videos/hero/ml.av1.mp4',
    },
    !isMobile && !isTablet,
    true,
  );
  const mrv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/mr.mp4',
      [AV1_MIME]: '/videos/hero/mr.av1.mp4',
    },
    !isMobile && !isTablet,
    true,
  );
  const cv = useAsyncVideo(
    {
      'video/mp4': '/videos/hero/central.mp4',
      [AV1_MIME]: '/videos/hero/central.av1.mp4',
    },
    true,
    true,
  );

  const tl = preferDrawable(tlv, tli);
  const tr = preferDrawable(trv, tri);
  const bl = preferDrawable(blv, bli);
  const br = preferDrawable(brv, bri);
  const ml = preferDrawable(mlv, mli);
  const mr = preferDrawable(mrv, mri);
  const c = preferDrawable(cv, ci);

  const textArea = React.useRef<HTMLDivElement>(null);

  const radiusState = React.useRef<RadiusTween>({
    inner: 0,
    middle: 0,
    outer: 0,
  });
  const radiusTarget = React.useRef<RadiusTween>({
    inner: 0,
    middle: 0,
    outer: 0,
  });

  useCanvasDrawing(
    canvas,
    React.useCallback(
      ctx => {
        const {width, height, windowHeight, layout} = size.current;
        const scrollY = isStatic ? 0 : window.scrollY;

        // Take over from the skeleton: grow the circles on from where its
        // circles are, and hide it as this frame shows.
        if (skeletonShown.current) {
          skeletonShown.current = false;
          const grown = (circle: HTMLElement | null) => {
            const scale = circle
              ? parseFloat(getComputedStyle(circle).scale)
              : NaN;
            // `none` once it has grown.
            return Number.isNaN(scale) ? 1 : scale;
          };
          radiusState.current = {
            inner: radiusTarget.current.inner * grown(innerCircle.current),
            middle: radiusTarget.current.middle * grown(middleCircle.current),
            outer: radiusTarget.current.outer * grown(outerCircle.current),
          };
          wrapper.current!.style.setProperty('--hero-skeleton', 'hidden');
        }

        // The circles grow when the page loads, by the same part in the same
        // time at any frame rate, on the curve of the circles of the skeleton.
        // When paused, show them grown. The time is that of the frame, as for
        // CSS animations, not when this callback happens to run.
        const now =
          (document.timeline?.currentTime as number | null) ??
          performance.now();
        const frames = (now - (lastFrame.current ?? now)) / (1000 / 60);
        lastFrame.current = now;
        if (isMotionPaused() || isStatic) {
          radiusState.current = {...radiusTarget.current};
        }
        for (const circle of ['inner', 'middle', 'outer'] as const) {
          radiusState.current[circle] +=
            (radiusTarget.current[circle] - radiusState.current[circle]) *
            (1 - (1 - GROWTH[circle]) ** frames);
        }

        if (scrollY > windowHeight) {
          ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
          return;
        }

        const gap = 20 * dpi;
        const gutter = 10 * dpi;

        // ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
        ctx.fillStyle = '#f8f4eb';
        ctx.fillRect(0, 0, canvas.current!.width, canvas.current!.height);

        const scrollRatio = scrollY / windowHeight;
        const inverseScrollRatio = 1 - scrollRatio;

        const {clientHeight: rawTaHeight, offsetTop: rawTaTop} =
          textArea.current!;
        const taTop = rawTaTop * dpi;
        const taHeight = rawTaHeight * dpi;

        if (layout === 'mobile') {
          ctx.save();
          ctx.beginPath();
          roundedRectPath(
            ctx,
            // 10px left padding
            gutter * inverseScrollRatio,
            // The top is the bottom of the text area + 20px gap
            taHeight + taTop + gap - scrollY * dpi,
            // The width is the wrapper width - 10px padding on each side
            width - 2 * gutter * inverseScrollRatio,
            // The height is the space below the text area - 10px padding - 20px gap
            height -
              taHeight -
              taTop -
              gutter * inverseScrollRatio -
              gap +
              scrollY * dpi,
            Math.max(0, 1 - scrollY / (windowHeight * 0.25)) * 20 * dpi,
          );
          ctx.closePath();
          ctx.clip();
          // Clear everything, which is clipped to the rect above
          ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);

          ctx.globalAlpha = inverseScrollRatio;
          ctx.fillStyle = '#090909';
          ctx.fillRect(0, 0, canvas.current!.width, canvas.current!.height);
          ctx.globalAlpha = Math.max(0, 1 - scrollY / (windowHeight * 0.7));
          drawImageProp(
            c,
            ctx,
            // 10px left padding
            gutter * inverseScrollRatio,
            // The top is the bottom of the text area + 20px gap
            taHeight + taTop + gap - scrollY * dpi,
            // The width is the wrapper width - 10px padding on each side
            width - 2 * gutter * inverseScrollRatio,
            // The height is the space below the text area - 10px padding - 20px gap
            height -
              taHeight -
              taTop -
              gutter * inverseScrollRatio -
              gap +
              scrollY * dpi,
            PLACEHOLDER_BOTTOM,
          );
          ctx.restore();
        } else if (layout === 'tablet') {
          // The gap size is 20px.
          const tabletColumns = 2 * TABLET_SIDE + TABLET_CENTRAL;
          const sideWidth =
            ((width - 2 * gap - 2 * gap) / tabletColumns) * TABLET_SIDE;
          const centralWidth =
            ((width - 2 * gap - 2 * gap) / tabletColumns) * TABLET_CENTRAL;

          const sideTopHeight =
            ((height - taTop - gap - gap) / ROWS) * OUTER_TOP;
          const sideBotHeight =
            ((height - taTop - gap - gap) / ROWS) * OUTER_BOTTOM;

          const xNudge = scrollRatio * (sideWidth + gap + gap);

          // Left bottom
          drawImageInRoundedRect(
            ctx,
            bl,
            gap - xNudge,
            taTop + gap + sideTopHeight,
            sideWidth,
            sideBotHeight,
            20 * dpi,
            PLACEHOLDER_BOTTOM,
          );

          // Right bottom
          drawImageInRoundedRect(
            ctx,
            br,
            gap + sideWidth + gap + centralWidth + gap + xNudge,
            taTop + gap + sideTopHeight,
            sideWidth,
            sideBotHeight,
            20 * dpi,
            PLACEHOLDER_BOTTOM,
          );

          // Left top
          drawImageInRoundedRect(
            ctx,
            tl,
            gap - xNudge,
            taTop,
            sideWidth,
            sideTopHeight,
            20 * dpi,
            PLACEHOLDER_TOP,
          );
          // Right top
          drawImageInRoundedRect(
            ctx,
            tr,
            gap + sideWidth + gap + centralWidth + gap + xNudge,
            taTop,
            sideWidth,
            sideTopHeight,
            20 * dpi,
            PLACEHOLDER_TOP,
          );

          // Central
          ctx.save();
          ctx.beginPath();
          roundedRectPath(
            ctx,
            // 20px left padding, 20px gap, plus the width of the left side
            gap + sideWidth + gap - xNudge,
            // The top is the bottom of the text area + 20px gap
            taHeight + taTop + gap - scrollY * dpi,
            centralWidth + 2 * xNudge,
            // The height is the space below the text area - 20px padding - 20px gap
            height -
              taHeight -
              taTop -
              gap * inverseScrollRatio -
              gap +
              scrollY * dpi,
            Math.max(0, 1 - scrollY / (windowHeight * 0.25)) * 20 * dpi,
          );
          ctx.closePath();
          ctx.clip();
          // Clear everything, which is clipped to the rect above
          ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);

          ctx.globalAlpha = inverseScrollRatio;
          ctx.fillStyle = '#090909';
          ctx.fillRect(0, 0, canvas.current!.width, canvas.current!.height);
          ctx.globalAlpha = Math.max(0, 1 - scrollY / (windowHeight * 0.7));
          drawImageProp(
            c,
            ctx,
            // 20px left padding, 20px gap, plus the width of the left side
            gap + sideWidth + gap - xNudge,
            // The top is the bottom of the text area + 20px gap
            taHeight + taTop + gap - scrollY * dpi,
            centralWidth + 2 * xNudge,
            // The height is the space below the text area - 20px padding - 20px gap
            height -
              taHeight -
              taTop -
              gap * inverseScrollRatio -
              gap +
              scrollY * dpi,
            PLACEHOLDER_BOTTOM,
          );
          ctx.restore();
        } else {
          const columns = 4 * SIDE + CENTRAL;
          const sideWidth =
            ((width - 2 * gap - 2 * gap - 2 * gap) / columns) * SIDE;
          const centralWidth =
            ((width - 2 * gap - 2 * gap - 2 * gap) / columns) * CENTRAL;

          const innerSideTopHeight =
            ((height - taTop - gap - gap) / ROWS) * INNER_TOP;
          const innerSideBotHeight =
            ((height - taTop - gap - gap) / ROWS) * INNER_BOTTOM;

          const outerSideTopHeight =
            ((height - taTop - gap - gap) / ROWS) * OUTER_TOP;
          const outerSideBotHeight =
            ((height - taTop - gap - gap) / ROWS) * OUTER_BOTTOM;

          const xNudge = scrollRatio * (sideWidth * 2 + gap + gap + gap);

          // Left bottom
          drawImageInRoundedRect(
            ctx,
            bl,
            gap - xNudge * 1.5,
            taTop + gap + outerSideTopHeight,
            sideWidth,
            outerSideBotHeight,
            20 * dpi,
            PLACEHOLDER_BOTTOM,
          );
          // Right bottom
          drawImageInRoundedRect(
            ctx,
            br,
            gap +
              sideWidth +
              gap +
              centralWidth +
              gap +
              sideWidth +
              gap +
              sideWidth +
              gap +
              xNudge * 1.5,
            taTop + gap + outerSideTopHeight,
            sideWidth,
            outerSideBotHeight,
            20 * dpi,
            PLACEHOLDER_BOTTOM,
          );
          // Draw outer radius
          drawRadius(
            ctx,
            width / 2,
            RADIUS_OFFSET * dpi - scrollY * 2.25,
            radiusState.current.outer + scrollY * dpi,
          );

          // Left top
          drawImageInRoundedRect(
            ctx,
            tl,
            gap - xNudge * 1.5,
            taTop,
            sideWidth,
            outerSideTopHeight,
            20 * dpi,
            PLACEHOLDER_TOP,
          );
          // Right top
          drawImageInRoundedRect(
            ctx,
            tr,
            gap +
              sideWidth +
              gap +
              centralWidth +
              gap +
              sideWidth +
              gap +
              sideWidth +
              gap +
              xNudge * 1.5,
            taTop,
            sideWidth,
            outerSideTopHeight,
            20 * dpi,
            PLACEHOLDER_TOP,
          );
          if (width > MIDDLE_CIRCLE_MIN_WIDTH) {
            // Draw middle radius
            drawRadius(
              ctx,
              width / 2,
              RADIUS_OFFSET * dpi - scrollY * 2.25,
              radiusState.current.middle + scrollY * dpi,
            );
          }

          // Inner left
          ctx.save();
          ctx.beginPath();
          roundedRectPath(
            ctx,
            gap + sideWidth + gap - xNudge,
            taTop,
            sideWidth,
            innerSideTopHeight,
            20 * dpi,
          );
          roundedRectPath(
            ctx,
            gap + sideWidth + gap - xNudge,
            taTop + innerSideTopHeight + gap,
            sideWidth,
            innerSideBotHeight,
            20 * dpi,
          );
          ctx.closePath();
          ctx.clip();
          drawImageProp(
            ml,
            ctx,
            gap + sideWidth + gap - xNudge,
            taTop,
            sideWidth,
            height - taTop - gap,
            PLACEHOLDER_TOP,
          );
          ctx.restore();

          // Inner right
          ctx.save();
          ctx.beginPath();
          roundedRectPath(
            ctx,
            gap +
              sideWidth +
              gap +
              sideWidth +
              gap +
              centralWidth +
              gap +
              xNudge,
            taTop,
            sideWidth,
            innerSideTopHeight,
            20 * dpi,
          );
          roundedRectPath(
            ctx,
            gap +
              sideWidth +
              gap +
              sideWidth +
              gap +
              centralWidth +
              gap +
              xNudge,
            taTop + innerSideTopHeight + gap,
            sideWidth,
            innerSideBotHeight,
            20 * dpi,
          );
          ctx.closePath();
          ctx.clip();
          drawImageProp(
            mr,
            ctx,
            gap +
              sideWidth +
              gap +
              sideWidth +
              gap +
              centralWidth +
              gap +
              xNudge,
            taTop,
            sideWidth,
            height - taTop - gap,
            PLACEHOLDER_TOP,
          );
          ctx.restore();

          // Central
          ctx.save();
          ctx.beginPath();
          roundedRectPath(
            ctx,
            // 20px left padding, 20px gap twice, plus the width of the left side times two
            gap + sideWidth + gap + sideWidth + gap - xNudge,
            // The top is the bottom of the text area + 20px gap
            taHeight + taTop + gap - scrollY * dpi,
            centralWidth + 2 * xNudge,
            // The height is the space below the text area - 20px padding - 20px gap
            height -
              taHeight -
              taTop -
              gap * inverseScrollRatio -
              gap +
              scrollY * dpi,
            Math.max(0, 1 - scrollY / (windowHeight * 0.25)) * 20 * dpi,
          );
          ctx.closePath();
          ctx.clip();
          // Clear everything, which is clipped to the rect above
          ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);

          ctx.globalAlpha = inverseScrollRatio;
          ctx.fillStyle = '#090909';
          ctx.fillRect(0, 0, canvas.current!.width, canvas.current!.height);
          ctx.globalAlpha = Math.max(0, 1 - scrollY / (windowHeight * 0.7));
          drawImageProp(
            c,
            ctx,
            // 20px left padding, 20px gap twice, plus the width of the left side times two
            gap + sideWidth + gap + sideWidth + gap - xNudge,
            // The top is the bottom of the text area + 20px gap
            taHeight + taTop + gap - scrollY * dpi,
            centralWidth + 2 * xNudge,
            // The height is the space below the text area - 20px padding - 20px gap
            height -
              taHeight -
              taTop -
              gap * inverseScrollRatio -
              gap +
              scrollY * dpi,
            PLACEHOLDER_BOTTOM,
          );
          ctx.restore();
        }

        // Draw the inner radius
        drawRadius(
          ctx,
          width / 2,
          (RADIUS_OFFSET - scrollY * 2.85) * dpi,
          (radiusState.current.inner + scrollY * 2) * dpi,
        );
      },
      [bl, br, c, isStatic, ml, mr, tl, tr],
    ),
  );

  useCalculateResizableValue(
    React.useCallback(() => {
      const {width: rawWidth, height: rawHeight} =
        wrapper.current!.getBoundingClientRect();
      const width = rawWidth * dpi;
      const height = rawHeight * dpi;
      const layout = getLayout();
      const isMobile = layout === 'mobile';
      const isTablet = layout === 'tablet';
      setIsMobile(isMobile);
      setIsTablet(isTablet);
      size.current.width = width;
      size.current.height = height;
      size.current.windowHeight = window.innerHeight;
      size.current.layout = layout;

      if (!canvas.current) {
        return;
      }
      canvas.current.width = width;
      canvas.current.height = height;
      canvas.current.style.width = `${rawWidth}px`;
      canvas.current.style.height = `${rawHeight}px`;

      const radiusOffset = isMobile
        ? RADIUS_OFFSET_MOBILE
        : isTablet
          ? RADIUS_OFFSET_TABLET
          : RADIUS_OFFSET;

      radiusTarget.current.inner = Math.sqrt(
        ((textArea.current!.parentNode as HTMLElement).offsetWidth / 2) ** 2 +
          (textArea.current!.offsetHeight + radiusOffset + 20) ** 2,
      );
      radiusTarget.current.middle = Math.sqrt(
        ((width / 2) * CIRCLE_ACROSS + 20) ** 2 +
          (height * MIDDLE_CIRCLE_DOWN + radiusOffset * dpi) ** 2,
      );
      radiusTarget.current.outer = Math.sqrt(
        ((width / 2) * CIRCLE_ACROSS + 20) ** 2 +
          (height * OUTER_CIRCLE_DOWN + radiusOffset * dpi) ** 2,
      );
    }, []),
  );

  return (
    <>
      <section
        ref={wrapper}
        className={css({
          // The skeleton measures in the width of the content (`cqw`).
          containerType: 'inline-size',
          display: 'grid',
          height: '100lvh',
          minHeight: '800px',
          paddingTop: `${PADDING_TOP}px`,
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '20px',
          position: 'relative',
          gap: '20px',
          gridTemplateColumns: '1.2fr 5fr 1.2fr',
          gridTemplateRows: '46fr 32fr',

          overflow: 'hidden',

          [TABLET_MEDIA_QUERY]: {
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr 1fr',
          },
          [MOBILE_MEDIA_QUERY]: {
            gridTemplateColumns: '1fr',
            paddingTop: `${PADDING_TOP_MOBILE}px`,
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingBottom: '10px',
          },

          zIndex: 50,
        })}
      >
        <div
          className={css({
            backgroundColor: 'var(--color-sand)',
            columnGap: '20px',
            display: 'grid',
            gridTemplateColumns: [SIDE, SIDE, CENTRAL, SIDE, SIDE]
              .map(fraction => `${fraction}fr`)
              .join(' '),
            inset: 0,
            padding: `${PADDING_TOP}px 20px 20px`,
            position: 'absolute',
            visibility: SKELETON_VISIBILITY,
            zIndex: 0,
            ...deviceMedia(ratio => [
              '',
              {'--hero-device-pixel': `${1 / Math.min(2, ratio)}px`},
            ]),
            [TABLET_MEDIA_QUERY]: {
              gridTemplateColumns: [TABLET_SIDE, TABLET_CENTRAL, TABLET_SIDE]
                .map(fraction => `${fraction}fr`)
                .join(' '),
            },
          })}
        >
          <div className={css(skeletonColumn(MOBILE_MEDIA_QUERY))}>
            <div className={css(skeletonTile(OUTER_TOP, PLACEHOLDER_TOP, 3))} />
            <div
              className={css(skeletonTile(OUTER_BOTTOM, PLACEHOLDER_BOTTOM, 1))}
            />
          </div>
          <div className={css(skeletonColumn(TABLET_MEDIA_QUERY))}>
            <div className={css(skeletonTile(INNER_TOP, PLACEHOLDER_TOP, 5))} />
            <div
              className={css(skeletonTile(INNER_BOTTOM, PLACEHOLDER_TOP, 5))}
            />
          </div>
          {/* The central tile is under the text. */}
          <div />
          <div className={css(skeletonColumn(TABLET_MEDIA_QUERY))}>
            <div className={css(skeletonTile(INNER_TOP, PLACEHOLDER_TOP, 5))} />
            <div
              className={css(skeletonTile(INNER_BOTTOM, PLACEHOLDER_TOP, 5))}
            />
          </div>
          <div className={css(skeletonColumn(MOBILE_MEDIA_QUERY))}>
            <div className={css(skeletonTile(OUTER_TOP, PLACEHOLDER_TOP, 3))} />
            <div
              className={css(skeletonTile(OUTER_BOTTOM, PLACEHOLDER_BOTTOM, 1))}
            />
          </div>
          <div
            ref={outerCircle}
            {...introAnimationProps}
            className={css({
              ...skeletonCircle(GROWTH.outer),
              height: skeletonCircleSize(OUTER_CIRCLE_DOWN),
              zIndex: 2,
              [TABLET_MEDIA_QUERY]: {display: 'none'},
            })}
          />
          <div
            ref={middleCircle}
            {...introAnimationProps}
            className={css({
              ...skeletonCircle(GROWTH.middle),
              display: 'none',
              height: skeletonCircleSize(MIDDLE_CIRCLE_DOWN),
              zIndex: 4,
              ...deviceMedia(ratio => [
                ` and (width > ${Math.max(
                  TABLET_BREAKPOINT,
                  MIDDLE_CIRCLE_MIN_WIDTH / Math.min(2, ratio),
                )}px)`,
                {display: 'block'},
              ]),
            })}
          />
        </div>
        <div
          className={css({
            gridArea: '1 / 2 / 3 / 3',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gridTemplateRows: '24fr 54fr',
            gap: '20px',

            [TABLET_MEDIA_QUERY]: {
              gridArea: '1 / 1 / 3 / 2',
            },
            [MOBILE_MEDIA_QUERY]: {
              gridTemplateColumns: '1fr',
            },
          })}
        >
          <div
            className={css({
              gridArea: '1 / 2 / 3 / 3',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gridTemplateRows: 'min-content 1fr',
              gap: '20px',
              [MOBILE_MEDIA_QUERY]: {
                gridArea: '1 / 1 / 3 / 2',
              },
            })}
          >
            <div
              ref={textArea}
              className={css({
                alignItems: 'center',
                backgroundColor: 'var(--color-sand)',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                maxWidth: '570px',
                margin: '0 auto',
                textAlign: 'center',
                gridArea: '1 / 1 / 2 / 2',
                paddingTop: '56px',
                paddingLeft: '20px',
                paddingRight: '20px',
                position: 'relative',
                zIndex: 10,
                [MOBILE_MEDIA_QUERY]: {
                  gap: '15px',
                  maxWidth: '340px',
                },
              })}
            >
              <H2 level={1}>
                Hi! I&rsquo;m
                <br />
                your host
              </H2>
              <Body4>
                Welcome to Pinecast, a batteries-included
                <br />
                podcast hosting platform
              </Body4>
              <SecondaryButton
                href="https://pinecast.com/signup"
                style={{
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  [MOBILE_MEDIA_QUERY]: {
                    paddingLeft: '30px',
                    paddingRight: '30px',
                  },
                }}
              >
                Start for free
              </SecondaryButton>
              <Caption style={{color: 'var(--color-core-accent-text)'}}>
                No credit card required
              </Caption>
              <div
                ref={innerCircle}
                {...introAnimationProps}
                className={css({
                  ...skeletonCircle(GROWTH.inner),
                  // `100%` is the height of the text.
                  height: skeletonInnerCircleSize(
                    // The columns of the two grids that the text is in.
                    '((100cqw - 40px) * 5 / 7.4 - 40px) / 4',
                    RADIUS_OFFSET,
                  ),
                  top: `${RADIUS_OFFSET - PADDING_TOP}px`,
                  visibility: SKELETON_VISIBILITY,
                  // Under the text, on its background.
                  zIndex: -1,
                  [TABLET_MEDIA_QUERY]: {
                    height: skeletonInnerCircleSize(
                      '(100cqw - 40px) / 4',
                      RADIUS_OFFSET_TABLET,
                    ),
                  },
                  [MOBILE_MEDIA_QUERY]: {
                    height: skeletonInnerCircleSize(
                      '50cqw',
                      RADIUS_OFFSET_MOBILE,
                    ),
                    top: `${RADIUS_OFFSET - PADDING_TOP_MOBILE}px`,
                  },
                })}
              />
            </div>
            <div
              className={css({
                backgroundColor: PLACEHOLDER_BOTTOM,
                borderRadius: '20px',
                gridArea: '2 / 1 / 3 / 2',
                position: 'relative',
                visibility: SKELETON_VISIBILITY,
                zIndex: 1,
                // `100cqw + 40px` is the width of the hero.
                ...skeletonCentralTile(
                  `(100cqw + 40px - 120px) * ${CENTRAL / (4 * SIDE + CENTRAL)}`,
                ),
                [TABLET_MEDIA_QUERY]: skeletonCentralTile(
                  `(100cqw + 40px - 80px) * ${
                    TABLET_CENTRAL / (2 * TABLET_SIDE + TABLET_CENTRAL)
                  }`,
                ),
                [MOBILE_MEDIA_QUERY]: skeletonCentralTile('100%'),
              })}
            />
          </div>
        </div>
      </section>
      {/* Transitional background for scroll-linked transition upon reaching the Globe section */}
      <div
        className={css({
          background: 'var(--color-space)',
          height: 'calc(100lvh + 133px)',
          minHeight: '800px',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        })}
      />
      <canvas
        aria-hidden="true"
        className={css({
          position: isStatic ? 'absolute' : 'fixed',
          top: 0,
          zIndex: 3,
          pointerEvents: 'none',
          imageRendering: 'pixelated',
        })}
        ref={canvas}
      />
    </>
  );
};
