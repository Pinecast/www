import {useCSS} from '@/hooks/useCSS';
import {Body4, H1} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import React from 'react';
import {useDarkSection} from '@/hooks/useDarkSection';
import {
  ElementOutput,
  Timeline,
  useScrollTimeline,
} from '@/hooks/useScrollTimeline';
import {MonumentGroteskRegular} from '@/fonts';
import Link from 'next/link';

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

const RadialLine = ({offset, opacity}: {offset: number; opacity: number}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        borderTop: '1px solid #fff',
        borderLeft: '1px solid #fff',
        borderRight: '1px solid #fff',
        borderBottom: 0,
        borderTopLeftRadius: 'calc(var(--globe-ideal-height) * 2)',
        borderTopRightRadius: 'calc(var(--globe-ideal-height) * 2)',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        display: 'block',
        position: 'absolute',
        top: `calc(var(--globe-vertical-space) / 2 - var(--globe-ideal-height) / 2 - ${offset}px)`,
        left: '-100%',
        right: '-100%',
        margin: '0 auto',
        opacity,
        height: `calc((var(--globe-ideal-height) + 240px + ${
          offset * 2
        }px) / 2)`,
        width: `calc(var(--globe-ideal-height) + 240px + ${offset * 2}px)`,
        pointerEvents: 'none',
      })}
    />
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
        backgroundColor: '#090909',
      })}
    >
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

          '--color-line': '#f8f4eb',
          '--color-primary-dark': '#f8f4eb',
          '--color-primary-light': '#090909',
          '--color-theme-mode': '#090909',
          '--color-core-accent': '#888888',
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
        <RadialLine offset={0} opacity={0.35} />
        <RadialLine offset={120} opacity={0.25} />
        <RadialLine offset={240} opacity={0.15} />
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
            top: 'calc(var(--globe-vertical-space) / 2 + var(--globe-ideal-height) / 2 + 120px)',
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
            fill="#fff"
            className={css({...MonumentGroteskRegular, fontSize: '26px'})}
          >
            <textPath
              xlinkHref="#globeCurvedTextPath"
              startOffset="50%"
              textAnchor="middle"
            >
              <Link ref={menuDistributionRef} href="/features/distribution">
                Distribution
              </Link>
              <tspan dx={10}>
                <Link ref={menuAnalyticsRef} href="/features/analytics">
                  Analytics
                </Link>
              </tspan>
              <tspan dx={10}>
                <Link ref={menuMonetizationRef} href="/features/monetization">
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
