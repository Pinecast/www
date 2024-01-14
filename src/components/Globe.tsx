import {useCSS} from '@/hooks/useCSS';
import {Body1, Body4, H1, Link as ProseLink} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {useDarkSection} from '@/hooks/useDarkSection';
import {MonumentGroteskBold} from '@/fonts';
import Link from 'next/link';
import {MOBILE_BREAKPOINT} from '@/constants';
import {useScrollProgressEffect} from '@/hooks/useScrollProgress';
import {AV1_MIME, useAsyncImage, useAsyncVideo} from '@/hooks/useAsyncResource';
import {useCalculateResizableValue} from '@/hooks/useCalculateResizableValue';
import {useCanvasDrawing} from '@/hooks/useCanvasDrawing';

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

import Simplex from 'ts-perlin-simplex';
import {useDualVideoManager} from '@/hooks/useDualVideoManager';

const callWhenIdle = (callback: IdleRequestCallback) => {
  if (typeof window.requestIdleCallback === 'undefined') {
    // Basic shim for Safari
    return setTimeout(callback, 1);
  }
  return requestIdleCallback(callback);
};

const perlin = new Simplex.SimplexNoise();

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
            callWhenIdle(() => {
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

const radConv = Math.PI / 180;
const orbPositionsDesktop = [
  {rotation: 13 * radConv, dist: 1},
  {rotation: 17 * radConv, dist: 2},
  {rotation: 45.6 * radConv, dist: 0},
  {rotation: 140.6 * radConv, dist: 0},
  {rotation: 155.9 * radConv, dist: 2},
  {rotation: 163.1 * radConv, dist: 1},
];
const orbPositionsMobile = [
  {rotation: 33.75 * radConv, dist: 0},
  {rotation: 56.25 * radConv, dist: 1},
  {rotation: 90 * radConv, dist: 0},
  {rotation: 123.75 * radConv, dist: 1},
  {rotation: 146.25 * radConv, dist: 0},
];

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
          d={`M ${-radius + 200} ${-(
            radius - 50
          )} a ${radius} ${radius} 0 1 0 ${2 * radius} 0`}
          id="globeCurvedTextPath"
          fill="transparent"
        />
        <text
          fill="var(--color-white)"
          className={css({
            ...MonumentGroteskBold,
            fontSize: `${Math.max(14, Math.min(24, radius * 0.075))}px`,
            fontWeight: 400,
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

const VIEWPORT_HEIGHTS = 3.2;
// In percents:
const DISTRIBUTION_SCROLL_OFFSET = 0.3;
const ANALYTICS_SCROLL_OFFSET = 0.6;
const MONETIZATION_SCROLL_OFFSET = 0.85;
const DISTRIBUTION_IMAGE_OFFSET = 0.146;
const ANALYTICS_IMAGE_OFFSET = 0.509;
const MONETIZATION_IMAGE_OFFSET = 0.855;

const getScrollOffset = (offset: number) => {
  return (
    (offset - DISTRIBUTION_SCROLL_OFFSET) / (1 - DISTRIBUTION_SCROLL_OFFSET)
  );
};

function getImageOffset(currentFeatureSlug: Feature | null) {
  switch (currentFeatureSlug) {
    case 'distribution':
      return DISTRIBUTION_IMAGE_OFFSET;
    case 'analytics':
      return ANALYTICS_IMAGE_OFFSET;
    case 'monetization':
      return MONETIZATION_IMAGE_OFFSET;
    default:
      return 0;
  }
}
function chooseFeature(scrollRatio: number) {
  if (
    scrollRatio >= DISTRIBUTION_SCROLL_OFFSET &&
    scrollRatio < ANALYTICS_SCROLL_OFFSET
  ) {
    return 'distribution';
  }
  if (
    scrollRatio >= ANALYTICS_SCROLL_OFFSET &&
    scrollRatio < MONETIZATION_SCROLL_OFFSET
  ) {
    return 'analytics';
  }
  if (scrollRatio >= MONETIZATION_SCROLL_OFFSET) {
    return 'monetization';
  }
  return null;
}

function getGlobeCenterPosition(
  width: number,
  height: number,
  adjustForDpr = true,
) {
  const isMobile = width < height;
  const headerSize =
    (isMobile ? 80 : 120) * (adjustForDpr ? devicePixelRatio : 1);
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

function getCloseness(value: number, target: number, threshold: number) {
  return Math.max(0, threshold - Math.abs(value - target)) / threshold;
}
function getSignedCloseness(value: number, target: number, threshold: number) {
  const signedDistance = value - target;
  if (signedDistance > 0) {
    return Math.min(threshold, signedDistance) / threshold;
  } else {
    return Math.max(-threshold, signedDistance) / threshold;
  }
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
      setWrapperSize({
        width: width * devicePixelRatio,
        height: height * devicePixelRatio,
      });
      const m = menu.current!;
      const globeCenterPosition = getGlobeCenterPosition(width, height, false);
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

  // We load two versions of the video. They are switched between by the
  // dual video manager.
  const gv1 = useAsyncVideo(
    {
      'video/mp4': '/videos/globe/globe2x.mp4',
      [AV1_MIME]: '/videos/globe/globe2x.av1.mp4',
    },
    // Disable the video on mobile
    width / (global.devicePixelRatio ?? 1) > MOBILE_BREAKPOINT,
    false,
  );
  const gv2 = useAsyncVideo(
    {
      'video/mp4': '/videos/globe/globe2x.mp4',
      [AV1_MIME]: '/videos/globe/globe2x.av1.mp4',
    },
    // Disable the video on mobile
    width / (global.devicePixelRatio ?? 1) > MOBILE_BREAKPOINT,
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
  const gv = useDualVideoManager(gv1, gv2, segmentStart, segmentEnd, 0.6);

  const imageState = React.useRef({
    xPerc: 0,
    xPerc2: 0,
    xPerc3: 0,
    lastTs: Date.now(),
  });

  useCanvasDrawing(
    canvas,
    React.useCallback(
      ctx => {
        if (!width) return;
        // ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, width, height);

        const imageOffsetPercent = getImageOffset(currentFeatureSlug);
        const {xPerc, xPerc2, xPerc3, lastTs} = imageState.current;
        const now = Date.now();
        const delta = now - lastTs;
        imageState.current.lastTs = now;
        imageState.current.xPerc =
          xPerc + (imageOffsetPercent - xPerc) * (delta * 0.008);
        imageState.current.xPerc2 =
          xPerc2 + (imageOffsetPercent - xPerc2) * (delta * 0.004);
        imageState.current.xPerc3 =
          xPerc3 + (imageOffsetPercent - xPerc3) * (delta * 0.002);
        const imageOffset =
          Math.max(IMAGE_HEIGHT / 2, xPerc * IMAGE_WIDTH) - IMAGE_HEIGHT / 2;
        // console.log(xPerc);

        const isMobile = width < height;

        const globeCenterPosition = getGlobeCenterPosition(width, height);
        const globeWidth = getGlobeWidth(width, height);
        const globeRadius = globeWidth / 2;

        // Draw 5px long horizontal white lines at 50% opacity along the left and right edges of the canvas, giving
        // a 3px gap along the edge of the canvas. The lines should be spaced every 14px.
        ctx.save();
        ctx.beginPath();
        const scrollOffset = -((scrollY / 2) % 14) * devicePixelRatio;
        const sideTickOpacity =
          Math.max(0, Math.min(1, getSignedCloseness(xPerc, 0.175, 0.1))) * 0.5;
        ctx.globalAlpha = sideTickOpacity;
        for (let i = 0; i < height / devicePixelRatio + 14; i += 14) {
          const y = i * devicePixelRatio + scrollOffset;
          const closeness = getCloseness(y, globeCenterPosition, 50);
          const lineWidth = 5 + (closeness * 20) ** 1.25 + closeness * 20;
          ctx.moveTo(3 * devicePixelRatio, y);
          ctx.lineTo((3 + lineWidth) * devicePixelRatio, y);
          ctx.moveTo(width - 3 * devicePixelRatio, y);
          ctx.lineTo(width - (3 + lineWidth) * devicePixelRatio, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        const [gvVideo, gvLoaded] = gv.current!;
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

          const giX =
            width / 2 - globeRadius - (imageOffset / IMAGE_WIDTH) * giWidth;
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

        // Draw the orbs
        ctx.save();
        const positions = isMobile ? orbPositionsMobile : orbPositionsDesktop;
        const orbRadius = isMobile ? 25 : 30;
        const orbSizeRatio = isMobile ? 0.8333 : 1;
        for (let i = 0; i < positions.length; i++) {
          const position = positions[i];
          const rotation = position.rotation; // in degrees
          const dist = position.dist;
          const animPerc = dist === 0 ? xPerc : dist === 1 ? xPerc2 : xPerc3;
          const orbDistance =
            globeRadius *
            (1 + radiusIncrement * (dist === 0 ? 0.75 : dist + 1));

          const perlinRotationOffset =
            perlin.noise3d(now / 1000 / 3, dist, rotation) / 50;

          const distributionSectionOpacity =
            getCloseness(animPerc, DISTRIBUTION_IMAGE_OFFSET, 0.07) * 1; // No scale factor, it's a percent
          const distributionRotationOffset =
            perlinRotationOffset +
            getSignedCloseness(animPerc, DISTRIBUTION_IMAGE_OFFSET, 0.07) *
              -0.15; // 0.15 radians
          // console.log(distributionSectionOffset, distributionRotationOffset);
          if (distributionSectionOpacity > 0.01) {
            ctx.globalAlpha = distributionSectionOpacity;
            const distributionIcon = iconCache.get(distributionIcons[i])!;
            ctx.drawImage(
              distributionIcon,
              0,
              0,
              distributionIcon.width,
              distributionIcon.height - (isMobile ? 30 : 0),
              width / 2 -
                (distributionIcon.width * devicePixelRatio * orbSizeRatio) / 2 -
                Math.cos(rotation + distributionRotationOffset) * orbDistance,
              globeCenterPosition -
                orbRadius * devicePixelRatio -
                Math.sin(rotation + distributionRotationOffset) * orbDistance,
              distributionIcon.width * devicePixelRatio * orbSizeRatio,
              (distributionIcon.height - (isMobile ? 30 : 0)) *
                devicePixelRatio *
                orbSizeRatio,
            );
          }
          // // Draw a debug message next to the orb
          // ctx.fillStyle = 'red';
          // ctx.fillText(
          //   `Point ${i}`,
          //   width / 2 - Math.cos(rotation) * orbDistance,
          //   globeCenterPosition - Math.sin(rotation) * orbDistance,
          // );

          const analyticsIcon = iconCache.get(analyticsIcons[i])!;
          const analyticsSectionOpacity =
            getCloseness(animPerc, ANALYTICS_IMAGE_OFFSET, 0.07) * 1; // No scale factor, it's a percent
          const analyticsRotationOffset =
            perlinRotationOffset +
            getSignedCloseness(animPerc, ANALYTICS_IMAGE_OFFSET, 0.07) * -0.15; // 0.15 radians
          if (analyticsSectionOpacity > 0.01) {
            ctx.globalAlpha = analyticsSectionOpacity;
            ctx.drawImage(
              analyticsIcon,
              0,
              0,
              analyticsIcon.width,
              analyticsIcon.height - (isMobile ? 30 : 0),
              width / 2 -
                (analyticsIcon.width * devicePixelRatio * orbSizeRatio) / 2 -
                Math.cos(rotation + analyticsRotationOffset) * orbDistance,
              globeCenterPosition -
                orbRadius * devicePixelRatio -
                Math.sin(rotation + analyticsRotationOffset) * orbDistance,
              analyticsIcon.width * devicePixelRatio * orbSizeRatio,
              (analyticsIcon.height - (isMobile ? 30 : 0)) *
                devicePixelRatio *
                orbSizeRatio,
            );
          }

          const monetizationIcon = iconCache.get(monetizationIcons[i])!;
          const monetizationSectionOpacity =
            getCloseness(animPerc, MONETIZATION_IMAGE_OFFSET, 0.07) * 1; // No scale factor, it's a percent
          const monetizationRotationOffset =
            perlinRotationOffset +
            getSignedCloseness(animPerc, MONETIZATION_IMAGE_OFFSET, 0.07) *
              -0.15; // 0.15 radians
          if (monetizationSectionOpacity > 0.01) {
            ctx.globalAlpha = monetizationSectionOpacity;
            ctx.drawImage(
              monetizationIcon,
              0,
              0,
              monetizationIcon.width,
              monetizationIcon.height - (isMobile ? 30 : 0),
              width / 2 -
                (monetizationIcon.width * devicePixelRatio * orbSizeRatio) / 2 -
                Math.cos(rotation + monetizationRotationOffset) * orbDistance,
              globeCenterPosition -
                orbRadius * devicePixelRatio -
                Math.sin(rotation + monetizationRotationOffset) * orbDistance,
              monetizationIcon.width * devicePixelRatio * orbSizeRatio,
              (monetizationIcon.height - (isMobile ? 30 : 0)) *
                devicePixelRatio *
                orbSizeRatio,
            );
          }
        }
        ctx.restore();
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
            width: `${width / (global.devicePixelRatio ?? 1)}px`,
            height: `${height / (global.devicePixelRatio ?? 1)}px`,
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
          height={height / (global.devicePixelRatio ?? 1)}
          width={width / (global.devicePixelRatio ?? 1)}
        />
      </div>

      {/* Spacer */}
      <div
        className={css({
          height: `calc(${VIEWPORT_HEIGHTS} * 100vh)`,
          position: 'relative',
          pointerEvents: 'none',
          visibility: 'hidden',
          top: '-100vh',
        })}
      >
        <a
          id="distribution"
          className={css({
            position: 'absolute',
            top: `calc(${
              getScrollOffset(DISTRIBUTION_SCROLL_OFFSET) * VIEWPORT_HEIGHTS
            } * 100vh)`,
          })}
        />
        <a
          id="analytics"
          className={css({
            position: 'absolute',
            top: `calc(${
              getScrollOffset(ANALYTICS_SCROLL_OFFSET) * VIEWPORT_HEIGHTS
            } * 100vh)`,
          })}
        />
        <a
          id="monetization"
          className={css({
            position: 'absolute',
            top: `calc(${
              getScrollOffset(MONETIZATION_SCROLL_OFFSET) * VIEWPORT_HEIGHTS
            } * 100vh)`,
          })}
        />
      </div>
    </section>
  );
};
