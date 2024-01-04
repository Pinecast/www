import * as React from 'react';
import {Body4, Caption, H2, Subhead, Link as ProseLink} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {MIN_TABLET_MEDIA_QUERY, MOBILE_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {useDarkSection} from '@/hooks/useDarkSection';
import {PrimaryButton} from './PrimaryButton';
import {useScrollProgressEffect} from '@/hooks/useScrollProgress';
import {StickyLine} from './StickyLine';
import {useVisibleElements} from '@/hooks/useVisibleElements';
import Link from 'next/link';

const PANELS = {
  left: {
    color: 'var(--color-orchid)',
    heading: <>You are just getting started</>,
    url: '/learn/podcasting-for-beginners',
    image: '/images/art/user-beginner.png',
  },
  middle: {
    color: 'var(--color-lime)',
    heading: <>You need advanced tools</>,
    url: '/learn/podcasting-for-power-users',
    image: '/images/art/user-advanced.png',
  },
  right: {
    color: 'var(--color-sky)',
    heading: <>You are an organization</>,
    url: '/learn/corporate-podcasting',
    image: '/images/art/user-organizations.png',
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

const SCROLL_PERCENTAGE_TO_SHOW_DIAL = 0.117;

const scaleDial = (num: number) =>
  scaleNumber(num, SCROLL_PERCENTAGE_TO_SHOW_DIAL, 1, 0, 1);

const scaleDialAngle = (num: number) => scaleNumber(num, 0, 1, 0, 180);

type DialProps = {};

const Dial = React.forwardRef<SVGGElement, DialProps>(function Dial(_, ref) {
  return (
    <svg
      width={288}
      height={214}
      viewBox="0 0 288 214"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
              transition: 'all 0.025s linear',
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

// When the user scrolls down, a thin white line appears.
// If the user scrolls back up, the `position: sticky` line will
// sit at the very top of this section behind the dark black
// background but it will appear hidden by blending into the
// bg color of the previous section.
const STICKY_LINE_COLOR = 'var(--page-bg, var(--color-white))';

const Panel = ({
  isActive,
  position,
}: {
  isActive: boolean;
  position: 'left' | 'middle' | 'right';
}) => {
  const css = useCSS();

  const panel = PANELS[position];

  const {color: activeColor, heading} = panel;

  return (
    <>
      <Link
        href={panel.url}
        className={css({
          position: 'relative',
          [MOBILE_MEDIA_QUERY]: {
            width: '265px',
            flex: '0 0 265px',
          },
          '::before': {
            content: '""',
            display: 'block',
            paddingTop: '125.5%',
          },
        })}
      >
        <div
          className={css({
            position: 'relative',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
          })}
        >
          <div
            className={css({
              alignItems: 'flex-end',
              bottom: '0',
              color: isActive ? 'var(--color-space)' : 'var(--color-sand)',
              display: 'flex',
              left: '0',
              padding: '20px',
              position: 'absolute',
              right: '0',
              top: '0',
            })}
          >
            <header
              className={css({
                backgroundColor: isActive ? activeColor : 'transparent',
                borderRadius: '10px',
                borderStyle: 'solid',
                borderWidth: '1px',
                padding: '20px',
                transition: 'background-color 0.2s ease-in-out',
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
        </div>
      </Link>
    </>
  );
};

export const TunedIn = () => {
  const css = useCSS();

  const sectionRef = React.useRef<HTMLElement>(null);
  useDarkSection(sectionRef);

  const [aboveZero, setAboveZero] = React.useState<boolean>(false);
  const [leftActive, setLeftActive] = React.useState<boolean>(false);
  const [middleActive, setMiddleActive] = React.useState<boolean>(false);
  const [rightActive, setRightActive] = React.useState<boolean>(false);

  const bottomRef = React.useRef<HTMLDivElement>(null);
  useDarkSection(bottomRef);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const dialRef = React.useRef<SVGGElement>(null);
  useScrollProgressEffect(
    scrollerRef,
    React.useCallback((scrollProgress: number) => {
      setAboveZero(scrollProgress > 0);
      const proportionalProgress = scaleDial(scrollProgress);
      if (proportionalProgress >= 0.11 * 6) {
        setRightActive(true);
      }
      if (proportionalProgress >= 0.11 * 4) {
        setMiddleActive(true);
      }
      if (proportionalProgress >= 0.11 * 2) {
        setLeftActive(true);
      } else {
        // Reset when scrolling back up
        setRightActive(false);
        setMiddleActive(false);
        setLeftActive(false);
      }
      dialRef.current!.style.transform = `rotate(${
        -1 * scaleDialAngle(scaleDial(scrollProgress))
      }deg)`;
    }, []),
  );

  const stickyLineRefs = React.useRef<Element[]>([]);
  const addStickyLineRef = (el: Element | null) => {
    if (el) {
      stickyLineRefs.current[0] = el;
    }
  };
  const [visibleStickyElement] = useVisibleElements(stickyLineRefs, {
    // Observe where StickyLine becomes stuck from `position: sticky` upon scrolling down,
    // when the section for the three panels intersects at the middle of viewport.
    rootMargin: '-50% 0% -50% 0%',
  });

  return (
    <>
      <section
        ref={sectionRef}
        id="tuned-in"
        className={css({
          backgroundColor: 'var(--color-space)',
          color: 'var(--color-white)',
          cursor: 'default',
          position: 'relative',
          transform: 'translate3d(0,0,0)',
          zIndex: 1,
        })}
      >
        <div
          className={css({
            paddingBottom: '286px',
            position: 'relative',
            transform: 'translate3d(0,0,0)',
            zIndex: 2,
          })}
        >
          <StickyLine
            ref={addStickyLineRef}
            color={STICKY_LINE_COLOR}
            size={1}
            zIndex={3}
          />
          <div
            className={css({
              textAlign: 'center',
              padding: '264px 0 240px',
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
                marginBottom: '86px',
                padding: '0 20px',
                position: 'relative',
                width: '100%',
                zIndex: 2,
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
                    backgroundColor: 'var(--color-space)',
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
                  Whether you&rsquo;re starting out or you are more established
                  we have a solution for you.
                </Body4>
              </div>
            </div>
            <div
              className={css({
                display: 'inline-grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                flexDirection: 'column',
                marginBottom: '30px',
                [MOBILE_MEDIA_QUERY]: {
                  marginBottom: '16px',
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
                  zIndex: 3,
                  transform: 'translate3d(0,0,0)',
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
                  zIndex: 3,
                  transform: 'translate3d(0,0,0)',
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
                zIndex: 3,
                transform: 'translate3d(0,0,0)',
              }}
            >
              No credit card required
            </Caption>
          </div>
        </div>
      </section>

      <div ref={bottomRef}>
        <div
          className={css({
            position: 'relative',
            zIndex: 1,
            width: '288px',
            margin: '0 auto',
            display: 'grid',
            placeItems: 'end',
          })}
        >
          <div
            className={css({
              position: 'absolute',
              top: '-356.35px',
              zIndex: 2,
              margin: '0 auto',
              opacity: aboveZero && !visibleStickyElement ? 1 : 0,
              pointerEvents: 'none',
              transition:
                aboveZero && !visibleStickyElement
                  ? 'opacity 0.2s ease-in-out'
                  : 'opacity 0.1s ease-in-out',
            })}
          >
            <Dial ref={dialRef} />
          </div>
        </div>

        <div
          ref={scrollerRef}
          className={css({
            backgroundColor: 'var(--color-space)',
            color: 'var(--color-white)',
            cursor: 'default',
            position: 'relative',
            zIndex: 2,
          })}
        >
          {/* spacer */}
          <div
            className={css({
              paddingBottom: '300px',
              marginBottom: '-380px',
            })}
          ></div>
          <nav
            className={css({
              marginTop: '0',
              marginBottom: '0',
              marginLeft: '0',
              marginRight: '0',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '40px',
              position: 'relative',
              zIndex: 3,
              width: '100%',

              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              overflowX: 'scroll',

              [MIN_TABLET_MEDIA_QUERY]: {
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'repeat(3, 1fr)',
                overflowX: 'unset',
                position: 'absolute',
                top: '0',
              },
            })}
          >
            <Panel position="left" isActive={leftActive} />
            <Panel position="middle" isActive={middleActive} />
            <Panel position="right" isActive={rightActive} />
          </nav>
          <svg
            fill="none"
            viewBox="0 3 1630 709"
            xmlns="http://www.w3.org/2000/svg"
            className={css({
              display: 'block',
              marginLeft: '20px',
              marginRight: '20px',
              paddingTop: '120px',
            })}
          >
            {/* left - filled */}
            <g
              style={{
                opacity: leftActive ? 1 : 0,
              }}
            >
              <mask
                id="tuned-in-panels-mask-left-filled"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={0}
                y={3}
                width={530}
                height={705}
              >
                <path
                  d="M0 687.26c0 11.046 8.954 20 20 20h490c11.046 0 20-8.954 20-20V85.088c0-10.565-8.219-19.303-18.761-20C333.853 53.373 169.164 32.302 24.022 3.819 11.6 1.38 0 10.855 0 23.515V687.26z"
                  fill="#fff"
                />
              </mask>
              <g mask="url(#tuned-in-panels-mask-left-filled)">
                <path
                  d="M0-1h530v668.26c0 18.856 0 28.284-5.858 34.142-5.858 5.858-15.286 5.858-34.142 5.858H40c-18.856 0-28.284 0-34.142-5.858C0 695.544 0 686.116 0 667.26V-1z"
                  fill="url(#tuned-in-panels-pattern-beginner)"
                  style={{
                    opacity: leftActive ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                />
              </g>
            </g>
            {/* left - default */}
            <g
              style={{
                opacity: leftActive ? 0 : 1,
              }}
            >
              <mask
                id="tuned-in-panels-mask-left-skeleton"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={0}
                y={-1}
                width={530}
                height={709}
              >
                <path
                  d="M0 707.26h530V66.29C335.55 54.23 155.92 30.96 0-1v708.26z"
                  fill="#fff"
                />
              </mask>
              <g mask="url(#tuned-in-panels-mask-left-skeleton)">
                <mask id="tuned-in-panels-mask-left-skeleton-shape" fill="#fff">
                  <path d="M0 687.26c0 11.046 8.954 20 20 20h490c11.046 0 20-8.954 20-20V85.088c0-10.565-8.219-19.303-18.761-20C333.853 53.373 169.164 32.302 24.022 3.819 11.6 1.38 0 10.855 0 23.515V687.26z" />
                </mask>
                <path
                  d="M0 687.26c0 11.046 8.954 20 20 20h490c11.046 0 20-8.954 20-20V85.088c0-10.565-8.219-19.303-18.761-20C333.853 53.373 169.164 32.302 24.022 3.819 11.6 1.38 0 10.855 0 23.515V687.26z"
                  fill="var(--color-space)"
                  stroke="var(--color-sand)"
                  strokeWidth={2}
                  mask="url(#tuned-in-panels-mask-left-skeleton-shape)"
                />
              </g>
            </g>

            {/* middle - filled */}
            <g
              style={{
                opacity: middleActive ? 1 : 0,
              }}
            >
              <mask
                id="tuned-in-panels-mask-middle-filled"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={550}
                y={70}
                width={530}
                height={638}
              >
                <path
                  d="M571.061 70.072C559.612 69.514 550 78.628 550 90.09v597.45c0 11.046 8.954 20 20 20h490c11.05 0 20-8.954 20-20V90.09c0-11.462-9.61-20.576-21.06-20.018-79.27 3.86-160.774 5.868-243.94 5.868s-164.67-2.008-243.939-5.868z"
                  fill="var(--color-lime)"
                />
              </mask>
              <g mask="url(#tuned-in-panels-mask-middle-filled)">
                <path
                  d="M550 69h530v598.54c0 18.856 0 28.284-5.86 34.142-5.86 5.858-15.28 5.858-34.14 5.858H590c-18.856 0-28.284 0-34.142-5.858C550 695.824 550 686.396 550 667.54V69z"
                  fill="url(#tuned-in-panels-pattern-advanced)"
                  style={{
                    opacity: middleActive ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                />
              </g>
            </g>
            {/* middle - default */}
            <g
              style={{
                opacity: middleActive ? 0 : 1,
                border: '1px solid #f00',
                padding: '10000px',
              }}
            >
              <mask
                id="tuned-in-panels-mask-middle-skeleton"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={550}
                y={69}
                width={530}
                height={639}
              >
                <path
                  d="M550 69v638.54h530V69c-85.87 4.56-174.45 6.94-265 6.94-90.55 0-179.13-2.38-265-6.94z"
                  fill="var(--color-lime)"
                />
              </mask>
              <g mask="url(#tuned-in-panels-mask-middle-skeleton)">
                <mask id="tuned-in-panels-mask-middle-skeleton" fill="#fff">
                  <path d="M571.061 70.072C559.612 69.514 550 78.628 550 90.09v597.45c0 11.046 8.954 20 20 20h490c11.05 0 20-8.954 20-20V90.09c0-11.462-9.61-20.576-21.06-20.018-79.27 3.86-160.774 5.868-243.94 5.868s-164.67-2.008-243.939-5.868z" />
                </mask>
                <path
                  d="M571.061 70.072C559.612 69.514 550 78.628 550 90.09v597.45c0 11.046 8.954 20 20 20h490c11.05 0 20-8.954 20-20V90.09c0-11.462-9.61-20.576-21.06-20.018-79.27 3.86-160.774 5.868-243.94 5.868s-164.67-2.008-243.939-5.868z"
                  fill="var(--color-space)"
                  stroke="var(--color-sand)"
                  strokeWidth={2}
                  mask="url(#tuned-in-panels-mask-middle-skeleton-shape)"
                />
              </g>
            </g>
            {/* right - filled */}
            <g
              style={{
                opacity: rightActive ? 1 : 0,
              }}
            >
              <mask
                id="tuned-in-panels-mask-right-filled"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={1100}
                y={3}
                width={530}
                height={705}
              >
                <path
                  d="M1630 687.26c0 11.046-8.95 20-20 20h-490c-11.05 0-20-8.954-20-20V85.088c0-10.565 8.22-19.303 18.76-20 177.39-11.716 342.08-32.787 487.22-61.27C1618.4 1.38 1630 10.855 1630 23.515V687.26z"
                  fill="#fff"
                />
              </mask>
              <g mask="url(#tuned-in-panels-mask-right-filled)">
                <rect
                  x="1100"
                  y="-12"
                  width="532"
                  height="732"
                  fill="url(#tuned-in-panels-pattern-organizations)"
                  style={{
                    opacity: rightActive ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                />
              </g>
            </g>
            {/* right - default */}
            <g
              style={{
                opacity: rightActive ? 0 : 1,
              }}
            >
              <mask id="tuned-in-panels-mask-right-skeleton" fill="#fff">
                <path d="M1630 687.26c0 11.046-8.95 20-20 20h-490c-11.05 0-20-8.954-20-20V85.088c0-10.565 8.22-19.303 18.76-20 177.39-11.716 342.08-32.787 487.22-61.27C1618.4 1.38 1630 10.855 1630 23.515V687.26z" />
              </mask>
              <path
                d="M1630 687.26c0 11.046-8.95 20-20 20h-490c-11.05 0-20-8.954-20-20V85.088c0-10.565 8.22-19.303 18.76-20 177.39-11.716 342.08-32.787 487.22-61.27C1618.4 1.38 1630 10.855 1630 23.515V687.26z"
                fill="var(--color-space)"
                stroke="var(--color-sand)"
                strokeWidth={3}
                mask="url(#tuned-in-panels-mask-right-skeleton)"
              />
              <mask
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={1100}
                y={-39}
                width={530}
                height={707}
              >
                <path
                  d="M1100 667.27c0-.006 0-.01.01-.01H1620c5.52 0 10-4.477 10-10V-28.742c0-6.33-5.8-11.069-12-9.824-150.58 30.2-322.72 52.361-508.61 64.264-5.27.338-9.39 4.709-9.39 9.991V667.27z"
                  fill="var(--color-sky)"
                />
              </mask>
            </g>
            <defs>
              <pattern
                id="tuned-in-panels-pattern-beginner"
                patternContentUnits="objectBoundingBox"
                width={1}
                height={1}
              >
                <use
                  xlinkHref="#tuned-in-panels-img-beginner"
                  transform="matrix(.0004 0 0 .0003 -.013 0)"
                />
              </pattern>
              <pattern
                id="tuned-in-panels-pattern-advanced"
                patternContentUnits="objectBoundingBox"
                width={1}
                height={1}
              >
                <use
                  xlinkHref="#tuned-in-panels-img-advanced"
                  transform="matrix(.00038 0 0 .00032 0 -.04)"
                />
              </pattern>
              <pattern
                id="tuned-in-panels-pattern-organizations"
                patternContentUnits="objectBoundingBox"
                width={1}
                height={1}
              >
                <use
                  xlinkHref="#tuned-in-panels-img-organizations"
                  transform="scale(.00094 .0007)"
                />
              </pattern>
              <image
                id="tuned-in-panels-img-beginner"
                width={2629}
                height={3421}
                href="/images/art/user-beginner.png"
              />
              <image
                id="tuned-in-panels-img-advanced"
                width={2629}
                height={3421}
                href="/images/art/user-advanced.png"
              />
              <image
                id="tuned-in-panels-img-organizations"
                width={1060}
                height={1440}
                href="/images/art/user-organizations.png"
              />
            </defs>
          </svg>
        </div>
      </div>
    </>
  );
};
