import * as React from 'react';

import {useCSS} from '@/hooks/useCSS';
import {MonumentGroteskSemiMono} from '@/fonts';
import {ANTIALIASED} from '@/constants';
import {isMotionPaused, useMotion} from '@/hooks/useMotion';
import {ScreenReaderText} from './ScreenReaderText';

export const MARQUEE_HEIGHT = 165;
const MARQUEE_BORDER_WIDTH = 50;
// How far past each side of the page the path starts and ends, so that the
// text comes in from off screen.
const PATH_OVERHANG = 50;
// The ends of the band stay at least this far below the top of the marquee.
const MIN_BAND_TOP = 10;

// The Figma file draws the band along an ellipse. In the 1670px desktop frame,
// the middle of the band follows an ellipse with radii of 1413 × 366.5. The
// 375px mobile frame uses the same ellipse at half the size. (It also halves
// the band and the text, which stay full size here so that they can be read.)
const DESIGN_WIDTH = 1670;
const DESIGN_RADIUS_X = 1413;
const DESIGN_RADIUS_Y = 366.5;
const MOBILE_DESIGN_WIDTH = 375;
// Scaling the ellipse by (width / DESIGN_WIDTH) ** ELLIPSE_GROWTH matches both
// frames: the ellipse halves while the page narrows to MOBILE_DESIGN_WIDTH.
const ELLIPSE_GROWTH =
  Math.log(2) / Math.log(DESIGN_WIDTH / MOBILE_DESIGN_WIDTH);

const FONT_SIZE = 16;
// How fast the text moves along the path, in pixels per second.
const TEXT_SPEED = 12;

function getEllipse(width: number) {
  const growth = (width / DESIGN_WIDTH) ** ELLIPSE_GROWTH;
  // Past the desktop frame, the ellipse widens as fast as the page does, so
  // that the page keeps showing the same stretch of it. Otherwise the ends of
  // the band would turn up more and more steeply.
  const rx = DESIGN_RADIUS_X * Math.max(growth, width / DESIGN_WIDTH);
  // From the middle of the page to its sides, the band rises by ry times this.
  const rise = 1 - Math.sqrt(1 - (width / 2 / rx) ** 2);
  // On very wide pages, flatten the ellipse so that the ends of the band stay
  // inside the marquee.
  const ry = Math.min(
    DESIGN_RADIUS_Y * growth,
    (MARQUEE_HEIGHT - MARQUEE_BORDER_WIDTH - MIN_BAND_TOP) / rise,
  );
  return {
    cx: width / 2,
    // The bottom of the band sits on the bottom of the marquee.
    cy: MARQUEE_HEIGHT - MARQUEE_BORDER_WIDTH / 2 - ry,
    rx,
    ry,
  };
}

function getPath(width: number) {
  const {cx, cy, rx, ry} = getEllipse(width);
  // The path runs along the bottom of the ellipse, from just off the left side
  // of the page to just off the right side, and back around the top. The top is
  // above the marquee, out of view.
  const dx = width / 2 + PATH_OVERHANG;
  const y = cy + ry * Math.sqrt(1 - (dx / rx) ** 2);
  return `M${cx - dx} ${y}A${rx} ${ry} 0 0 0 ${cx + dx} ${y}A${rx} ${ry} 0 1 0 ${
    cx - dx
  } ${y}Z`;
}

type Props = {
  bottomBackgroundColor?: string;
  items: Array<React.ReactNode>;
  marqueeColor?: string;
  textColor?: string;
  topBackgroundColor?: string;
  zIndex?: number;
};

export const MarqueeDivider = ({
  bottomBackgroundColor = '#fff',
  marqueeColor = 'var(--color-lime)',
  items,
  textColor = '#000',
  topBackgroundColor = '#fff',
  zIndex = 2,
}: Props) => {
  const css = useCSS();
  const uid = React.useId();

  const marqueeRef = React.useRef<SVGSVGElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const textPathRef = React.useRef<SVGTextPathElement>(null);
  const animateRef = React.useRef<SVGAnimateElement>(null);
  const handlerTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);
  React.useEffect(() => {
    const handler = () => {
      // console.log('recomputing marquee');
      const width = (
        pathRef.current!.parentNode as SVGElement
      ).getClientRects()[0].width;
      pathRef.current!.setAttribute('d', getPath(width));

      const pathLen = pathRef.current!.getTotalLength();

      let textLen = 0;
      const elements = textPathRef.current!.childNodes;
      const nonTwinCount = Math.floor(elements.length / 2);
      for (let i = 0; i < nonTwinCount; i += 2) {
        const element = elements[i] as SVGTextContentElement;
        const elementBullet = elements[i + 1] as SVGTextContentElement;
        const twin = elements[i + nonTwinCount] as SVGTextContentElement;
        const twinBullet = elements[
          i + 1 + nonTwinCount
        ] as SVGTextContentElement;
        // A slogan that an earlier pass hid measures as empty, so show it
        // before measuring it.
        element.style.display = 'initial';
        elementBullet.style.display = 'initial';
        const nodeLen =
          element.getComputedTextLength() +
          elementBullet.getComputedTextLength();
        const totalNodeLen =
          nodeLen +
          Number(element.getAttribute('dx') || '0') +
          Number(elementBullet.getAttribute('dx') || '0');
        if (totalNodeLen + textLen > pathLen) {
          element.style.display = 'none';
          twin.style.display = 'none';
          elementBullet.style.display = 'none';
          twinBullet.style.display = 'none';
        } else {
          element.style.display = 'initial';
          twin.style.display = 'initial';
          elementBullet.style.display = 'initial';
          twinBullet.style.display = 'initial';
          textLen += totalNodeLen;
        }
      }

      // console.log('text length', textLen);
      // console.log('path length', pathLen);

      const animate = animateRef.current!;
      animate.setAttribute('to', `${textLen}`);
      // animate.setAttribute('to', `0`);
      // The number of slogans that fit changes with the width of the page, so
      // time the loop by its length to keep the same pace.
      animate.setAttribute('dur', `${textLen / TEXT_SPEED}s`);

      marqueeRef.current!.style.opacity = '1';
    };
    window.addEventListener('resize', handler);
    handler();
    handlerTimer.current = setTimeout(handler, 200);
    return () => {
      clearTimeout(handlerTimer.current!);
      window.removeEventListener('resize', handler);
    };
  }, []);

  // The "Pause animations" toggle stops the clock of the SVG, so the text
  // stays where it is.
  const {paused} = useMotion();
  React.useEffect(() => {
    // Not `paused`: in the first render in the browser, it is still the value
    // of the static export.
    if (isMotionPaused()) {
      marqueeRef.current?.pauseAnimations();
    } else {
      marqueeRef.current?.unpauseAnimations();
    }
  }, [paused]);

  const bullets = items.map((item, i) => (
    <MarqueeDividerBullet key={i}>{item}</MarqueeDividerBullet>
  ));

  return (
    <div
      className={css({
        backgroundColor: bottomBackgroundColor,
        height: `${MARQUEE_HEIGHT}px`,
        position: 'relative',
        zIndex,
      })}
    >
      {/* The marquee shows each item twice so that the loop has no gap, and
          hides the items that don't fit. Screen readers get each item once
          from this list instead. */}
      <ScreenReaderText as="ul">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ScreenReaderText>
      <svg
        aria-hidden="true"
        ref={marqueeRef}
        height={MARQUEE_HEIGHT}
        preserveAspectRatio="none"
        width="100%"
        className={css({
          ...ANTIALIASED,
          // Remove 4 extra pixels added by browser when SVG is an inline box.
          display: 'block',
          // Hide the marquee until the width is available. Otherwise, the marquee jumps from 600px to the true screen width.
          opacity: 0,
          position: 'relative',
          // Work around a nasty Chrome flickering bug the marquee is scrolled fast into view.
          transform: 'translate3d(0,0,0)',
          transition: 'opacity 0.2s ease-in-out',
          width: '100%',
        })}
      >
        <path
          id={uid}
          d={getPath(600)}
          fill={topBackgroundColor}
          ref={pathRef}
          stroke={marqueeColor}
          strokeWidth={MARQUEE_BORDER_WIDTH}
          width="100%"
        />
        <text
          lengthAdjust="spacingAndGlyphs"
          className={css({
            ...MonumentGroteskSemiMono,
            fill: textColor,
            fontSize: `${FONT_SIZE}px`,
            // For the font spacing:
            transform: 'translateY(4px)',
          })}
        >
          <textPath
            href={`#${uid}`}
            textAnchor="middle"
            startOffset="0"
            ref={textPathRef}
          >
            {bullets}
            {bullets}
            <animate
              attributeName="startOffset"
              dur="300s"
              from="0"
              to="0"
              begin="0s"
              repeatCount="indefinite"
              ref={animateRef}
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
};

MarqueeDivider.MarqueeDividerHeight = MARQUEE_HEIGHT;

const MarqueeDividerBullet = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <>
      <tspan dx="100" className={css({fontSize: '30px'})} dy="4">
        &bull;
      </tspan>
      <tspan dx="12" dy="-4">
        {children}
      </tspan>
    </>
  );
};

const STANDARD_ITEMS = [
  'Kick-ass customer support',
  'Fair, no-nonsense pricing',
  'Everything you need to be successful',
  'Built by podcasters, for podcasters',
  'Billions of listens served since 2015',
  'Get paid for your content',
  <>You&rsquo;re the customer, not the product</>,
  'Worry about your next episode, not your host',
  '$0 advertising budget, 100% focus on great software',
  'Your batteries-included podcast host',
  'Crafted with care in Raleigh, NC',
];

export const StandardMarqueeDivider = (props: Omit<Props, 'items'>) => (
  <MarqueeDivider {...props} items={STANDARD_ITEMS} />
);
