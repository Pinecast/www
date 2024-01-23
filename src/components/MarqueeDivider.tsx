import * as React from 'react';

import {useCSS} from '@/hooks/useCSS';
import {MonumentGroteskSemiMono} from '@/fonts';

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
  children: Iterable<React.ReactNode>;
  marqueeColor?: string;
  textColor?: string;
  topBackgroundColor?: string;
  zIndex?: number;
};

export const MarqueeDivider = ({
  bottomBackgroundColor = '#fff',
  marqueeColor = 'var(--color-lime)',
  children,
  textColor = '#000',
  topBackgroundColor = '#fff',
  zIndex = 2
}: Props) => {
  const css = useCSS();
  const uid = React.useId();

  const pathRef = React.useRef<SVGPathElement>(null);
  const textPathRef = React.useRef<SVGTextPathElement>(null);
  const animateRef = React.useRef<SVGAnimateElement>(null);
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
    };
    window.addEventListener('resize', handler);
    handler();
    setTimeout(handler, 200);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  return (
    <div
      className={css({
        backgroundColor: bottomBackgroundColor,
        position: 'relative',
        zIndex,
      })}
    >
      <svg
        height={MARQUEE_HEIGHT}
        preserveAspectRatio="none"
        width="100%"
        className={css({
          // Remove 4 extra pixels added by browser when SVG is an inline box.
          display: 'block',
          position: 'relative',
          // Work around a nasty Chrome flickering bug the marquee is scrolled fast into view.
          transform: 'translate3d(0,0,0)',
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
            {children}
            {children}
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

MarqueeDivider.MarqueeDividerBullet = function MarqueeDividerBullet(
  children: string | React.ReactNode,
) {
  return (
    <>
      <tspan dx="100" style={{fontSize: '30px'}} dy="4">
        &bull;
      </tspan>
      <tspan dx="12" dy="-4">
        {children}
      </tspan>
    </>
  );
};

export const StandardMarqueeDivider = (props: Omit<Props, 'children'>) => (
  <MarqueeDivider {...props}>
    {MarqueeDivider.MarqueeDividerBullet('Kick-ass customer support')}
    {MarqueeDivider.MarqueeDividerBullet('Fair, no-nonsense pricing')}
    {MarqueeDivider.MarqueeDividerBullet(
      'Everything you need to be successful',
    )}
    {MarqueeDivider.MarqueeDividerBullet('Built by podcasters, for podcasters')}
    {MarqueeDivider.MarqueeDividerBullet(
      'Billions of listens served since 2015',
    )}
    {MarqueeDivider.MarqueeDividerBullet('Get paid for your content')}
    {MarqueeDivider.MarqueeDividerBullet(
      "You're the customer, not the product",
    )}
    {MarqueeDivider.MarqueeDividerBullet(
      'Worry about your next episode, not your host',
    )}
    {MarqueeDivider.MarqueeDividerBullet(
      '$0 advertising budget, 100% focus on great software',
    )}
    {MarqueeDivider.MarqueeDividerBullet(
      'Your batteries-included podcast host',
    )}
    {MarqueeDivider.MarqueeDividerBullet('Crafted with care in Raleigh, NC')}
  </MarqueeDivider>
);
