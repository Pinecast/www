import * as React from 'react';

import {useCSS} from '@/hooks/useCSS';
import {MonumentGroteskSemiMono} from '@/fonts';
import {ANTIALIASED} from '@/constants';
import {isMotionPaused, useMotion} from '@/hooks/useMotion';
import {ScreenReaderText} from './ScreenReaderText';

export const MARQUEE_HEIGHT = 165;
const MARQUEE_WIDTH = 900;
const MARQUEE_BORDER_WIDTH = 50;
const VERT_HANDLE_OFFSET = 50;

const FONT_SIZE = 16;

function getPath(width: number) {
  width = Math.max(width, MARQUEE_WIDTH);
  const horizHandleWidth = width * 0.2;
  return `M-${MARQUEE_BORDER_WIDTH} 0C-${MARQUEE_BORDER_WIDTH} ${VERT_HANDLE_OFFSET} ${
    width / 2 - horizHandleWidth
  } 140 ${width / 2} 140C${width / 2 + horizHandleWidth} 140 ${
    width + MARQUEE_BORDER_WIDTH
  } 70 ${width + MARQUEE_BORDER_WIDTH} 0C${width + MARQUEE_BORDER_WIDTH} -70 ${
    width / 2 + horizHandleWidth
  } -140 ${width / 2} -140C${
    width / 2 - horizHandleWidth
  } -140 -${MARQUEE_BORDER_WIDTH} -70 -${MARQUEE_BORDER_WIDTH} 0`;
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
      pathRef.current!.setAttribute(
        'transform',
        `translate(${Math.min(0, -(MARQUEE_WIDTH - width) / 2)}, 0)`,
      );

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
