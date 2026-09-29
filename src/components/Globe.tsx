import {useCSS} from '@/hooks/useCSS';
import {Body1, Body4, H1, Link as ProseLink} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {useDarkSection} from '@/hooks/useDarkSection';
import {MonumentGroteskBold} from '@/fonts';
import Link from 'next/link';
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
import {dpi} from '@/canvasHelpers';
import {useAudioManager} from '@/hooks/useAudioManager';
import {SoundEffect} from '@/hooks/useSoundEffects';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';
import {ScreenReaderText} from './ScreenReaderText';
import {isMotionPaused, useMotion} from '@/hooks/useMotion';
import {DARK_SURFACE, SCROLL_PADDING_TOP, TABLET_BREAKPOINT} from '@/constants';

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
const iconCache = new Map<unknown, HTMLImageElement>();
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

// The feature links on the globe, in the order of the curved text.
const MENU_LINKS: Array<Feature> = [
  'distribution',
  'analytics',
  'monetization',
];
// The smallest hit area of a feature link, in CSS pixels (WCAG 2.5.8). On a
// narrow screen the link text is only about 11 pixels tall. The words follow
// a curve, so the band under each word is thick enough to hold a square of
// this size at any angle.
const MIN_LINK_TARGET_SIZE = 24;
const LINK_HIT_AREA_THICKNESS = MIN_LINK_TARGET_SIZE * Math.SQRT2 + 2;
// How far inward of the baseline the band of a hit area is centered, in em.
const HIT_AREA_INSET = 0.35;
// The thickness of a hit area in the units of the menu, where one unit is
// `scale` CSS pixels.
const getHitAreaThickness = (scale: number, fontSize: number) =>
  Math.max(LINK_HIT_AREA_THICKNESS / scale, fontSize * 1.2);
const LINK_HOVER_TEXT_SHADOW =
  '0 0 10px rgba(255, 255, 255, 0.85), 0 0 7px #c4ff7e, 0 0 4px #090909';

// The outline of text on a curved path is a staircase of letter boxes. With
// keyboard focus, give the link its hover glow and underline it along the
// curve instead, in full white.
const LINK_FOCUS_STYLE = {
  ':focus-visible': {
    opacity: 1,
    outline: 'none',
    textShadow: LINK_HOVER_TEXT_SHADOW,
    textDecorationColor: 'var(--color-white)',
    textDecorationLine: 'underline',
    textDecorationThickness: '2px',
    textUnderlineOffset: '4px',
  },
} as const;

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
        The most powerful analytics in podcasting, with premium features, simple
        charts, and clean controls.
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

  const enteringSoundSentinelRef = React.useRef<HTMLDivElement>(null);
  const exitingSoundSentinelRef = React.useRef<HTMLDivElement>(null);

  const {
    soundEffects: {play: playSoundEffect},
  } = useAudioManager();

  useIntersectionVisibility(
    enteringSoundSentinelRef,
    React.useCallback(
      intersecting => {
        if (intersecting) {
          playSoundEffect(SoundEffect.SWOOSH_TRANSITION);
        }
      },
      [playSoundEffect],
    ),
  );

  useIntersectionVisibility(
    exitingSoundSentinelRef,
    React.useCallback(
      intersecting => {
        if (intersecting) {
          playSoundEffect(SoundEffect.PAGE_TRANSITION_3);
        }
      },
      [playSoundEffect],
    ),
  );

  return (
    <div
      className={css({
        backgroundImage:
          'linear-gradient(to bottom, rgba(9,9,9,0.65) 30%,rgba(9,9,9,0) 90%)',
        borderRadius: '0 0 100% 100%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
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
      <div ref={enteringSoundSentinelRef} />
      <H1
        level={2}
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
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: '32rem',
          paddingLeft: '10px',
          paddingRight: '10px',
          textAlign: 'center',
        }}
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
      <div ref={exitingSoundSentinelRef} />
    </div>
  );
});

// Scrolling picks the feature that shows. All three descriptions stay in the
// page for screen readers, and the others are invisible. They take the same
// place, so that the list is as tall as the longest one, whichever shows: on a
// narrow screen the globe makes room for it (see layOut in Globe).
const FeatureText = React.memo(function FeatureText({
  currentFeatureSlug,
  listRef,
}: {
  currentFeatureSlug: Feature | null;
  listRef: React.Ref<HTMLUListElement>;
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
        opacity: currentFeatureSlug ? '1' : '0',
        paddingBottom: '20px',
        placeItems: 'end',
        pointerEvents: currentFeatureSlug ? 'auto' : 'none',
        position: 'absolute',
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
          <ul
            ref={listRef}
            className={css({
              display: 'grid',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            })}
          >
            {(Object.keys(FEATURES) as Array<Feature>).map(slug => {
              const feature = FEATURES[slug];
              const isCurrent = slug === currentFeatureSlug;
              return (
                <li
                  aria-current={isCurrent ? 'true' : undefined}
                  className={css({
                    gridArea: '1 / 1',
                    // Where the container puts the list.
                    alignSelf: 'end',
                    [WIDE_DESCRIPTION_PLACEMENT_QUERY]: {alignSelf: 'center'},
                    ...(isCurrent ? {} : {opacity: 0, pointerEvents: 'none'}),
                  })}
                  key={slug}
                >
                  <Body1
                    as="p"
                    style={{
                      color: 'var(--color-white)',
                      lineHeight: 1.05,
                      marginBottom: '10px',
                      transition: '0.2s opacity ease',
                    }}
                  >
                    <ScreenReaderText>{feature.title}: </ScreenReaderText>
                    {feature.description}
                  </Body1>
                  {/* Only the link of the feature on screen shows, so that
                      focus never lands on a hidden one. The others keep its
                      place. */}
                  <ProseLink
                    href={feature.href}
                    style={{
                      marginBottom: '-8px',
                      paddingBottom: '8px',
                      paddingTop: '8px',
                      visibility: isCurrent ? undefined : 'hidden',
                    }}
                  >
                    Learn more
                  </ProseLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
});

const FeatureMenu = React.forwardRef(function FeatureMenu(
  {
    currentFeatureSlug,
    geometry: {radius, fontSize},
  }: {
    currentFeatureSlug: Feature | null;
    geometry: MenuGeometry;
  },
  ref: React.Ref<SVGSVGElement>,
) {
  const css = useCSS();

  const svgRef = React.useRef<SVGSVGElement>(null);
  React.useImperativeHandle(ref, () => svgRef.current!, []);
  const textRef = React.useRef<SVGTextElement>(null);
  const hitAreaRefs = React.useRef<Partial<Record<Feature, SVGPathElement>>>(
    {},
  );
  const radiusRef = React.useRef(radius);
  radiusRef.current = radius;

  // Draw each hit area as a band along the curve, under its word: it starts
  // and ends with the word, and it is at least LINK_HIT_AREA_THICKNESS thick.
  const layOutHitAreas = React.useCallback(() => {
    const text = textRef.current;
    const scale = svgRef.current?.getScreenCTM()?.a;
    if (!text || !scale) {
      return;
    }
    // The circle of `globeCurvedTextPath`.
    const r = radiusRef.current;
    const centerX = 200;
    const centerY = 50 - r;
    const fontSize = parseFloat(getComputedStyle(text).fontSize);
    // The glyphs sit inside the curve, so center the band a little inward
    // of the baseline.
    const bandRadius = r - fontSize * HIT_AREA_INSET;
    const thickness = getHitAreaThickness(scale, fontSize);
    const onBand = ({x, y}: DOMPoint) => {
      const angle = Math.atan2(y - centerY, x - centerX);
      return `${centerX + bandRadius * Math.cos(angle)} ${
        centerY + bandRadius * Math.sin(angle)
      }`;
    };

    let charIndex = 0;
    for (const link of text.querySelectorAll('a')) {
      const length = link.textContent?.length ?? 0;
      const first = charIndex;
      charIndex += length;
      // Next renders `#analytics` as `/#analytics`.
      const slug = link.getAttribute('href')?.split('#')[1] as Feature;
      const hitArea = hitAreaRefs.current[slug];
      if (!hitArea || !length) {
        continue;
      }
      let start: DOMPoint, end: DOMPoint;
      try {
        start = text.getStartPositionOfChar(first);
        end = text.getEndPositionOfChar(first + length - 1);
      } catch {
        // The text is not laid out (for example, it is not displayed).
        continue;
      }
      hitArea.setAttribute(
        'd',
        `M ${onBand(start)} A ${bandRadius} ${bandRadius} 0 0 0 ${onBand(end)}`,
      );
      hitArea.setAttribute('stroke-width', String(thickness));
    }
  }, []);

  // The font size follows the geometry, so lay out again after each render,
  // after a resize (which changes the scale) and when the font loads.
  React.useEffect(layOutHitAreas);
  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const observer = new ResizeObserver(layOutHitAreas);
    observer.observe(svg);
    document.fonts.ready.then(layOutHitAreas);
    document.fonts.addEventListener('loadingdone', layOutHitAreas);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', layOutHitAreas);
    };
  }, [layOutHitAreas]);

  return (
    <svg
      ref={svgRef}
      className={css({
        position: 'absolute',
        margin: '0 auto',
        width: '400px',
        // The globe sets the size from the screen once the page script runs.
        // Until then, do not make a narrow page scroll sideways.
        maxWidth: '100%',
        zIndex: 4,
        // Hovering a hit area lights up its link, as hovering the link does.
        ...Object.fromEntries(
          MENU_LINKS.map(slug => [
            `:has([data-hit-area="${slug}"]:hover) [href$="#${slug}"]`,
            {textShadow: LINK_HOVER_TEXT_SHADOW},
          ]),
        ),
      })}
      viewBox="0 0 400 100"
      width="400"
      height="100"
      preserveAspectRatio="none"
    >
      <g transform={`translate(0 ${MENU_BASELINE - 50})`}>
        <path
          d={`M ${-radius + 200} ${-(
            radius - 50
          )} a ${radius} ${radius} 0 1 0 ${2 * radius} 0`}
          id="globeCurvedTextPath"
          fill="transparent"
        />
        {/* Larger hit areas for pointer users, between the curve (which
            also takes pointer events) and the text. Each is a copy of a link
            in the text, so it is hidden from assistive technology and from
            the tab order. */}
        {MENU_LINKS.map(slug => (
          <Link
            key={slug}
            href={`#${slug}`}
            tabIndex={-1}
            aria-hidden="true"
            data-hit-area={slug}
            className={css({cursor: 'pointer'})}
          >
            <path
              ref={(elem: SVGPathElement | null) => {
                hitAreaRefs.current[slug] = elem ?? undefined;
              }}
              fill="none"
              stroke="transparent"
              pointerEvents="stroke"
            />
          </Link>
        ))}
        <text
          ref={textRef}
          fill="var(--color-white)"
          className={css({
            ...MonumentGroteskBold,
            fontSize: `${fontSize}px`,
            fontWeight: 400,
          })}
        >
          <textPath
            xlinkHref="#globeCurvedTextPath"
            startOffset="50%"
            textAnchor="middle"
          >
            <Link
              aria-current={
                currentFeatureSlug === 'distribution' ? 'true' : undefined
              }
              className={css({
                fill: 'inherit',
                opacity: currentFeatureSlug === 'distribution' ? 1 : 0.46,
                color: '#fff',
                transition: 'opacity 0.2s, text-shadow 0.2s, color 0.2s',
                textShadow:
                  '0 0 10px rgba(255, 255, 255, 0), 0 0 7px transparent, 0 0 4px #090909',
                ':focus:active': {
                  color: '#c4ff7e',
                  opacity: 1,
                },
                ':hover': {textShadow: LINK_HOVER_TEXT_SHADOW},
                ...LINK_FOCUS_STYLE,
              })}
              href="#distribution"
            >
              Distribution
            </Link>
            <tspan dx={10}>
              <Link
                aria-current={
                  currentFeatureSlug === 'analytics' ? 'true' : undefined
                }
                className={css({
                  fill: 'inherit',
                  opacity: currentFeatureSlug === 'analytics' ? 1 : 0.46,
                  color: '#fff',
                  transition: 'opacity 0.2s, text-shadow 0.2s, color 0.2s',
                  textShadow:
                    '0 0 10px rgba(255, 255, 255, 0), 0 0 7px transparent, 0 0 4px #090909',
                  ':focus:active': {
                    color: '#c4ff7e',
                    opacity: 1,
                  },
                  ':hover': {textShadow: LINK_HOVER_TEXT_SHADOW},
                  ...LINK_FOCUS_STYLE,
                })}
                href="#analytics"
              >
                Analytics
              </Link>
            </tspan>
            <tspan dx={10}>
              <Link
                aria-current={
                  currentFeatureSlug === 'monetization' ? 'true' : undefined
                }
                className={css({
                  fill: 'inherit',
                  opacity: currentFeatureSlug === 'monetization' ? 1 : 0.46,
                  color: '#fff',
                  transition: 'opacity 0.2s, text-shadow 0.2s, color 0.2s',
                  textShadow:
                    '0 0 10px rgba(255, 255, 255, 0), 0 0 7px transparent, 0 0 4px #090909',
                  ':focus:active': {
                    color: '#c4ff7e',
                    opacity: 1,
                  },
                  ':hover': {textShadow: LINK_HOVER_TEXT_SHADOW},
                  ...LINK_FOCUS_STYLE,
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
  const headerSize = (isMobile ? 80 : 120) * (adjustForDpr ? dpi : 1);
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

// The link menu is 400 by 100 units (its viewBox), and it is `width` CSS
// pixels wide. Its text follows a circle of `radius` units, at `fontSize`
// units. The circle is at the bottom of the text, MENU_BASELINE units from the
// top.
type MenuGeometry = {width: number; radius: number; fontSize: number};
const MENU_BASELINE = 70;
// The space between the menu and the text of the feature, in CSS pixels.
const MENU_MARGIN = 10;

// The menu that fits the globe at this size of the viewport.
function getGlobeMenuGeometry(width: number, height: number): MenuGeometry {
  const globeWidth = getGlobeWidth(width, height);
  const isMobile = width < height;
  const radius = Math.min(globeWidth / 2 + 80, width);
  return {
    width: Math.min((globeWidth / 850) * 400 * (isMobile ? 3 : 1.5), width),
    radius,
    fontSize: Math.max(14, Math.min(24, radius * 0.075)),
  };
}

// The size of the link text in CSS pixels.
const getMenuTextSize = ({width, fontSize}: MenuGeometry) =>
  (fontSize * width) / 400;

// The globe gets its size from the viewport, and zoom makes the viewport
// smaller in CSS pixels. So that the link text grows with zoom (WCAG 1.4.4),
// the menu is never smaller than at 1280 by 800 (landscape) or 375 by 667
// (portrait). Only a page narrower than that menu makes it smaller.
const MIN_MENU_GEOMETRY = {
  landscape: getGlobeMenuGeometry(1280, 800),
  portrait: getGlobeMenuGeometry(375, 667),
};

function getMenuGeometry(width: number, height: number): MenuGeometry {
  const geometry = getGlobeMenuGeometry(width, height);
  const min =
    width < height ? MIN_MENU_GEOMETRY.portrait : MIN_MENU_GEOMETRY.landscape;
  if (getMenuTextSize(geometry) >= getMenuTextSize(min)) {
    return geometry;
  }
  return {...min, width: Math.min(min.width, width)};
}

// The distance from the top of the menu to the bottom of its text and of the
// hit areas of its links, in CSS pixels.
function getMenuContentHeight({width, fontSize}: MenuGeometry) {
  const scale = width / 400;
  const textBottom = MENU_BASELINE + fontSize * 0.25;
  const hitAreaBottom =
    MENU_BASELINE -
    fontSize * HIT_AREA_INSET +
    getHitAreaThickness(scale, fontSize) / 2;
  return Math.max(textBottom, hitAreaBottom) * scale;
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

  const {
    soundEffects: {play: playSoundEffect},
  } = useAudioManager();

  const [isMobile, setIsMobile] = React.useState(false);
  // const [{width, height}, setWrapperSize] = React.useState<{
  //   width: number;
  //   height: number;
  // }>({
  //   width: 0,
  //   height: 0,
  // });
  const size = React.useRef({width: 0, height: 0});
  const [menuGeometry, setMenuGeometry] = React.useState(
    MIN_MENU_GEOMETRY.landscape,
  );
  const stage = React.useRef<HTMLDivElement>(null);
  const featureText = React.useRef<HTMLUListElement>(null);
  // The center and the width of the globe in CSS pixels, when it is smaller
  // to make room for the menu. Null when it has its usual size. A change
  // renders again, and so paints the canvas again also while paused.
  const [globeBox, setGlobeBox] = React.useState<{
    center: number;
    width: number;
  } | null>(null);
  const layOut = React.useCallback(() => {
    const verticalScrollbarWidth =
      window.innerWidth - document.body.offsetWidth;

    // Use the dimensions of the viewport without scrollbars.
    const width = window.innerWidth - verticalScrollbarWidth;
    const height = window.innerHeight;
    size.current = {
      width: width * dpi,
      height: height * dpi,
    };
    const m = menu.current!;
    const isMobile = width < height;
    const geometry = getMenuGeometry(width, height);
    const menuLeft = (width - geometry.width) / 2;
    const menuContentHeight = getMenuContentHeight(geometry);
    let globeCenterPosition = getGlobeCenterPosition(width, height, false);
    let globeWidth = getGlobeWidth(width, height);
    let menuTop = globeCenterPosition + globeWidth / 2;

    // The menu is under the globe. Its text must end above the bottom of the
    // screen, and above the text of the feature where that is under the menu
    // (on a narrow screen).
    let bottom = height - MENU_MARGIN;
    const list = featureText.current?.getBoundingClientRect();
    const stageTop = stage.current?.getBoundingClientRect().top ?? 0;
    if (
      list &&
      list.left < menuLeft + geometry.width &&
      list.right > menuLeft
    ) {
      bottom = Math.min(bottom, list.top - stageTop - MENU_MARGIN);
    }
    let box: {center: number; width: number} | null = null;
    if (menuTop + menuContentHeight > bottom) {
      // Move the menu up, and make the globe smaller where it must be to
      // stay between the header and the menu.
      const headerSize = width > TABLET_BREAKPOINT ? 120 : 80;
      menuTop = Math.max(headerSize, bottom - menuContentHeight);
      globeWidth = Math.max(0, Math.min(globeWidth, menuTop - headerSize));
      globeCenterPosition = menuTop - globeWidth / 2;
      box = {center: globeCenterPosition, width: globeWidth};
    }

    m.style.left = `${menuLeft}px`;
    m.style.top = `${menuTop}px`;
    m.style.width = `${geometry.width}px`;
    m.style.height = `${geometry.width / 4}px`;

    // Setting the size clears the canvas, so set it only when it changes:
    // this also runs when the text of the feature changes its size.
    const c = canvas.current;
    if (c && (c.width !== width * dpi || c.height !== height * dpi)) {
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      c.width = width * dpi;
      c.height = height * dpi;
    }

    setGlobeBox(current =>
      current?.center === box?.center && current?.width === box?.width
        ? current
        : box,
    );
    setMenuGeometry(current =>
      current.width === geometry.width &&
      current.radius === geometry.radius &&
      current.fontSize === geometry.fontSize
        ? current
        : geometry,
    );
    setIsMobile(isMobile);
  }, []);
  useCalculateResizableValue(layOut);
  // Lay out again when the text of the feature changes its size: when the
  // font loads, or with other text settings.
  React.useEffect(() => {
    const list = featureText.current;
    if (!list) {
      return;
    }
    const observer = new ResizeObserver(layOut);
    observer.observe(list);
    return () => observer.disconnect();
  }, [layOut]);

  const canvas = React.useRef<HTMLCanvasElement>(null);
  const gi = useAsyncImage('/images/globe-full.jpg');

  // The "Pause animations" toggle stops the video and the drift of the orbs
  // where they are. With reduced motion, the globe also does not follow the
  // scroll: it stays as it is at the top of the section, and only the text and
  // the current link change.
  const {paused, reducedMotion: isStatic} = useMotion();
  // Load the video when the animations first play. Until then, the still
  // image of the globe shows, as it does while the video loads.
  const [animationsPlayed, setAnimationsPlayed] = React.useState(false);
  React.useEffect(() => {
    // Read the store: in the first render, `paused` is the value of the
    // static export, not the choice of the user.
    if (!isMotionPaused()) {
      setAnimationsPlayed(true);
    }
  }, [paused]);

  // We load two versions of the video. They are switched between by the
  // dual video manager.
  const gv1 = useAsyncVideo(
    {
      'video/mp4': '/videos/globe/globe2x.mp4',
      [AV1_MIME]: '/videos/globe/globe2x.av1.mp4',
    },
    // Disable the video on mobile
    !isMobile && animationsPlayed,
    false,
  );
  const gv2 = useAsyncVideo(
    {
      'video/mp4': '/videos/globe/globe2x.mp4',
      [AV1_MIME]: '/videos/globe/globe2x.av1.mp4',
    },
    // Disable the video on mobile
    !isMobile && animationsPlayed,
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

  React.useEffect(() => {
    if (!currentFeatureSlug) {
      return;
    }
    playSoundEffect(SoundEffect.GLOBE_TRANSITION_STATES);
  }, [currentFeatureSlug, playSoundEffect]);

  const [segmentStart, segmentEnd] = getVideoSegmentBounds(
    isStatic ? 'distribution' : (currentFeatureSlug ?? 'distribution'),
  );
  const gv = useDualVideoManager(gv1, gv2, segmentStart, segmentEnd, 0.6);

  const imageState = React.useRef({
    xPerc: 0,
    xPerc2: 0,
    xPerc3: 0,
    lastTs: Date.now(),
    // The time of the drift of the orbs. It does not move while paused.
    driftTime: Date.now(),
  });

  useCanvasDrawing(
    canvas,
    React.useCallback(
      ctx => {
        const {width, height} = size.current;
        if (!width) return;
        // ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, width, height);

        const imageOffsetPercent = isStatic
          ? 0
          : getImageOffset(currentFeatureSlug);
        const {xPerc, xPerc2, xPerc3, lastTs} = imageState.current;
        const now = Date.now();
        const delta = now - lastTs;
        imageState.current.lastTs = now;
        if (!isMotionPaused()) {
          imageState.current.driftTime += delta;
        }
        // A step never goes past the target, also after a long gap between
        // two paints (off screen or paused). A static globe jumps to it.
        const step = (rate: number) =>
          isStatic ? 1 : Math.min(1, delta * rate);
        imageState.current.xPerc =
          xPerc + (imageOffsetPercent - xPerc) * step(0.008);
        imageState.current.xPerc2 =
          xPerc2 + (imageOffsetPercent - xPerc2) * step(0.004);
        imageState.current.xPerc3 =
          xPerc3 + (imageOffsetPercent - xPerc3) * step(0.002);
        const driftTime = imageState.current.driftTime;
        const imageOffset =
          Math.max(IMAGE_HEIGHT / 2, xPerc * IMAGE_WIDTH) - IMAGE_HEIGHT / 2;
        // console.log(xPerc);

        const isMobile = width < height;

        const globeCenterPosition = globeBox
          ? globeBox.center * dpi
          : getGlobeCenterPosition(width, height);
        const globeWidth = globeBox
          ? globeBox.width * dpi
          : getGlobeWidth(width, height);
        const globeRadius = globeWidth / 2;

        // Draw 5px long horizontal white lines at 50% opacity along the left and right edges of the canvas, giving
        // a 3px gap along the edge of the canvas. The lines should be spaced every 14px.
        ctx.save();
        ctx.beginPath();
        const scrollOffset = isStatic ? 0 : -((scrollY / 2) % 14) * dpi;
        const sideTickOpacity =
          Math.max(0, Math.min(1, getSignedCloseness(xPerc, 0.1, 0.1))) * 0.5;
        ctx.globalAlpha = sideTickOpacity;
        for (let i = 0; i < height / dpi + 14; i += 14) {
          const y = i * dpi + scrollOffset;
          const closeness = getCloseness(y, globeCenterPosition, 50);
          const lineWidth = 5 + (closeness * 20) ** 1.25 + closeness * 20;
          ctx.moveTo(3 * dpi, y);
          ctx.lineTo((3 + lineWidth) * dpi, y);
          ctx.moveTo(width - 3 * dpi, y);
          ctx.lineTo(width - (3 + lineWidth) * dpi, y);
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
            perlin.noise3d(driftTime / 1000 / 3, dist / 4, rotation) / 50;

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
                (distributionIcon.width * dpi * orbSizeRatio) / 2 -
                Math.cos(rotation + distributionRotationOffset) * orbDistance,
              globeCenterPosition -
                orbRadius * dpi -
                Math.sin(rotation + distributionRotationOffset) * orbDistance,
              distributionIcon.width * dpi * orbSizeRatio,
              (distributionIcon.height - (isMobile ? 30 : 0)) *
                dpi *
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
                (analyticsIcon.width * dpi * orbSizeRatio) / 2 -
                Math.cos(rotation + analyticsRotationOffset) * orbDistance,
              globeCenterPosition -
                orbRadius * dpi -
                Math.sin(rotation + analyticsRotationOffset) * orbDistance,
              analyticsIcon.width * dpi * orbSizeRatio,
              (analyticsIcon.height - (isMobile ? 30 : 0)) * dpi * orbSizeRatio,
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
                (monetizationIcon.width * dpi * orbSizeRatio) / 2 -
                Math.cos(rotation + monetizationRotationOffset) * orbDistance,
              globeCenterPosition -
                orbRadius * dpi -
                Math.sin(rotation + monetizationRotationOffset) * orbDistance,
              monetizationIcon.width * dpi * orbSizeRatio,
              (monetizationIcon.height - (isMobile ? 30 : 0)) *
                dpi *
                orbSizeRatio,
            );
          }
        }
        ctx.restore();

        // While paused, paint until the orbs reach the feature that the
        // scroll picked, and until the video shows the frame it seeks to.
        const {xPerc3: slowest} = imageState.current;
        return (
          Math.abs(imageOffsetPercent - slowest) > 0.001 ||
          (gvLoaded && gvVideo.seeking)
        );
      },
      [currentFeatureSlug, gi, gv, globeBox, isStatic],
    ),
  );

  return (
    <section
      ref={ref}
      className={css({
        ...DARK_SURFACE,
        backgroundColor: 'var(--color-space)',
        position: 'relative',
        zIndex: 2,
      })}
    >
      <IntroSection />
      <div
        ref={stage}
        className={css({
          position: 'sticky',
          height: '100vh',
          top: 0,
        })}
      >
        <canvas
          aria-hidden="true"
          className={css({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 3,
            pointerEvents: 'none',
            imageRendering: 'pixelated',
            width: `${size.current.width / dpi}px`,
            height: `${size.current.height / dpi}px`,
          })}
          ref={canvas}
          height={size.current.height}
          width={size.current.width}
        />
        {/* <SideTicks /> */}
        <FeatureText
          currentFeatureSlug={currentFeatureSlug}
          listRef={featureText}
        />
        <FeatureMenu
          currentFeatureSlug={currentFeatureSlug}
          ref={menu}
          geometry={menuGeometry}
        />
      </div>

      {/* Spacer. The links of the menu scroll to its anchors. The anchors
          are scroll positions, not content, so they cancel the scroll padding
          of the page. With it, each link showed the feature before its own. */}
      <div
        className={css({
          height: `calc(${VIEWPORT_HEIGHTS} * 100vh)`,
          position: 'relative',
          pointerEvents: 'none',
          visibility: 'hidden',
          top: '-100vh',
        })}
      >
        <span
          id="distribution"
          className={css({
            position: 'absolute',
            scrollMarginTop: `-${SCROLL_PADDING_TOP}px`,
            top: `calc(${
              getScrollOffset(DISTRIBUTION_SCROLL_OFFSET) * VIEWPORT_HEIGHTS
            } * 100vh)`,
          })}
        />
        <span
          id="analytics"
          className={css({
            position: 'absolute',
            scrollMarginTop: `-${SCROLL_PADDING_TOP}px`,
            top: `calc(${
              getScrollOffset(ANALYTICS_SCROLL_OFFSET) * VIEWPORT_HEIGHTS
            } * 100vh)`,
          })}
        />
        <span
          id="monetization"
          className={css({
            position: 'absolute',
            scrollMarginTop: `-${SCROLL_PADDING_TOP}px`,
            top: `calc(${
              getScrollOffset(MONETIZATION_SCROLL_OFFSET) * VIEWPORT_HEIGHTS
            } * 100vh)`,
          })}
        />
      </div>
    </section>
  );
};
