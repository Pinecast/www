import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {
  MOBILE_BREAKPOINT,
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

const RADIUS_OFFSET = 60;
const RADIUS_OFFSET_TABLET = 60;
const RADIUS_OFFSET_MOBILE = 40;

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

type RadiusTween = {
  inner: number;
  middle: number;
  outer: number;
};

export const HeroV2 = () => {
  const css = useCSS();

  const wrapper = React.useRef<HTMLElement>(null);
  const size = React.useRef({width: 0, height: 0});
  if (!size.current.width && typeof document !== 'undefined') {
    size.current.width = document.body.offsetWidth;
    size.current.height = window.innerHeight;
  }

  const [isMobile, setIsMobile] = React.useState(
    size.current.width < MOBILE_BREAKPOINT,
  );
  const [isTablet, setIsTablet] = React.useState(
    size.current.width < TABLET_BREAKPOINT && !isMobile,
  );

  const canvas = React.useRef<HTMLCanvasElement>(null);

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
        const {width, height} = size.current;
        const {innerHeight: windowHeight, scrollY} = window;
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

        if (width / dpi < MOBILE_BREAKPOINT) {
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
          );
          ctx.restore();
        } else if (width / dpi < TABLET_BREAKPOINT) {
          // The central area is 5fr while the two sides are each 1.1fr.
          // The gap size is 20px.
          const sideWidth = ((width - 2 * gap - 2 * gap) / 723) * 176;
          const centralWidth = ((width - 2 * gap - 2 * gap) / 723) * 371;

          const sideTopHeight = ((height - taTop - gap - gap) / 78) * 46;
          const sideBotHeight = ((height - taTop - gap - gap) / 78) * 32;

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
          );
          ctx.restore();
        } else {
          const sideWidth =
            ((width - 2 * gap - 2 * gap - 2 * gap) / 1554) * 256;
          const centralWidth =
            ((width - 2 * gap - 2 * gap - 2 * gap) / 1554) * 530;

          const innerSideTopHeight = ((height - taTop - gap - gap) / 78) * 24;
          const innerSideBotHeight = ((height - taTop - gap - gap) / 78) * 54;

          const outerSideTopHeight = ((height - taTop - gap - gap) / 78) * 46;
          const outerSideBotHeight = ((height - taTop - gap - gap) / 78) * 32;

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
          );
          if (width > 1400) {
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

        radiusState.current.inner +=
          (radiusTarget.current.inner - radiusState.current.inner) * 0.1;

        radiusState.current.middle +=
          (radiusTarget.current.middle - radiusState.current.middle) * 0.05;

        radiusState.current.outer +=
          (radiusTarget.current.outer - radiusState.current.outer) * 0.025;
      },
      [bl, br, c, ml, mr, tl, tr],
    ),
  );

  useCalculateResizableValue(
    React.useCallback(() => {
      const {width: rawWidth, height: rawHeight} =
        wrapper.current!.getBoundingClientRect();
      const width = rawWidth * dpi;
      const height = rawHeight * dpi;
      const isMobile = rawWidth < MOBILE_BREAKPOINT;
      const isTablet =
        rawWidth < TABLET_BREAKPOINT && rawWidth > MOBILE_BREAKPOINT;
      setIsMobile(rawWidth < MOBILE_BREAKPOINT);
      setIsTablet(rawWidth < TABLET_BREAKPOINT && rawWidth > MOBILE_BREAKPOINT);
      size.current.width = width;
      size.current.height = height;

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
        ((width / 2) * (2.5 / 4) + 20) ** 2 +
          (height * (24 / 78) + radiusOffset * dpi) ** 2,
      );
      radiusTarget.current.outer = Math.sqrt(
        ((width / 2) * (2.5 / 4) + 20) ** 2 +
          (height * (48 / 78) + radiusOffset * dpi) ** 2,
      );
    }, []),
  );

  return (
    <>
      <section
        ref={wrapper}
        className={css({
          display: 'grid',
          height: '100lvh',
          minHeight: '800px',
          paddingTop: '120px',
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
            paddingTop: '106px',
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingBottom: '10px',
          },

          zIndex: 50,
        })}
      >
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
              <H2>
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
              <Caption style={{color: 'var(--color-core-accent)'}}>
                No credit card required
              </Caption>
            </div>
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
        className={css({
          position: 'fixed',
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
