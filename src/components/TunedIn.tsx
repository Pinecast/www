import * as React from 'react';
import {Body4, Caption, H2, Subhead, Link as ProseLink} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {AspectRatioBox} from './AspectRatioBox';
import {HorizontalCarousel} from './HorizontalCarousel';
import {SecondaryButton} from './SecondaryButton';
import {PrimaryButton} from './PrimaryButton';
import Link from 'next/link';
import {
  Codec,
  NoncriticalVideo,
  VideoMimeType,
  VideoSource,
} from './NoncriticalVideo';
import {useIntersectionProgress} from '@/hooks/useIntersectionProgress';
import {useDarkSection} from '@/hooks/useDarkSection';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {PERSONAS} from './CustomerPersona';

const VIDEO_WIDTH = 1060;
const VIDEO_HEIGHT = 1440;

const [PANEL_WIDTH_MOBILE, PANEL_HEIGHT_MOBILE] = [265, 400];

const PANEL_GAP_MOBILE = 10;
const PANEL_GAP_DESKTOP = 20;

enum PanelPosition {
  LEFT = 'left',
  MIDDLE = 'middle',
  RIGHT = 'right',
}

type ResponsiveSizes = [[number, number], [number, number]];

type Panel = {
  position: PanelPosition;
  heading: React.ReactNode;
  color: string;
  url: string;
  image: string;
  videos: VideoSource[];
  sizes: ResponsiveSizes;
};

type PanelItems = {
  [key: string]: Panel;
};

const PANELS: PanelItems = {
  left: {
    position: PanelPosition.LEFT,
    heading: <>You are just getting started</>,
    color: PERSONAS.beginner.color,
    url: PERSONAS.beginner.url,
    image: PERSONAS.beginner.images[1].src,
    videos: [
      {
        // Smallest
        src: '/videos/user-beginner.vp9.webm',
        mimeType: VideoMimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-beginner.vp9.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.VP9,
      },
      {
        // Necessary for iOS playback
        src: '/videos/user-beginner.hevc.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-beginner.av1.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.AV1,
      },
    ],
    sizes: [
      [PANEL_WIDTH_MOBILE, PANEL_HEIGHT_MOBILE],
      [530, 708.26],
    ],
  },
  middle: {
    position: PanelPosition.MIDDLE,
    heading: <>You need advanced tools</>,
    color: PERSONAS.advanced.color,
    url: PERSONAS.advanced.url,
    image: PERSONAS.advanced.images[1].src,
    videos: [
      {
        src: '/videos/user-advanced.vp9.webm',
        mimeType: VideoMimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-advanced.vp9.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-advanced.hevc.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-advanced.av1.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.AV1,
      },
    ],
    sizes: [
      [PANEL_WIDTH_MOBILE, PANEL_HEIGHT_MOBILE],
      [530, 638.54],
    ],
  },
  right: {
    position: PanelPosition.RIGHT,
    heading: <>You are an organization</>,
    color: PERSONAS.organizations.color,
    url: PERSONAS.organizations.url,
    image: PERSONAS.organizations.images[1].src,
    videos: [
      {
        src: '/videos/user-organizations.vp9.webm',
        mimeType: VideoMimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-organizations.vp9.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-organizations.hevc.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-organizations.av1.mp4',
        mimeType: VideoMimeType.MP4,
        codec: Codec.AV1,
      },
    ],
    sizes: [
      [PANEL_WIDTH_MOBILE, PANEL_HEIGHT_MOBILE],
      [530, 708.26],
    ],
  },
};

const NUM_PANELS = Object.keys(PANELS).length;
const MOBILE_PANELS_OVERFLOW_WIDTH =
  NUM_PANELS * 1.25 * PANEL_WIDTH_MOBILE + (NUM_PANELS + 1) * PANEL_GAP_MOBILE;
const WIDE_PANELS_QUERY = `@media (min-width: ${MOBILE_PANELS_OVERFLOW_WIDTH}px)`;

const isDesktop = () =>
  !!window?.matchMedia?.(WIDE_PANELS_QUERY.replace(/^@media/, ''))?.matches;

const scaleNumber = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => {
  // Convert the original range to a [0..1] range.
  const standardValue = (value - x1) / (y1 - x1);
  // Convert the [0..1] range to the new range.
  const mappedValue = standardValue * (y2 - x2) + x2;
  // Clamp the value to be within the bounds of the new range.
  return Math.min(Math.max(mappedValue, x2), y2);
};

const SCROLL_PERCENTAGE_TO_SHOW_DIAL = 0;

const scaleDial = (num: number) =>
  scaleNumber(num, SCROLL_PERCENTAGE_TO_SHOW_DIAL, 1, 0, 1);

const DIAL_INTERVALS = [
  // Scroll progress => angle to which the Dial should be rotated.
  [0, 0],
  [0.25, -45],
  [0.5, -90],
  [0.75, -135],
  [1, -180],
];
const scaleDialAngle = (progress: number) => {
  const intervals = DIAL_INTERVALS.map(x => x[0]);
  let closestIndex = 0;
  let minDifference = Math.abs(progress - intervals[0]);
  for (let idx = 1; idx < intervals.length; idx++) {
    let difference = Math.abs(progress - intervals[idx]);
    if (difference < minDifference) {
      minDifference = difference;
      closestIndex = idx;
    }
  }
  return DIAL_INTERVALS[closestIndex][1];
};

type DialRef = {
  rotateMobile(degrees: number): void;
  rotateDesktop(degrees: number): void;
};
type DialProps = {};

const Dial = React.memo(
  React.forwardRef<DialRef, DialProps>(function Dial(_, ref) {
    const css = useCSS();
    const mobileRef = React.useRef<SVGGElement>(null);
    const desktopRef = React.useRef<SVGGElement>(null);
    React.useImperativeHandle(ref, () => ({
      rotateMobile: (degrees: number) => {
        mobileRef.current!.style.transform = `rotate(${degrees}deg)`;
      },
      rotateDesktop: (degrees: number) => {
        desktopRef.current!.style.transform = `rotate(${degrees}deg)`;
      },
    }));
    return (
      <>
        <svg
          width={144}
          height={108}
          viewBox="0 0 144 108"
          fill="none"
          className={css({
            display: 'block',
            marginTop: '-1.5px',
            paddingTop: '1.5px',
            [WIDE_PANELS_QUERY]: {
              display: 'none',
            },
          })}
        >
          <path
            d="M.5 35.5C.5 74.988 32.512 107 72 107s71.5-32.012 71.5-71.5"
            stroke="var(--color-sand)"
            strokeWidth={1.5}
          />
          <g opacity={0.6} stroke="var(--color-white)">
            <path d="M72.5 72.7461L72.5 76.7461" />
            <path d="M45.335 61.0996L41.4459 64.9887" />
            <path d="M57.4435 69.4171L56.0754 73.1759" />
            <path
              transform="matrix(.34202 .9397 .9397 -.34202 87.087 69.246)"
              d="M0 -0.5L4 -0.5"
            />
            <path d="M37.4298 48.7198L33.671 50.0879" />
            <path
              transform="matrix(.9397 .34202 .34202 -.9397 106.731 48.25)"
              d="M0 -0.5L4 -0.5"
            />
            <path
              transform="scale(1 -1) rotate(-45 -22.928 -150.34)"
              d="M0 -0.5L4 -0.5"
            />
          </g>
          <g
            ref={mobileRef}
            style={{
              // Rotate the hand from the center of the dial.
              transformOrigin: '72px 35px',
              // Slight transition to smoothly rotate the dial's hand on scroll.
              transition: 'all 0.2s linear',
            }}
          >
            <path stroke="var(--color-sand)" d="M70 35L0 35" />
            <ellipse
              cx={72}
              cy={35.5}
              rx={35}
              ry={35}
              transform="rotate(-180 72 35.5)"
              fill="var(--color-sand)"
            />
            <ellipse
              cx={72}
              cy={35.75}
              rx={32.5}
              ry={32.5}
              transform="rotate(-180 72 35.75)"
              fill="var(--color-sand)"
              stroke="var(--color-space)"
            />
            <circle cx={45.5} cy={35.25} r={3} fill="var(--color-space)" />
          </g>
        </svg>
        <svg
          width={288}
          height={214}
          viewBox="0 0 288 214"
          fill="none"
          className={css({
            display: 'none',
            [WIDE_PANELS_QUERY]: {
              display: 'block',
            },
          })}
        >
          <path
            d="M1 70c0 78.977 64.023 143 143 143s143-64.023 143-143"
            stroke="var(--color-sand)"
            strokeWidth={1.5}
          />
          <g opacity={0.6} stroke="var(--color-white)">
            <path d="M143.5 144L143.5 152" />
            <path d="M89.3164 120.354L81.5383 128.132" />
            <path d="M113.417 137.171L110.681 144.689" />
            <path
              transform="scale(1 -1) rotate(-70 -11.241 -192.159)"
              d="M0 -0.5L8 -0.5"
            />
            <path d="M73.6886 95.4777L66.171 98.2138" />
            <path
              transform="scale(1 -1) rotate(-20 -163.177 -649.973)"
              d="M0 -0.5L8 -0.5"
            />
            <path
              transform="scale(1 -1) rotate(-45 -44.555 -298.727)"
              d="M0 -0.5L8 -0.5"
            />
          </g>
          <g
            ref={desktopRef}
            style={{
              // Rotate the hand from the center of the dial.
              transformOrigin: '144px 70px',
              // Slight transition to smoothly rotate the dial's hand on scroll.
              transition: 'all 0.2s linear',
            }}
          >
            <path d="M143 70H.5" stroke="var(--color-sand)" />
            <ellipse
              cx={144}
              cy={70}
              rx={70}
              ry={70}
              transform="rotate(-180 144 70)"
              fill="var(--color-sand)"
            />
            <ellipse
              cx={144}
              cy={70}
              rx={65}
              ry={65}
              transform="rotate(-180 144 70)"
              fill="var(--color-sand)"
              stroke="var(--color-space)"
            />
            <circle cx={95} cy={71} r={6} fill="var(--color-space)" />
          </g>
        </svg>
      </>
    );
  }),
);

const Panel = ({
  isActive,
  position,
}: {
  isActive: boolean;
  position: PanelPosition;
}) => {
  const css = useCSS();

  const panel = PANELS[position];

  const {
    color: activeColor,
    heading,
    sizes: [[smallWidth, smallHeight], [largeWidth, largeHeight]],
  } = panel;

  return (
    <AspectRatioBox
      style={{
        // Use fixed dimensions for mobile carousel swiper.
        '--aspect-ratio': '0',
        flex: `1 0 ${smallWidth}px`,
        height: `${smallHeight}px`,

        // Enforce aspect ratio at tablet or larger for curved three columns.
        [WIDE_PANELS_QUERY]: {
          '--aspect-ratio': `${largeHeight} / ${largeWidth}`,
          flex: 'unset',
          width: '100%',
          height: 0,
        },
      }}
    >
      <Link
        href={panel.url}
        className={css({
          '--panel-border-width': '1px',
          '--panel-border-color': isActive
            ? 'var(--color-space)'
            : 'var(--color-white)',
          border: '1px solid var(--panel-border-color)',
          borderRadius: '10px',
          color: 'inherit',
          display: 'block',
          height: `${smallHeight}px`,
          position: 'relative',
          textDecoration: 'none',
          zIndex: 2,

          '::after': {
            backgroundColor: `${panel.color}`,
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            borderRadius: 'inherit',
            bottom: '0',
            content: '""',
            left: '0',
            opacity: isActive ? 1 : 0,
            position: 'absolute',
            right: '0',
            transition: 'opacity 0.3s ease-in-out',
            top: '0',
          },

          [WIDE_PANELS_QUERY]: {
            backgroundColor: 'var(--panel-border-color)',
            border: 'unset',
            borderRadius: 'unset',
            clipPath: `url(#clip-${position})`,
            height: '100%',
            width: '100%',

            '::before': {
              // Pleasant trick for painting an outline with clip-path.
              // Since CSS borders are painted *before* an element is cut to match
              // the clip-path, emulate a border by layering a smaller copy of the
              // clip-path filled with the page bg color.
              backgroundColor: 'var(--color-space)',
              borderRadius: 'unset',
              bottom: 'var(--panel-border-width)',
              clipPath: 'inherit',
              content: '""',
              left: 'var(--panel-border-width)',
              position: 'absolute',
              right: 'var(--panel-border-width)',
              top: 'var(--panel-border-width)',
            },
          },
        })}
      >
        <div
          className={css({
            // Load the video conditionally once the panel's scroll threshold is reached.
            // This wrapper allows the video to fade in so the entrance feels smoother.
            backgroundColor: `${panel.color}`,
            borderRadius: 'inherit',
            bottom: 0,
            left: 0,
            opacity: isActive ? 1 : 0,
            position: 'absolute',
            right: 0,
            top: 0,
            transition: isActive
              ? 'opacity 0.3s ease-in-out'
              : 'opacity 0.1s ease-in-out',
            zIndex: 2,
          })}
        >
          <NoncriticalVideo
            sources={panel.videos}
            height={VIDEO_HEIGHT}
            width={VIDEO_WIDTH}
            poster={panel.image}
            style={{
              backgroundColor: `${panel.color}`,
              borderRadius: 'inherit',
              height: '100%',
              left: 0,
              objectFit: 'cover',
              position: 'absolute',
              right: 0,
              top: 0,
              width: '100%',
              zIndex: 2,
            }}
          />
        </div>
        <div
          className={css({
            alignItems: 'flex-end',
            color: isActive ? 'var(--color-space)' : 'var(--color-sand)',
            display: 'flex',
            height: '100%',
            padding: '10px',
            width: '100%',
            position: 'relative',
            zIndex: 2,
            transition: 'color 0.3s ease-in-out',
            [WIDE_PANELS_QUERY]: {
              padding: '20px',
            },
          })}
        >
          <header
            className={css({
              backgroundColor: isActive ? activeColor : 'transparent',
              borderRadius: '10px',
              borderStyle: 'solid',
              borderWidth: '1px',
              padding: '20px',
              transition: 'background-color 0.3s ease-in-out',
              width: '100%',
              [WIDE_PANELS_QUERY]: {
                minHeight: '120px',
              },
              [MIN_TABLET_MEDIA_QUERY]: {
                minHeight: '160px',
              },
            })}
          >
            <Subhead style={{marginBottom: '16px', maxWidth: '16ch'}}>
              {heading}
            </Subhead>
            <ProseLink
              style={{
                color: 'inherit',
                marginTop: '-8px',
                marginBottom: '-8px',
                paddingTop: '8px',
                paddingBottom: '8px',
              }}
            >
              Learn more
            </ProseLink>
          </header>
        </div>
      </Link>
    </AspectRatioBox>
  );
};

export const TunedInHeader = ({zIndex = 0}: {zIndex?: number}) => {
  const css = useCSS();

  const sectionRef = React.useRef<HTMLElement>(null);
  useDarkSection(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="tuned-in"
      className={css({
        color: 'var(--color-white)',
        cursor: 'default',
        position: 'relative',
        transform: 'translate3d(0,0,0)',
        zIndex,
      })}
    >
      <div
        className={css({
          position: 'relative',
          overflow: 'hidden',
          [WIDE_PANELS_QUERY]: {
            paddingTop: '140px',
          },
        })}
      >
        <div
          className={css({
            textAlign: 'center',
            padding: '264px 0 123px',
            [WIDE_PANELS_QUERY]: {
              padding: '260px 0 216px',
            },
          })}
        >
          <div
            className={css({
              display: 'grid',
              gap: `${PANEL_GAP_MOBILE}px`,
              gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
              padding: '0 20px',
              position: 'relative',
              width: '100%',
              [WIDE_PANELS_QUERY]: {
                gap: `${PANEL_GAP_DESKTOP}px`,
                marginBottom: '-6px',
              },
            })}
          >
            <div
              className={css({
                gridColumnStart: '3',
                gridColumnEnd: '-3',
                position: 'relative',
                zIndex: 4,
                [WIDE_PANELS_QUERY]: {
                  gridColumnStart: '5',
                  gridColumnEnd: '9',
                  margin: '0 -20px',
                },
              })}
            >
              <H2
                style={{
                  textWrap: 'balance',
                  marginBottom: '30px',
                }}
              >
                Tuned-in to your needs
              </H2>
              <Body4
                style={{
                  marginTop: '-10px',
                  marginRight: 'auto',
                  marginBottom: '30px',
                  marginLeft: 'auto',
                  maxWidth: '32ch',
                  [WIDE_PANELS_QUERY]: {
                    maxWidth: '36ch',
                  },
                }}
              >
                Whether you&rsquo;re starting out or you are more established we
                have a solution for you.
              </Body4>
            </div>
          </div>
          <div
            className={css({
              display: 'inline-grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: `${PANEL_GAP_MOBILE}px`,
              flexDirection: 'column',
              marginBottom: '16px',
              [WIDE_PANELS_QUERY]: {
                marginBottom: '30px',
              },
            })}
          >
            <PrimaryButton
              href="https://pinecast.com/signup"
              style={{
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-space)',
                display: 'grid',
                lineHeight: '1.2',
                maxWidth: '230px',
                minHeight: '48px',
                placeContent: 'center',
                position: 'relative',
                zIndex,
              }}
            >
              Start for free
            </PrimaryButton>
            <SecondaryButton
              href="/features"
              style={{
                backgroundColor: 'var(--color-space)',
                color: 'var(--color-white)',
                display: 'grid',
                lineHeight: '1.2',
                maxWidth: '230px',
                minHeight: '48px',
                placeContent: 'center',
                position: 'relative',
                zIndex,
              }}
            >
              Discover Features
            </SecondaryButton>
          </div>
          <Caption
            style={{
              color: 'var(--color-core-accent)',
              margin: '0 auto',
              maxWidth: '230px',
              position: 'relative',
              zIndex,
            }}
          >
            No credit card required
          </Caption>
        </div>
      </div>
    </section>
  );
};

export const TunedInPanels = () => {
  const css = useCSS();

  // const [hasLeft, setHasLeft] = React.useState<boolean>(false);
  const [aboveZero, setAboveZero] = React.useState<boolean>(false);

  const [leftActiveMobile, setLeftActiveMobile] =
    React.useState<boolean>(false);
  const [middleActiveMobile, setMiddleActiveMobile] =
    React.useState<boolean>(false);
  const [rightActiveMobile, setRightActiveMobile] =
    React.useState<boolean>(false);

  const [leftActiveDesktop, setLeftActiveDesktop] =
    React.useState<boolean>(false);
  const [middleActiveDesktop, setMiddleActiveDesktop] =
    React.useState<boolean>(false);
  const [rightActiveDesktop, setRightActiveDesktop] =
    React.useState<boolean>(false);

  const mobilePanels = [
    {...PANELS.left, isActive: leftActiveMobile},
    {...PANELS.middle, isActive: middleActiveMobile},
    {...PANELS.right, isActive: rightActiveMobile},
  ];

  const progressRef = React.useRef<HTMLDivElement>(null);

  const dialRef = React.useRef<DialRef>(null);

  const sectionRef = React.useRef<HTMLDivElement>(null);
  useDarkSection(sectionRef);

  useIntersectionProgress(progressRef, {
    // onEnter: React.useCallback(() => {
    //   setHasLeft(false);
    // }, []),
    // onLeave: React.useCallback(() => {
    //   setHasLeft(true);
    // }, []),
    onProgress: React.useCallback(
      (target: HTMLElement, scrollProgress: number) => {
        // const showDial = !hasLeft && scrollProgress > SCROLL_PERCENTAGE_TO_SHOW_DIAL;
        const showDial = scrollProgress > SCROLL_PERCENTAGE_TO_SHOW_DIAL;
        setAboveZero(showDial);

        if (!isDesktop()) {
          // Let mobile carousel swiper control the dial rotation and panel active states.
          return;
        }

        const proportionalProgress = scaleDial(scrollProgress);
        const degree = showDial ? scaleDialAngle(proportionalProgress) : 0;

        dialRef.current!.rotateDesktop?.(degree);

        setRightActiveDesktop(degree <= -135);
        setMiddleActiveDesktop(degree <= -90);
        setLeftActiveDesktop(degree <= -45);
      },
      [],
    ),
  });

  return (
    <div
      ref={sectionRef}
      className={css({
        backgroundColor: 'var(--color-space)',
        position: 'relative',
        zIndex: 2,
      })}
    >
      <div
        ref={progressRef}
        className={css({
          '--progress-height': '210px',
          height: 'var(--progress-height)',
          marginBottom: 'calc(-1 * var(--progress-height))',
          [WIDE_PANELS_QUERY]: {
            '--progress-height': '280px',
          },
        })}
      />
      <div
        className={css({
          margin: '0 auto',
          width: '144px',
          [WIDE_PANELS_QUERY]: {
            width: '288px',
          },
        })}
      >
        <div
          className={css({
            margin: '0 auto',
            opacity: aboveZero ? 1 : 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: '-35.25px',
            transition: aboveZero
              ? 'opacity 0.2s ease-in-out'
              : 'opacity 0.1s ease-in-out',
            [WIDE_PANELS_QUERY]: {
              top: '-70.75px',
            },
          })}
        >
          <Dial ref={dialRef} />
        </div>
      </div>

      <div
        className={css({
          cursor: 'default',
          paddingTop: '112px',
          [WIDE_PANELS_QUERY]: {
            // Space from the top of the middle panel
            paddingTop: '136px',
            paddingRight: '20px',
            paddingLeft: '20px',
          },
        })}
      >
        <svg
          className={css({
            position: 'absolute',
            width: 0,
            height: 0,
          })}
        >
          <defs>
            <clipPath id="clip-left" clipPathUnits="objectBoundingBox">
              <path d="M0.963,1 H0.037 C0.017,1,0,0.99,0,0.975 V0.031 C0,0.013,0.021,0,0.044,0.003 C0.319,0.044,0.63,0.074,0.965,0.091 C0.985,0.092,1,0.104,1,0.118 V0.975 C1,0.99,0.983,1,0.963,1" />
            </clipPath>
            <clipPath id="clip-middle" clipPathUnits="objectBoundingBox">
              <path d="M0,0.97 V0.032 C0,0.014,0.018,0,0.039,0.001 C0.189,0.007,0.343,0.01,0.5,0.01 C0.657,0.01,0.811,0.007,0.961,0.001 C0.982,0,1,0.014,1,0.032 V0.97 C1,0.987,0.983,1,0.963,1 H0.037 C0.017,1,0,0.987,0,0.97" />
            </clipPath>
            <clipPath id="clip-right" clipPathUnits="objectBoundingBox">
              <path d="M0.037,1 H0.963 C0.983,1,1,0.99,1,0.975 V0.031 C1,0.013,0.979,0,0.956,0.003 C0.681,0.044,0.37,0.074,0.035,0.091 C0.015,0.092,0,0.104,0,0.118 V0.975 C0,0.99,0.017,1,0.037,1" />
            </clipPath>
            <clipPath
              id="clip-section-divider"
              clipPathUnits="objectBoundingBox"
            >
              <path d="M0.301,0.132 C0.577,0.132,0.801,-0.092,0.801,-0.368 C0.801,-0.644,0.577,-0.868,0.301,-0.868 C0.025,-0.868,-0.199,-0.644,-0.199,-0.368 C-0.199,-0.092,0.025,0.132,0.301,0.132" />
            </clipPath>
          </defs>
        </svg>

        <div
          className={css({
            display: 'block',
            [WIDE_PANELS_QUERY]: {
              display: 'none',
            },
          })}
        >
          <HorizontalCarousel
            width={PANEL_WIDTH_MOBILE}
            height={PANEL_HEIGHT_MOBILE}
            items={mobilePanels}
            renderItem={item => (
              <Panel
                key={item.url}
                position={item.position}
                isActive={item.isActive}
              />
            )}
            onChange={(currentPanelIndex: number) => {
              if (isDesktop()) {
                // On desktop, leave the dial rotation & active panel state to be
                // controlled by the larger nav below based on vertical scroll progress.
                return;
              }

              // setAboveZero(currentPanelIndex > -1);

              const intervals = [
                DIAL_INTERVALS[1],
                DIAL_INTERVALS[2],
                DIAL_INTERVALS[3],
              ].map(x => x[0]);

              const progress = intervals[currentPanelIndex];

              const proportionalProgress = scaleDial(progress);
              const degree = scaleDialAngle(proportionalProgress);

              dialRef.current!.rotateMobile?.(degree);

              setRightActiveMobile(degree <= -135);
              setMiddleActiveMobile(degree <= -90);
              setLeftActiveMobile(degree <= -45);
            }}
          />
        </div>

        <nav
          className={css({
            display: 'none',
            [WIDE_PANELS_QUERY]: {
              display: 'grid',
              gap: `${PANEL_GAP_DESKTOP}px`,
              height: '100%',
              gridTemplateColumns: 'repeat(3, 1fr)',
              marginTop: '0',
              marginBottom: '0',
              marginLeft: '0',
              marginRight: '0',
              position: 'relative',
              overflowX: 'unset',
              overflowY: 'unset',
              paddingTop: '6vh',
              paddingBottom: '0',
              paddingLeft: '0',
              paddingRight: '0',
              placeItems: 'end',
              width: '100%',
            },
          })}
        >
          <Panel position={PanelPosition.LEFT} isActive={leftActiveDesktop} />
          <Panel
            position={PanelPosition.MIDDLE}
            isActive={middleActiveDesktop}
          />
          <Panel position={PanelPosition.RIGHT} isActive={rightActiveDesktop} />
        </nav>
      </div>
    </div>
  );
};
