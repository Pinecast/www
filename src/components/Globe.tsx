import {useCSS} from '@/hooks/useCSS';
import {Body1, Body4, H1, Link as ProseLink} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {useDarkSection} from '@/hooks/useDarkSection';
import {MonumentGroteskRegular} from '@/fonts';
import Link from 'next/link';
import {MOBILE_BREAKPOINT, MOBILE_MEDIA_QUERY} from '@/constants';
import {useScrollProgressEffect} from '@/hooks/useScrollProgress';
import {AV1_MIME, useAsyncImage, useAsyncVideo} from '@/hooks/useAsyncResource';
import {useCalculateResizableValue} from '@/hooks/useCalculateResizableValue';
import {useCanvasDrawing} from '@/hooks/useCanvasDrawing';
import {useVideoManager} from '@/hooks/useVideoManager';

import analytics0 from '@/icons/globe/analytics/0.svg';
import analytics1 from '@/icons/globe/analytics/1.svg';
import analytics2 from '@/icons/globe/analytics/2.svg';
import analytics3 from '@/icons/globe/analytics/3.svg';
import analytics4 from '@/icons/globe/analytics/4.svg';
import analytics5 from '@/icons/globe/analytics/5.svg';
import distribution0 from '@/icons/globe/distribution/0.svg';
import distribution1 from '@/icons/globe/distribution/1.svg';
import distribution2 from '@/icons/globe/distribution/2.svg';
import distribution3 from '@/icons/globe/distribution/3.svg';
import distribution4 from '@/icons/globe/distribution/4.svg';
import distribution5 from '@/icons/globe/distribution/5.svg';
import monetization0 from '@/icons/globe/monetization/0.svg';
import monetization1 from '@/icons/globe/monetization/1.svg';
import monetization2 from '@/icons/globe/monetization/2.svg';
import monetization3 from '@/icons/globe/monetization/3.svg';
import monetization4 from '@/icons/globe/monetization/4.svg';
import monetization5 from '@/icons/globe/monetization/5.svg';

const analyticsIcons = [
  analytics0,
  analytics1,
  analytics2,
  analytics3,
  analytics4,
  analytics5,
];
const distributionIcons = [
  distribution0,
  distribution1,
  distribution2,
  distribution3,
  distribution4,
  distribution5,
];
const monetizationIcons = [
  monetization0,
  monetization1,
  monetization2,
  monetization3,
  monetization4,
  monetization5,
];
let iconCache = new Map<unknown, HTMLImageElement>();
if (typeof document !== 'undefined') {
  for (const Icon of [
    ...analyticsIcons,
    ...distributionIcons,
    ...monetizationIcons,
  ]) {
    const div = document.createElement('div');
    div.style.display = 'none';
    document.body.appendChild(div);
    const root = ReactDOM.createRoot(div);
    const Component = () => {
      return (
        <div
          ref={(elem: HTMLDivElement | null) => {
            if (!elem) return;
            const img = new Image();
            img.src = `data:image/svg+xml;base64,${btoa(elem.innerHTML)}`;
            iconCache.set(Icon, img);
            requestIdleCallback(() => {
              root.unmount();
              div.remove();
            });
          }}
        >
          <Icon />
        </div>
      );
    };
    root.render(<Component />);
  }
}

type Feature = 'distribution' | 'analytics' | 'monetization';
type FeatureShape = {
  title: React.ReactNode | string;
  description: React.ReactNode | string;
  href: string;
};

const WIDE_DESCRIPTION_PLACEMENT_QUERY = '@media (min-width: 900px)';

const FEATURES: Record<Feature, FeatureShape> = {
  distribution: {
    title: <>Distribution</>,
    description: (
      <>
        Publish or import your podcast, get listed in apps, and grow your
        audience with our SEO-optimized tools.
      </>
    ),
    href: '/features/distribution',
  },
  analytics: {
    title: <>Analytics</>,
    description: (
      <>
        Perform routine audits and measure success with premium analytics,
        simple charts and clean controls.
      </>
    ),
    href: '/features/analytics',
  },
  monetization: {
    title: <>Monetization</>,
    description: (
      <>
        Publish premium content to paid subscribers and receive payouts directly
        to your bank account.
      </>
    ),
    href: '/features/monetization',
  },
};

const IntroSection = React.memo(function IntroSection() {
  const css = useCSS();
  return (
    <div
      className={css({
        backgroundImage:
          'linear-gradient(to bottom, rgba(9,9,9,0.65) 30%,rgba(9,9,9,0) 90%)',
        borderRadius: '0 0 100% 100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        alignItems: 'center',
        textAlign: 'center',
        margin: '0 auto -400px',
        maxWidth: '946px',
        padding: '100px 0 400px',
        position: 'relative',
        zIndex: 1,

        '--color-line': '#888',
        '--color-primary-dark': '#fff',
        '--color-primary-light': 'var(--color-space)',
        '--color-theme-mode': 'var(--color-space)',
        '--color-core-accent': '#888',
        color: 'var(--color-primary-dark)',
      })}
    >
      <H1
        style={{
          marginBottom: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 0,
          maxWidth: '58rem',
        }}
      >
        Check, Check 1, 2, 3
      </H1>
      <Body4
        style={{maxWidth: '32rem', paddingLeft: '10px', paddingRight: '10px'}}
      >
        Whether you&rsquo;re sharing to a handful of friends, your company, or
        the world, Pinecast has a solution that&rsquo;s right for you.
      </Body4>
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
        })}
      >
        <PrimaryButton
          href="https://pinecast.com/signup"
          style={{
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-space)',
          }}
        >
          Start for free
        </PrimaryButton>
        <SecondaryButton href="/features">Discover features</SecondaryButton>
      </div>
    </div>
  );
});
const FeatureText = React.memo(function FeatureText({
  currentFeature,
}: {
  currentFeature: FeatureShape | null;
}) {
  const css = useCSS();
  return (
    <div
      className={css({
        bottom: '0',
        display: 'grid',
        gap: '10px',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        height: '50vh',
        opacity: currentFeature ? '1' : '0',
        paddingBottom: '20px',
        placeItems: 'end',
        pointerEvents: currentFeature ? 'auto' : 'none',
        position: 'absolute',
        visibility: currentFeature ? 'visible' : 'hidden',
        width: '100%',
        zIndex: 4,

        [WIDE_DESCRIPTION_PLACEMENT_QUERY]: {
          gap: '20px',
          paddingBottom: '0',
          placeItems: 'center',
        },
      })}
    >
      <div
        className={css({
          // Span 10 columns.
          gridColumnStart: '2',
          gridColumnEnd: '-2',
          [WIDE_DESCRIPTION_PLACEMENT_QUERY]: {
            // Take up two columns.
            gridColumnStart: '2',
            gridColumnEnd: '4',
          },
        })}
      >
        <div
          className={css({
            [WIDE_DESCRIPTION_PLACEMENT_QUERY]: {
              // Column-gap bleed offset.
              marginLeft: '-26px',
              marginRight: '-26px',
            },
          })}
        >
          {currentFeature && (
            <>
              <Body1
                as="h3"
                style={{
                  color: 'var(--color-white)',
                  lineHeight: 1.05,
                  marginBottom: '10px',
                  transition: '0.2s opacity ease',
                }}
              >
                {currentFeature.description}
              </Body1>
              <ProseLink
                href={currentFeature.href}
                style={{
                  marginBottom: '-8px',
                  paddingBottom: '8px',
                  paddingTop: '8px',
                }}
              >
                Learn more
              </ProseLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

const FeatureMenu = React.forwardRef(function FeatureMenu(
  {
    currentFeatureSlug,
    height,
    width,
  }: {
    currentFeatureSlug: Feature | null;
    height: number;
    width: number;
  },
  ref: React.Ref<SVGSVGElement>,
) {
  const css = useCSS();
  const radius = Math.min(getGlobeWidth(width, height) / 2 + 80, width);
  return (
    <svg
      ref={ref}
      className={css({
        position: 'absolute',
        margin: '0 auto',
        width: '400px',
        zIndex: 4,
      })}
      viewBox="0 0 400 100"
      width="400"
      height="100"
      preserveAspectRatio="none"
    >
      <g transform="translate(0 20)">
        <path
          d={`M ${-radius + 200} -${radius - 50} a ${radius} ${radius} 0 1 0 ${
            2 * radius
          } 0`}
          id="globeCurvedTextPath"
          fill="transparent"
        />
        <text
          fill="var(--color-white)"
          className={css({
            ...MonumentGroteskRegular,
            fontSize: `${radius * 0.075}px`,
            fontWeight: 600,
          })}
        >
          <textPath
            xlinkHref="#globeCurvedTextPath"
            startOffset="50%"
            textAnchor="middle"
          >
            <Link
              className={css({
                fill: 'inherit',
                transition: 'opacity 0.2s',
                opacity: currentFeatureSlug === 'distribution' ? 1 : 0.3,
              })}
              href="#distribution"
            >
              Distribution
            </Link>
            <tspan dx={10}>
              <Link
                className={css({
                  fill: 'inherit',
                  transition: 'opacity 0.2s',
                  opacity: currentFeatureSlug === 'analytics' ? 1 : 0.3,
                })}
                href="#analytics"
              >
                Analytics
              </Link>
            </tspan>
            <tspan dx={10}>
              <Link
                className={css({
                  fill: 'inherit',
                  transition: 'opacity 0.2s',
                  opacity: currentFeatureSlug === 'monetization' ? 1 : 0.3,
                })}
                href="#monetization"
              >
                Monetization
              </Link>
            </tspan>
          </textPath>
        </text>
      </g>
    </svg>
  );
});

function chooseFeature(scrollRatio: number) {
  if (scrollRatio >= 0.18 && scrollRatio < 0.35) {
    return 'distribution';
  }
  if (scrollRatio >= 0.35 && scrollRatio < 0.64) {
    return 'analytics';
  }
  if (scrollRatio >= 0.64) {
    return 'monetization';
  }
  return null;
}

function getVideoSegmentBounds(currentFeatureSlug: Feature | null) {
  switch (currentFeatureSlug) {
    case 'distribution':
      return [0.6, 3.24];
    case 'analytics':
      return [4.74, 8.74];
    case 'monetization':
      return [10.27, 11.77];
    default:
      return [0, 0.6];
  }
}

function getImageOffset(currentFeatureSlug: Feature | null) {
  switch (currentFeatureSlug) {
    case 'distribution':
      return 0.146;
    case 'analytics':
      return 0.509;
    case 'monetization':
      return 0.855;
    default:
      return 0;
  }
}

function getGlobeCenterPosition(width: number, height: number) {
  const isMobile = width < height;
  const headerSize = isMobile ? 80 : 120;
  return (height - headerSize) / (isMobile ? 2.8 : 2.4) + headerSize;
}
function getGlobeWidth(width: number, height: number) {
  const isMobile = width < height;
  const headerSize = isMobile ? 80 : 120;
  return Math.max(
    0,
    Math.min(
      width - 20,
      isMobile ? (height - headerSize) / 2.5 : (height - headerSize) / 1.5,
    ),
  );
}

const IMAGE_HEIGHT = 547;
const IMAGE_WIDTH = 3335;
const VIDEO_SIZE = 1600;
const VIDEO_PADDING = 150;

export const Globe = () => {
  const css = useCSS();

  const ref = React.useRef<HTMLElement>(null);
  useDarkSection(ref);
  const menu = React.useRef<SVGSVGElement>(null);

  const [{width, height}, setWrapperSize] = React.useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  useCalculateResizableValue(
    React.useCallback(() => {
      let verticalScrollbarWidth =
        window.innerWidth - document.body.offsetWidth;

      // Use the dimensions of the viewport without scrollbars.
      const width = window.innerWidth - verticalScrollbarWidth;
      const height = window.innerHeight;
      setWrapperSize({width, height});
      const m = menu.current!;
      const globeCenterPosition = getGlobeCenterPosition(width, height);
      const globeWidth = getGlobeWidth(width, height);
      const isMobile = width < height;
      const menuWidth = Math.min(
        (globeWidth / 850) * 400 * (isMobile ? 3 : 1.5),
        width,
      );
      m.style.left = `${(width - menuWidth) / 2}px`;
      m.style.top = `${globeCenterPosition + globeWidth / 2}px`;
      m.style.width = `${menuWidth}px`;
      m.style.height = `${menuWidth / 4}px`;
    }, []),
  );

  const canvas = React.useRef<HTMLCanvasElement>(null);
  const gi = useAsyncImage('/images/globe-full.jpg');
  const gv = useAsyncVideo(
    {
      'video/mp4': '/videos/globe/globe2x.mp4',
      [AV1_MIME]: '/videos/globe/globe2x.av1.mp4',
    },
    // Disable the video on mobile
    width > MOBILE_BREAKPOINT,
    false,
  );

  const [currentFeatureSlug, setCurrentFeatureSlug] =
    React.useState<Feature | null>(null);

  useScrollProgressEffect(
    ref,
    React.useCallback(progress => {
      const newFeature = chooseFeature(progress);
      setCurrentFeatureSlug(newFeature);
    }, []),
  );

  const [segmentStart, segmentEnd] = getVideoSegmentBounds(
    currentFeatureSlug ?? 'distribution',
  );
  useVideoManager(gv, segmentStart, segmentEnd, 0.6);

  const imageState = React.useRef({xPos: 0, lastTs: Date.now()});

  useCanvasDrawing(
    canvas,
    React.useCallback(
      ctx => {
        if (!width) return;
        // ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, width, height);

        const imageOffsetPercent = getImageOffset(currentFeatureSlug);
        const imageOffset =
          Math.max(IMAGE_HEIGHT / 2, imageOffsetPercent * IMAGE_WIDTH) -
          IMAGE_HEIGHT / 2;
        const {xPos, lastTs} = imageState.current;
        const now = Date.now();
        const delta = now - lastTs;
        imageState.current.lastTs = now;
        imageState.current.xPos = xPos + (imageOffset - xPos) * (delta * 0.01);

        const isMobile = width < height;

        const globeCenterPosition = getGlobeCenterPosition(width, height);
        const globeWidth = getGlobeWidth(width, height);
        const globeRadius = globeWidth / 2;

        const [gvVideo, gvLoaded] = gv;
        // const gvLoaded = false;
        // const gvVideo = null;
        if (gvLoaded) {
          const videoRatio = (VIDEO_SIZE - VIDEO_PADDING * 2) / globeWidth;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(
            gvVideo,
            width / 2 - globeRadius - VIDEO_PADDING / videoRatio,
            globeCenterPosition - VIDEO_SIZE / 2 / videoRatio,
            globeWidth + (VIDEO_PADDING / videoRatio) * 2,
            globeWidth + (VIDEO_PADDING / videoRatio) * 2,
          );
          ctx.restore();
        }
        const [giImage, giLoaded] = gi;
        ctx.save();

        // Draw a circle around the globe
        ctx.beginPath();
        ctx.arc(width / 2, globeCenterPosition, globeRadius, 0, Math.PI * 2);
        // ctx.strokeStyle = 'white';
        // ctx.lineWidth = 1;
        // ctx.stroke();
        ctx.closePath();
        ctx.clip();

        if (giLoaded && !gvLoaded) {
          const giHeight = globeWidth;
          const giWidth = (giHeight * IMAGE_WIDTH) / IMAGE_HEIGHT;

          const giX = width / 2 - globeRadius - (xPos / IMAGE_WIDTH) * giWidth;
          const giY = globeCenterPosition - giHeight / 2;

          ctx.drawImage(giImage, giX, giY, giWidth, giHeight);
        }
        ctx.restore();

        const imageData = ctx.getImageData(0, globeCenterPosition, width, 1);

        ctx.save();
        ctx.beginPath();

        // Start from the center of the globe center position in imageData and work
        // left until we find a pixel that's #0a0a0a or darker. Draw a white line from
        // x=0 to that point along the center of the globe.
        const centerIndex = Math.floor(imageData.width / 2);
        for (let i = centerIndex; i >= 0; i -= 2) {
          const pixel = i * 4;
          const r = imageData.data[pixel];
          const g = imageData.data[pixel + 1];
          const b = imageData.data[pixel + 2];
          if (r <= 9 && g <= 9 && b <= 9) {
            // Draw a white line from the left edge to the dark pixel found along the center of the globe.
            ctx.moveTo(0, globeCenterPosition);
            ctx.lineTo(i, globeCenterPosition);
            break;
          }
        }
        // Start from the center to the right edge.
        for (let i = centerIndex; i < imageData.width; i += 2) {
          const pixel = i * 4;
          const r = imageData.data[pixel];
          const g = imageData.data[pixel + 1];
          const b = imageData.data[pixel + 2];
          if (r <= 9 && g <= 9 && b <= 9) {
            // Draw line from the right edge to the dark pixel found.
            ctx.moveTo(i, globeCenterPosition);
            ctx.lineTo(width, globeCenterPosition);
            break;
          }
        }
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        const radiusIncrement = isMobile ? 0.35 : 0.4;

        // Draw three arcs around the top half of the globe (starting and stopping at the vertical center)
        // The first arc should be 115% of the globe radius, increasing by 5% for each subsequent arc
        ctx.save();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'white';
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(
          width / 2,
          globeCenterPosition,
          globeRadius * (1 + radiusIncrement * 0.75),
          Math.PI,
          0,
        );
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.globalAlpha = 0.25;
        ctx.arc(
          width / 2,
          globeCenterPosition,
          globeRadius * (1 + radiusIncrement * 2),
          Math.PI,
          0,
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.closePath();
        ctx.globalAlpha = 0.15;
        ctx.arc(
          width / 2,
          globeCenterPosition,
          globeRadius * (1 + radiusIncrement * 3),
          Math.PI,
          0,
        );
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // ctx.drawImage(iconCache.get(distributionIcons[0])!, 0, 0);
      },
      [currentFeatureSlug, gi, gv, width, height],
    ),
  );

  let currentFeature = FEATURES[currentFeatureSlug as Feature] ?? null;

  return (
    <section
      ref={ref}
      className={css({
        backgroundColor: 'var(--color-space)',
        position: 'relative',
        zIndex: 2,
      })}
    >
      <IntroSection />
      <div
        className={css({
          position: 'sticky',
          height: '100vh',
          top: 0,

          '--globe-vertical-space': 'calc(100vh - 120px)',
          '--globe-horizontal-space': '100vw',
          '--globe-ideal-horizontal-height':
            'calc(var(--globe-horizontal-space) * 0.35)',
          '--globe-ideal-height': 'var(--globe-ideal-horizontal-height)',

          '--globe-rings-height': 'calc(50vh + 120px)',
        })}
      >
        <canvas
          className={css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 3,
            pointerEvents: 'none',
            imageRendering: 'pixelated',
          })}
          ref={canvas}
          height={height}
          width={width}
        />
        {/* <SideTicks /> */}
        <FeatureText currentFeature={currentFeature} />
        <FeatureMenu
          currentFeatureSlug={currentFeatureSlug}
          ref={menu}
          height={height}
          width={width}
        />
      </div>

      {/* Spacer */}
      <div className={css({height: 'calc(4 * 100vh)'})} />
      <a
        id="distribution"
        className={css({position: 'absolute', top: 'calc(0.8 * 100vh)'})}
      />
      <a
        id="analytics"
        className={css({position: 'absolute', top: 'calc(1.5 * 100vh)'})}
      />
      <a
        id="monetization"
        className={css({position: 'absolute', top: 'calc(2.6 * 100vh)'})}
      />
    </section>
  );
};
