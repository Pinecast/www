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
import {useAsyncImage, useAsyncVideo} from '@/hooks/useAsyncResource';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';

const RADIUS_OFFSET = 60;
const RADIUS_OFFSET_TABLET = 60;
const RADIUS_OFFSET_MOBILE = 40;

type AsyncDrawable = [HTMLImageElement | HTMLVideoElement, boolean];

function preferDrawable(a: AsyncDrawable, b: AsyncDrawable) {
  return a[1] ? a : b;
}

function drawImageProp(
  [img, loaded]: AsyncDrawable,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!loaded) {
    return;
  }
  // default offset is center
  let offsetX = 0.5;
  let offsetY = 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  let iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r, // new prop. width
    nh = ih * r, // new prop. height
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  // decide which gap to fill
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 20,
) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawImageInRoundedRect(
  ctx: CanvasRenderingContext2D,
  image: AsyncDrawable,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 20,
) {
  ctx.save();
  ctx.beginPath();
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.closePath();
  ctx.clip();
  drawImageProp(image, ctx, x, y, width, height);
  ctx.restore();
}

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

  const canvas = React.useRef<HTMLCanvasElement>(null);

  const ml = useAsyncImage('/images/hero/ml.png');
  const mr = useAsyncImage('/images/hero/mr.png');

  const tli = useAsyncImage('/images/hero/t-l.png');
  const tri = useAsyncImage('/images/hero/t-r.png');
  const bli = useAsyncImage('/images/hero/b-l.png');
  const bri = useAsyncImage('/images/hero/b-r.png');
  const ci = useAsyncImage('/images/hero/central.png');

  const tlv = useAsyncVideo({'video/mp4': '/videos/hero/t-l.mp4'});
  const trv = useAsyncVideo({'video/mp4': '/videos/hero/t-r.mp4'});
  const blv = useAsyncVideo({'video/mp4': '/videos/hero/b-l.mp4'});
  const brv = useAsyncVideo({'video/mp4': '/videos/hero/b-r.mp4'});
  const cv = useAsyncVideo({'video/mp4': '/videos/hero/central.mp4'});

  const tl = preferDrawable(tlv, tli);
  const tr = preferDrawable(trv, tri);
  const bl = preferDrawable(blv, bli);
  const br = preferDrawable(brv, bri);
  const c = preferDrawable(cv, ci);

  const wrapper = React.useRef<HTMLElement>(null);
  const wrapperSize = React.useRef<{width: number; height: number}>({
    width: 0,
    height: 0,
  });

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

  const raf = React.useRef<number>();
  useIntersectionVisibility(wrapper, isIntersecting => {
    if (!isIntersecting) {
      cancelAnimationFrame(raf.current!);
      return;
    }
    const paint = () => {
      const ctx = canvas.current!.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);

      const {clientHeight: taHeight, offsetTop: taTop} = textArea.current!;

      if (wrapperSize.current.width < MOBILE_BREAKPOINT) {
        drawImageInRoundedRect(
          ctx,
          c,
          // 10px left padding
          10,
          // The top is the bottom of the text area + 20px gap
          taHeight + taTop + 20,
          // The width is the wrapper width - 10px padding on each side
          wrapperSize.current.width - 20,
          // The height is the space below the text area - 10px padding - 20px gap
          wrapperSize.current.height - taHeight - taTop - 10 - 20,
        );
      } else if (wrapperSize.current.width < TABLET_BREAKPOINT) {
        // The central area is 5fr while the two sides are each 1.1fr.
        // The gap size is 20px.
        const sideWidth = ((wrapperSize.current.width - 40 - 40) / 723) * 176;
        const centralWidth =
          ((wrapperSize.current.width - 40 - 40) / 723) * 371;

        const sideTopHeight =
          ((wrapperSize.current.height - taTop - 20 - 20) / 78) * 46;
        const sideBotHeight =
          ((wrapperSize.current.height - taTop - 20 - 20) / 78) * 32;

        // Left bottom
        drawImageInRoundedRect(
          ctx,
          bl,
          20,
          taTop + 20 + sideTopHeight,
          sideWidth,
          sideBotHeight,
        );

        // Right bottom
        drawImageInRoundedRect(
          ctx,
          br,
          20 + sideWidth + 20 + centralWidth + 20,
          taTop + 20 + sideTopHeight,
          sideWidth,
          sideBotHeight,
        );

        // Left top
        drawImageInRoundedRect(ctx, tl, 20, taTop, sideWidth, sideTopHeight);
        // Right top
        drawImageInRoundedRect(
          ctx,
          tr,
          20 + sideWidth + 20 + centralWidth + 20,
          taTop,
          sideWidth,
          sideTopHeight,
        );

        // Central
        drawImageInRoundedRect(
          ctx,
          c,
          // 20px left padding, 20px gap, plus the width of the left side
          20 + sideWidth + 20,
          // The top is the bottom of the text area + 20px gap
          taHeight + taTop + 20,
          centralWidth,
          // The height is the space below the text area - 20px padding - 20px gap
          wrapperSize.current.height - taHeight - taTop - 20 - 20,
        );
      } else {
        const sideWidth =
          ((wrapperSize.current.width - 40 - 40 - 40) / 1554) * 256;
        const centralWidth =
          ((wrapperSize.current.width - 40 - 40 - 40) / 1554) * 530;

        const innerSideTopHeight =
          ((wrapperSize.current.height - taTop - 20 - 20) / 78) * 24;
        const innerSideBotHeight =
          ((wrapperSize.current.height - taTop - 20 - 20) / 78) * 54;

        const outerSideTopHeight =
          ((wrapperSize.current.height - taTop - 20 - 20) / 78) * 46;
        const outerSideBotHeight =
          ((wrapperSize.current.height - taTop - 20 - 20) / 78) * 32;

        // Left bottom
        drawImageInRoundedRect(
          ctx,
          bl,
          20,
          taTop + 20 + outerSideTopHeight,
          sideWidth,
          outerSideBotHeight,
        );
        // Right bottom
        drawImageInRoundedRect(
          ctx,
          br,
          20 +
            sideWidth +
            20 +
            centralWidth +
            20 +
            sideWidth +
            20 +
            sideWidth +
            20,
          taTop + 20 + outerSideTopHeight,
          sideWidth,
          outerSideBotHeight,
        );
        // Draw outer radius
        drawRadius(
          ctx,
          wrapperSize.current.width / 2,
          RADIUS_OFFSET,
          radiusState.current.outer,
        );

        // Left top
        drawImageInRoundedRect(
          ctx,
          tl,
          20,
          taTop,
          sideWidth,
          outerSideTopHeight,
        );
        // Right top
        drawImageInRoundedRect(
          ctx,
          tr,
          20 +
            sideWidth +
            20 +
            centralWidth +
            20 +
            sideWidth +
            20 +
            sideWidth +
            20,
          taTop,
          sideWidth,
          outerSideTopHeight,
        );
        if (wrapperSize.current.width > 1400) {
          // Draw middle radius
          drawRadius(
            ctx,
            wrapperSize.current.width / 2,
            RADIUS_OFFSET,
            radiusState.current.middle,
          );
        }

        // Inner left
        ctx.save();
        ctx.beginPath();
        roundedRectPath(
          ctx,
          20 + sideWidth + 20,
          taTop,
          sideWidth,
          innerSideTopHeight,
        );
        roundedRectPath(
          ctx,
          20 + sideWidth + 20,
          taTop + innerSideTopHeight + 20,
          sideWidth,
          innerSideBotHeight,
        );
        ctx.closePath();
        ctx.clip();
        drawImageProp(
          ml,
          ctx,
          20 + sideWidth + 20,
          taTop,
          sideWidth,
          wrapperSize.current.height - taTop - 20,
        );
        ctx.restore();

        // Inner right
        ctx.save();
        ctx.beginPath();
        roundedRectPath(
          ctx,
          20 + sideWidth + 20 + sideWidth + 20 + centralWidth + 20,
          taTop,
          sideWidth,
          innerSideTopHeight,
        );
        roundedRectPath(
          ctx,
          20 + sideWidth + 20 + sideWidth + 20 + centralWidth + 20,
          taTop + innerSideTopHeight + 20,
          sideWidth,
          innerSideBotHeight,
        );
        ctx.closePath();
        ctx.clip();
        drawImageProp(
          mr,
          ctx,
          20 + sideWidth + 20 + sideWidth + 20 + centralWidth + 20,
          taTop,
          sideWidth,
          wrapperSize.current.height - taTop - 20,
        );
        ctx.restore();

        // Central
        drawImageInRoundedRect(
          ctx,
          c,
          // 20px left padding, 20px gap twice, plus the width of the left side times two
          20 + sideWidth + 20 + sideWidth + 20,
          // The top is the bottom of the text area + 20px gap
          taHeight + taTop + 20,
          centralWidth,
          // The height is the space below the text area - 20px padding - 20px gap
          wrapperSize.current.height - taHeight - taTop - 20 - 20,
        );
      }

      // Draw the inner radius
      drawRadius(
        ctx,
        wrapperSize.current.width / 2,
        RADIUS_OFFSET,
        radiusState.current.inner,
      );

      // drawImageProp(tl, ctx, 0, 0, 100, 100);
      raf.current = requestAnimationFrame(paint);

      radiusState.current.inner +=
        (radiusTarget.current.inner - radiusState.current.inner) * 0.1;

      radiusState.current.middle +=
        (radiusTarget.current.middle - radiusState.current.middle) * 0.05;

      radiusState.current.outer +=
        (radiusTarget.current.outer - radiusState.current.outer) * 0.025;
    };
    raf.current = requestAnimationFrame(paint);
  });

  const updateSize = React.useCallback(() => {
    const {width, height} = wrapperSize.current;
    canvas.current!.width = width;
    canvas.current!.height = height;

    const isMobile = width < MOBILE_BREAKPOINT;
    const isTablet = width < TABLET_BREAKPOINT && !isMobile;

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
        (height * (24 / 78) + radiusOffset) ** 2,
    );
    radiusTarget.current.outer = Math.sqrt(
      ((width / 2) * (2.5 / 4) + 20) ** 2 +
        (height * (48 / 78) + radiusOffset) ** 2,
    );
  }, []);

  useCalculateResizableValue(
    React.useCallback(() => {
      wrapperSize.current = wrapper.current!.getBoundingClientRect();
      updateSize();
    }, [updateSize]),
  );

  return (
    <>
      <section
        ref={wrapper}
        className={css({
          display: 'grid',
          height: '100vh',
          minHeight: '800px',
          paddingTop: '120px',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '20px',
          position: 'relative',
          gap: '20px',
          gridTemplateColumns: '1.1fr 5fr 1.1fr',
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
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                maxWidth: '570px',
                margin: '0 auto',
                textAlign: 'center',
                gridArea: '1 / 1 / 2 / 2',
                paddingTop: '56px',
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
      <canvas
        className={css({position: 'fixed', top: 0})}
        ref={canvas}
        height={wrapperSize.current.height}
        width={wrapperSize.current.width}
      />
    </>
  );
};
