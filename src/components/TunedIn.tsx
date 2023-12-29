import * as React from 'react';
import {Body4, Caption, H2, Subhead, Link as ProseLink} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {MIN_TABLET_MEDIA_QUERY, MOBILE_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {useDarkSection} from '@/hooks/useDarkSection';
import {PrimaryButton} from './PrimaryButton';
import {useScrollProgress} from '@/hooks/useScrollProgress';
import {StickyLine} from './StickyLine';
import {useVisibleElements} from '@/hooks/useVisibleElements';

const PANELS = {
  left: {
    color: 'var(--color-orchid)',
    heading: <>You are just getting started</>,
    url: '/learn/podcasting-for-beginners',
  },
  middle: {
    color: 'var(--color-lime)',
    heading: <>You need advanced tools</>,
    url: '/learn/podcasting-for-power-users',
  },
  right: {
    color: 'var(--color-sky)',
    heading: <>You are an organization</>,
    url: '/learn/corporate-podcasting',
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

const SCROLL_PERCENTAGE_TO_SHOW_DIAL = 0.482;

const scaleDial = (num: number) =>
  scaleNumber(num, SCROLL_PERCENTAGE_TO_SHOW_DIAL, 1, 0, 1);

const scaleDialAngle = (num: number) => scaleNumber(num, 0, 1, 0, 180);

const Dial = ({progress}: {progress: number}) => {
  const rotationStyles = {
    // 0deg = on left line.
    // -180deg = on right line.
    transform: `rotate(${-1 * scaleDialAngle(progress)}deg)`,
    // Rotate the dial's hand from the center of the dial.
    transformOrigin: '144px 70px',
    // Slight transition to smoothly rotate the dial's hand on scroll.
    transition: 'all 0.025s linear',
  };

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
          <path
            d="M143 70H.5"
            stroke="var(--color-sand)"
            style={rotationStyles}
          />
          <g>
            <ellipse
              cx={144}
              cy={70}
              rx={70}
              ry={70}
              transform="rotate(-180 144 70)"
              fill="var(--color-white)"
            />
            <ellipse
              id="Ellipse 449"
              cx={144}
              cy={70}
              rx={65}
              ry={65}
              transform="rotate(-180 144 70)"
              fill="var(--color-white)"
              stroke="var(--color-space)"
            />
            <circle id="Ellipse 448" cx={182} cy={103} r={6} fill="var(--color-space)" />
          </g>
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
          <g>
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
            <circle
              cx={95}
              cy={71}
              r={6}
              fill="var(--color-space)"
              style={rotationStyles}
            />
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
};

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
      <li
        className={css({
          position: 'relative',
          [MOBILE_MEDIA_QUERY]: {
            width: '265px',
            flex: '0 0 265px',
          },
        })}
      >
        <svg
          className={css({
            background: 'var(--color-space)',
            display: 'none',
            position: 'relative',
            zIndex: 1,
            [MIN_TABLET_MEDIA_QUERY]: {
              display: 'block',
            },
          })}
          viewBox="0 0 530.1 78"
        >
          <use
            href={
              isActive
                ? `#tuned-in-panel-${position}-filled`
                : `#tuned-in-panel-${position}-default`
            }
          />
        </svg>
        <div
          className={css({
            alignItems: 'flex-end',
            backgroundColor: isActive ? activeColor : 'transparent',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            borderBottomWidth: '1px',
            borderColor: isActive ? activeColor : 'var(--color-sand)',
            borderLeftWidth: '1px',
            borderRightWidth: '1px',
            borderStyle: 'solid',
            bottom: 0,
            color: isActive ? 'var(--color-space)' : 'var(--color-white)',
            display: 'flex',
            left: 0,
            padding: '20px',
            position: 'absolute',
            right: 0,
            top: 0,
            [MIN_TABLET_MEDIA_QUERY]: {
              borderTopLeftRadius: '0',
              borderTopRightRadius: '0',
              minHeight: '730px',
            },
          })}
        >
          <header
            className={css({
              borderRadius: '10px',
              borderStyle: 'solid',
              borderWidth: '1px',
              padding: '20px',
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
              // TODO: Isolate a non-anchor version of Typography's Link
              // so the entire `<li>` can be used as a large click target.
              href={panel.url}
              style={{
                color: 'inherit',
              }}
            >
              Learn more
            </ProseLink>
          </header>
        </div>
      </li>
    </>
  );
};

const PanelSprites = () => {
  const css = useCSS();
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={0}
      height={0}
      fill="none"
      viewBox="0 0 530 706"
      xmlns="http://www.w3.org/2000/svg"
      className={css({display: 'none'})}
    >
      <path fill="#090909" d="M0 0H530V706H0z" />
      <g
        id="tuned-in-panel-left-default"
        clipPath="url(#tuned-in-panels-clip1)"
      >
        <path fill="#090909" d="M0 0H530V706H0z" />
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 705.026h510a9 9 0 009-9V74.454c0-4.752-3.707-8.688-8.455-8.992C334.622 53.556 162.434 31.39 11.808 1.18 6.218.059 1 4.326 1 10.023v686.003a9 9 0 009 9zm0 1c-5.523 0-10-4.478-10-10V10.023C0 3.693 5.798-1.045 12.004.2 162.581 30.4 334.724 52.561 520.61 64.464c5.272.337 9.391 4.708 9.391 9.99v621.572c0 5.522-4.477 10-10 10H10z"
            fill="var(--color-sand)"
          />
          <path
            d="M520 705.026H10a9 9 0 01-9-9V10.023C1 4.326 6.218.06 11.807 1.18c150.627 30.21 322.815 52.376 508.738 64.282 4.748.304 8.455 4.24 8.455 8.992v621.572a9 9 0 01-9 9z"
            fill="#090909"
          />
        </g>
      </g>
      <g id="tuned-in-panel-left-filled" clipPath="url(#tuned-in-panels-clip2)">
        <path fill="#090909" d="M0 0H530V706H0z" />
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 705.026h510a9 9 0 009-9V74.454c0-4.752-3.707-8.688-8.455-8.992C334.622 53.556 162.434 31.39 11.808 1.18 6.218.059 1 4.326 1 10.023v686.003a9 9 0 009 9zm0 1c-5.523 0-10-4.478-10-10V10.023C0 3.693 5.798-1.045 12.004.2 162.581 30.4 334.724 52.561 520.61 64.464c5.272.337 9.391 4.708 9.391 9.99v621.572c0 5.522-4.477 10-10 10H10z"
            fill="#DBAEFF"
          />
          <path
            d="M520 705.026H10a9 9 0 01-9-9V10.023C1 4.326 6.218.06 11.807 1.18c150.627 30.21 322.815 52.376 508.738 64.282 4.748.304 8.455 4.24 8.455 8.992v621.572a9 9 0 01-9 9z"
            fill="#DBAEFF"
          />
        </g>
      </g>
      <g
        id="tuned-in-panel-right-default"
        clipPath="url(#tuned-in-panels-clip3)"
      >
        <path
          transform="matrix(-1 0 0 1 530 0)"
          fill="#090909"
          d="M0 0H530V706H0z"
        />
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M520 705.026H10a9 9 0 01-9-9V74.454c0-4.752 3.707-8.688 8.455-8.992C195.378 53.556 367.566 31.39 518.193 1.18 523.782.059 529 4.326 529 10.023v686.003a9 9 0 01-9 9zm0 1c5.523 0 10-4.478 10-10V10.023c0-6.33-5.798-11.068-12.004-9.824C367.419 30.4 195.276 52.561 9.391 64.464 4.119 64.8 0 69.172 0 74.454v621.572c0 5.522 4.477 10 10 10h510z"
            fill="var(--color-sand)"
          />
          <path
            d="M10 705.026h510a9 9 0 009-9V10.023c0-5.697-5.218-9.964-10.807-8.843C367.566 31.39 195.378 53.556 9.455 65.462 4.707 65.766 1 69.702 1 74.454v621.572a9 9 0 009 9z"
            fill="#090909"
          />
        </g>
      </g>
      <g
        id="tuned-in-panel-right-filled"
        clipPath="url(#tuned-in-panels-clip4)"
      >
        <path
          transform="matrix(-1 0 0 1 530 0)"
          fill="#090909"
          d="M0 0H530V706H0z"
        />
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M520 705.026H10a9 9 0 01-9-9V74.454c0-4.752 3.707-8.688 8.455-8.992C195.378 53.556 367.566 31.39 518.193 1.18 523.782.059 529 4.326 529 10.023v686.003a9 9 0 01-9 9zm0 1c5.523 0 10-4.478 10-10V10.023c0-6.33-5.798-11.068-12.004-9.824C367.419 30.4 195.276 52.561 9.391 64.464 4.119 64.8 0 69.172 0 74.454v621.572c0 5.522 4.477 10 10 10h510z"
            fill="#C7ECFA"
          />
          <path
            d="M10 705.026h510a9 9 0 009-9V10.023c0-5.697-5.218-9.964-10.807-8.843C367.566 31.39 195.378 53.556 9.455 65.462 4.707 65.766 1 69.702 1 74.454v621.572a9 9 0 009 9z"
            fill="#C7ECFA"
          />
        </g>
      </g>
      <g id="tuned-in-panel-middle-default">
        <path fill="#090909" d="M0 0H530V706H0z" />
        <path
          d="M.5 695.54V77.545c0-5.444 4.565-9.775 10.004-9.498C93.088 72.25 178.138 74.44 265 74.44c86.862 0 171.912-2.19 254.496-6.393 5.439-.277 10.004 4.054 10.004 9.498V695.54a9.5 9.5 0 01-9.5 9.5H10a9.5 9.5 0 01-9.5-9.5z"
          fill="#090909"
          stroke="var(--color-sand)"
        />
      </g>
      <g id="tuned-in-panel-middle-filled">
        <path fill="#090909" d="M0 0H530V706H0z" />
        <path
          d="M.5 695.54V77.545c0-5.444 4.565-9.775 10.004-9.498C93.088 72.25 178.138 74.44 265 74.44c86.862 0 171.912-2.19 254.496-6.393 5.439-.277 10.004 4.054 10.004 9.498V695.54a9.5 9.5 0 01-9.5 9.5H10a9.5 9.5 0 01-9.5-9.5z"
          fill="#C4FF7E"
          stroke="#C4FF7E"
        />
      </g>
      <defs>
        <clipPath id="tuned-in-panels-clip1">
          <path fill="var(--color-white)" d="M0 0H530V706H0z" />
        </clipPath>
        <clipPath id="tuned-in-panels-clip2">
          <path fill="var(--color-white)" d="M0 0H530V706H0z" />
        </clipPath>
        <clipPath id="tuned-in-panels-clip3">
          <path
            fill="var(--color-white)"
            transform="matrix(-1 0 0 1 530 0)"
            d="M0 0H530V706H0z"
          />
        </clipPath>
        <clipPath id="tuned-in-panels-clip4">
          <path
            fill="var(--color-white)"
            transform="matrix(-1 0 0 1 530 0)"
            d="M0 0H530V706H0z"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export const TunedIn = () => {
  const css = useCSS();

  const sectionRef = React.useRef<HTMLElement>(null);
  useDarkSection(sectionRef);

  const [leftActive, setLeftActive] = React.useState<boolean>(false);
  const [middleActive, setMiddleActive] = React.useState<boolean>(false);
  const [rightActive, setRightActive] = React.useState<boolean>(false);

  const bottomRef = React.useRef<HTMLDivElement>(null);
  useDarkSection(bottomRef);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(scrollerRef);

  React.useEffect(() => {
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
  }, [scrollProgress]);

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
                  Whether you’re starting out or you are more established we
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

          <PanelSprites />
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
              opacity: scrollProgress > 0 && !visibleStickyElement ? 1 : 0,
              pointerEvents: 'none',
              transition:
                scrollProgress > 0 && !visibleStickyElement
                  ? 'opacity 0.2s ease-in-out'
                  : 'opacity 0.1s ease-in-out',
            })}
          >
            <Dial progress={scaleDial(scrollProgress)} />
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
          <ul
            className={css({
              listStyleType: 'none',
              marginTop: '0',
              marginBottom: '0',
              minHeight: '460px',
              paddingLeft: '20px',
              paddingRight: '20px',
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
              },
            })}
          >
            <Panel position="left" isActive={leftActive} />
            <Panel position="middle" isActive={middleActive} />
            <Panel position="right" isActive={rightActive} />
          </ul>
        </div>
        {/* Spacer for the vertical scroll region past 1.0 */}
        <div
          className={css({
            height: '422px',
            marginBottom: '-152px',
          })}
        />
      </div>
    </>
  );
};
