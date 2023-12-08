import {useCSS} from '@/hooks/useCSS';
import {Body4, H1} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import * as React from 'react';
import {useDarkSection} from '@/hooks/useDarkSection';
import {
  ElementOutput,
  Timeline,
  useScrollTimeline,
} from '@/hooks/useScrollTimeline';
import {MonumentGroteskRegular} from '@/fonts';
import Link from 'next/link';
import {MOBILE_MEDIA_QUERY} from '@/constants';
import {SideTicks} from './SideTicks';

const timeline = {
  globeX: {
    property: 'backgroundPositionX',
    unit: '%',
    keyframes: [
      {target: 0, ease: 'linear'},
      {target: 8, ease: 'linear'},
      {target: 8, ease: 'linear'},
      {target: 50, ease: 'linear'},
      {target: 50, ease: 'linear'},
      {target: 94.5, ease: 'linear'},
      {target: 94.5, ease: 'linear'},
      {target: 100, ease: 'linear'},
    ],
  },
  menuDistribution: {
    property: 'opacity',
    unit: '',
    keyframes: [
      {target: 1, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
    ],
  },
  menuAnalytics: {
    property: 'opacity',
    unit: '',
    keyframes: [
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
    ],
  },
  menuMonetization: {
    property: 'opacity',
    unit: '',
    keyframes: [
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 0.3, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
      {target: 1, ease: 'easeInOut'},
    ],
  },
};
const elements = Object.keys(timeline) as Array<keyof typeof timeline>;

const RadialLines = () => {
  const css = useCSS();
  return (
    <svg
      width="100%"
      height="100%"
      className={css({
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      })}
    >
      <defs>
        <linearGradient
          id="globeRadialLinesOverlay"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--color-space)" stopOpacity={1} />
          <stop offset="100%" stopColor="var(--color-space)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <clipPath id="globeRadialLinesClip">
        <rect
          fill="red"
          style={{
            height: 'calc(120px + var(--globe-vertical-space) / 2)',
            width: '100%',
          }}
        />
      </clipPath>
      <circle
        style={
          {
            r: 'calc(var(--globe-ideal-height) / 2 * 1.45)',
            cx: '50%',
            cy: 'calc(var(--globe-vertical-space) / 2 + 120px)',
            transformOrigin: '50% 50%',
          } as any
        }
        fill="transparent"
        stroke="var(--color-white)"
        strokeWidth={1.25}
        clipPath="url(#globeRadialLinesClip)"
        opacity="0.35"
      />
      <circle
        style={
          {
            r: 'calc(var(--globe-ideal-height) / 2 * 1.9)',
            cx: '50%',
            cy: 'calc(var(--globe-vertical-space) / 2 + 120px)',
            transformOrigin: '50% 50%',
          } as any
        }
        fill="transparent"
        stroke="var(--color-white)"
        strokeWidth={1.25}
        clipPath="url(#globeRadialLinesClip)"
        opacity="0.25"
      />
      <circle
        style={
          {
            r: 'calc(var(--globe-ideal-height) / 2 * 2.35)',
            cx: '50%',
            cy: 'calc(var(--globe-vertical-space) / 2 + 120px)',
            transformOrigin: '50% 50%',
          } as any
        }
        fill="transparent"
        stroke="var(--color-white)"
        strokeWidth={1.25}
        clipPath="url(#globeRadialLinesClip)"
        opacity="0.15"
      />
      <rect fill="url(#globeRadialLinesOverlay)" height="100" width="100%" />
    </svg>
  );
};

export const Globe = () => {
  const css = useCSS();

  const ref = React.useRef<HTMLElement>(null);
  useDarkSection(ref);

  const globeCircleRef = React.useRef<HTMLDivElement>(null);
  const menuDistributionRef = React.useRef<HTMLAnchorElement>(null);
  const menuAnalyticsRef = React.useRef<HTMLAnchorElement>(null);
  const menuMonetizationRef = React.useRef<HTMLAnchorElement>(null);

  const elementRefs = {
    globeX: globeCircleRef,
    menuDistribution: menuDistributionRef,
    menuAnalytics: menuAnalyticsRef,
    menuMonetization: menuMonetizationRef,
  } as const;

  const scrollHandler = React.useCallback((props: ElementOutput) => {
    for (const element of elements) {
      elementRefs[element].current!.style[props[element][0] as any] =
        props[element][1];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useScrollTimeline(ref, timeline as Timeline, scrollHandler);

  return (
    <section
      ref={ref}
      className={css({
        backgroundColor: 'var(--color-space)',
        position: 'relative',
      })}
    >
      <SideTicks />
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'center',
          margin: '0 auto',
          maxWidth: '946px',
          paddingTop: '100px',

          '--color-line': '#888',
          '--color-primary-dark': '#fff',
          '--color-primary-light': 'var(--color-space)',
          '--color-theme-mode': 'var(--color-space)',
          '--color-core-accent': '#888',
          color: 'var(--color-primary-dark)',
        })}
      >
        <H1>
          Check,
          <br />
          Check 1, 2, 3
        </H1>
        <Body4>
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
          <PrimaryButton href="https://pinecast.com/signup">
            Start for free
          </PrimaryButton>
          <SecondaryButton href="/features">Discover features</SecondaryButton>
        </div>
      </div>
      <div
        className={css({
          position: 'sticky',
          height: '100vh',
          top: 0,

          '--globe-vertical-space': 'calc(100vh - 120px)',
          '--globe-horizontal-space': '100vw',
          '--globe-ideal-vertical-height':
            'calc(var(--globe-vertical-space) * 0.7)',
          '--globe-ideal-horizontal-height':
            'calc(var(--globe-horizontal-space) * 0.5)',
          '--globe-ideal-height':
            'min(var(--globe-ideal-vertical-height), var(--globe-ideal-horizontal-height))',
        })}
      >
        <RadialLines />
        <div
          ref={globeCircleRef}
          className={css({
            borderRadius: '100%',
            backgroundImage: 'url(/images/globe-full.png)',
            backgroundPositionY: 'center',
            backgroundSize: 'auto calc(var(--globe-ideal-height) * 1.5)',
            position: 'absolute',
            top: 'calc(var(--globe-vertical-space) / 2 - var(--globe-ideal-height) / 2 + 120px)',
            left: '-100%',
            right: '-100%',
            margin: '0 auto',
            height: 'var(--globe-ideal-height)',
            width: 'var(--globe-ideal-height)',
            willChange: 'background-position-x',
          })}
        />
        <svg
          className={css({
            position: 'absolute',
            bottom:
              'calc(var(--globe-vertical-space) / 2 - var(--globe-ideal-height) / 2 - 150px)',
            left: '-100%',
            right: '-100%',
            margin: '0 auto',
            width: '471px',
          })}
        >
          <path
            d="M0.5 1.20642C67.3374 47.1259 148.28 74 235.5 74C322.72 74 403.663 47.1259 470.5 1.20642"
            id="globeCurvedTextPath"
            fill="transparent"
          />
          <text
            fill="var(--color-white)"
            className={css({
              ...MonumentGroteskRegular,
              fontSize: '26px',
              [MOBILE_MEDIA_QUERY]: {fontSize: '18px'},
            })}
          >
            <textPath
              xlinkHref="#globeCurvedTextPath"
              startOffset="50%"
              textAnchor="middle"
            >
              <Link
                className={css({fill: 'inherit'})}
                ref={menuDistributionRef}
                href="/features/distribution"
              >
                Distribution
              </Link>
              <tspan dx={10}>
                <Link
                  className={css({fill: 'inherit'})}
                  ref={menuAnalyticsRef}
                  href="/features/analytics"
                >
                  Analytics
                </Link>
              </tspan>
              <tspan dx={10}>
                <Link
                  className={css({fill: 'inherit'})}
                  ref={menuMonetizationRef}
                  href="/features/monetization"
                >
                  Monetization
                </Link>
              </tspan>
            </textPath>
          </text>
        </svg>
      </div>

      {/* Spacer */}
      <div className={css({height: 'calc(5 * 100vh)'})} />
    </section>
  );
};
