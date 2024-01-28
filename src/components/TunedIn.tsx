import * as React from 'react';
import {Body4, Caption, H2, Subhead, Link as ProseLink} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {AspectRatioBox} from './AspectRatioBox';
import {SecondaryButton} from './SecondaryButton';
import {PrimaryButton} from './PrimaryButton';
import Link from 'next/link';
import {Codec, MimeType, NoncriticalVideo} from './NoncriticalVideo';
import {useIntersectionProgress} from '@/hooks/useIntersectionProgress';
import {useDarkSection} from '@/hooks/useDarkSection';

const VIDEO_WIDTH = 1060;
const VIDEO_HEIGHT = 1440;

const PANELS = {
  left: {
    color: 'var(--color-orchid)',
    heading: <>You are just getting started</>,
    url: '/learn/podcasting-for-beginners',
    image: '/images/art/user-beginner.png',
    videos: [
      {
        // Smallest
        src: '/videos/user-beginner.vp9.webm',
        mimeType: MimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-beginner.vp9.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.VP9,
      },
      {
        // Necessary for iOS playback
        src: '/videos/user-beginner.hevc.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-beginner.av1.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.AV1,
      },
    ],
    sizes: [
      [265, 400],
      [530, 708.26],
    ],
  },
  middle: {
    color: 'var(--color-lime)',
    heading: <>You need advanced tools</>,
    url: '/learn/podcasting-for-power-users',
    image: '/images/art/user-advanced.png',
    videos: [
      {
        src: '/videos/user-advanced.vp9.webm',
        mimeType: MimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-advanced.vp9.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-advanced.hevc.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-advanced.av1.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.AV1,
      },
    ],
    sizes: [
      [265, 400],
      [530, 638.54],
    ],
  },
  right: {
    color: 'var(--color-sky)',
    heading: <>You are an organization</>,
    url: '/learn/corporate-podcasting',
    image: '/images/art/user-organizations.png',
    videos: [
      {
        src: '/videos/user-organizations.vp9.webm',
        mimeType: MimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-organizations.vp9.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-organizations.hevc.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-organizations.av1.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.AV1,
      },
    ],
    sizes: [
      [265, 400],
      [530, 708.26],
    ],
  },
};

const scaleNumber = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
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

type DialProps = {};

const Dial = React.forwardRef<SVGGElement, DialProps>(function Dial(_, ref) {
  const css = useCSS();
  return (
    <svg
      width={288}
      height={214}
      viewBox="0 0 288 214"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={css({
        display: 'block',
      })}
    >
      <g clipPath="url(#tuned-in-clip-path-1)">
        <g clipPath="url(#tuned-in-clip-path-2)">
          <path
            d="M1 70c0 78.977 64.023 143 143 143s143-64.023 143-143"
            stroke="var(--color-white)"
          />
          <ellipse
            cx={144}
            cy={70}
            rx={70}
            ry={70}
            transform="rotate(-180 144 70)"
            fill="var(--color-white)"
          />
          <ellipse
            cx={144}
            cy={70}
            rx={65}
            ry={65}
            transform="rotate(-180 144 70)"
            fill="var(--color-white)"
            stroke="var(--color-space)"
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
            ref={ref}
            style={{
              // Rotate the dial's hand from the center of the dial.
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
              fill="var(--color-white)"
            />
            <circle cx={182} cy={103} r={6} fill="var(--color-space)" />
            <ellipse
              cx={144}
              cy={70}
              rx={65}
              ry={65}
              transform="rotate(-180 144 70)"
              fill="var(--color-white)"
              stroke="var(--color-space)"
            />
            <circle cx={95} cy={71} r={6} fill="var(--color-space)" />
          </g>
        </g>
      </g>
      <defs>
        <clipPath id="tuned-in-clip-path-1">
          <path fill="var(--color-white)" d="M0 0H288V214H0z" />
        </clipPath>
        <clipPath id="tuned-in-clip-path-2">
          <path fill="var(--color-white)" d="M0 0H288V214H0z" />
        </clipPath>
      </defs>
    </svg>
  );
});

const Panel = ({
  isActive,
  position,
}: {
  isActive: boolean;
  position: 'left' | 'middle' | 'right';
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
        [MIN_TABLET_MEDIA_QUERY]: {
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

          [MIN_TABLET_MEDIA_QUERY]: {
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
          {isActive && (
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
          )}
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
            [MIN_TABLET_MEDIA_QUERY]: {
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
          [MIN_TABLET_MEDIA_QUERY]: {
            paddingTop: '140px',
          },
        })}
      >
        <div
          className={css({
            textAlign: 'center',
            padding: '264px 0 123px',
            [MIN_TABLET_MEDIA_QUERY]: {
              padding: '260px 0 216px',
            },
          })}
        >
          <div
            className={css({
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
              padding: '0 20px',
              position: 'relative',
              width: '100%',
              [MIN_TABLET_MEDIA_QUERY]: {
                gap: '20px',
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
                [MIN_TABLET_MEDIA_QUERY]: {
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
                  [MIN_TABLET_MEDIA_QUERY]: {
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
              gap: '10px',
              flexDirection: 'column',
              marginBottom: '16px',
              [MIN_TABLET_MEDIA_QUERY]: {
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
  const [hasLeft, setHasLeft] = React.useState<boolean>(false);
  const [aboveZero, setAboveZero] = React.useState<boolean>(false);
  const [leftActive, setLeftActive] = React.useState<boolean>(false);
  const [middleActive, setMiddleActive] = React.useState<boolean>(false);
  const [rightActive, setRightActive] = React.useState<boolean>(false);

  const progressRef = React.useRef<HTMLDivElement>(null);

  const dialRef = React.useRef<SVGGElement>(null);

  const sectionRef = React.useRef<HTMLDivElement>(null);
  useDarkSection(sectionRef);

  useIntersectionProgress(progressRef, {
    onEnter: React.useCallback(() => {
      setHasLeft(false);
    }, []),
    onLeave: React.useCallback(() => {
      setHasLeft(true);
    }, []),
    onProgress: React.useCallback(
      (target: HTMLElement, scrollProgress: number) => {
        const showDial = !hasLeft && scrollProgress > SCROLL_PERCENTAGE_TO_SHOW_DIAL;
        setAboveZero(showDial);

        const proportionalProgress = scaleDial(scrollProgress);
        const degree = showDial ? scaleDialAngle(proportionalProgress) : 0;

        dialRef.current!.style.transform = `rotate(${degree}deg)`;

        setRightActive(degree <= -135);
        setMiddleActive(degree <= -90);
        setLeftActive(degree <= -45);
      },
      [hasLeft],
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
          [MIN_TABLET_MEDIA_QUERY]: {
            '--progress-height': '280px',
          },
        })}
      />
      <div
        className={css({
          margin: '0 auto',
          width: '288px',
        })}
      >
        <div
          className={css({
            position: 'absolute',
            top: '-79.5px',
            margin: '0 auto',
            opacity: aboveZero ? 1 : 0,
            pointerEvents: 'none',
            transition: aboveZero
              ? 'opacity 0.2s ease-in-out'
              : 'opacity 0.1s ease-in-out',
            transform: 'scale(0.75)',
            [MIN_TABLET_MEDIA_QUERY]: {
              top: '-70.5px',
              transform: 'unset',
            },
          })}
        >
          <Dial ref={dialRef} />
        </div>
      </div>

      <div
        className={css({
          cursor: 'default',
          paddingTop: '148px',
          [MIN_TABLET_MEDIA_QUERY]: {
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

        <nav
          className={css({
            marginTop: '0',
            marginBottom: '0',
            marginLeft: '0',
            marginRight: '0',
            paddingTop: '40px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            position: 'relative',
            width: '100%',

            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: '10px',
            overflowX: 'scroll',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',

            [MIN_TABLET_MEDIA_QUERY]: {
              display: 'grid',
              gap: '20px',
              height: '100%',
              gridTemplateColumns: 'repeat(3, 1fr)',
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
          <Panel position="left" isActive={leftActive} />
          <Panel position="middle" isActive={middleActive} />
          <Panel position="right" isActive={rightActive} />
        </nav>
      </div>
    </div>
  );
};
