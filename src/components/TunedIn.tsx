import * as React from 'react';
import {Body4, Caption, H2, Subhead, Link as ProseLink} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {MIN_TABLET_MEDIA_QUERY, MOBILE_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {useDarkSection} from '@/hooks/useDarkSection';
import {PrimaryButton} from './PrimaryButton';
import {useScrollProgress} from '@/hooks/useScrollProgress';
import {StickyLine} from './StickyLine';

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
        })}
      >
        <svg
          className={css({
            background: 'var(--color-space)',
            position: 'relative',
            zIndex: 1,
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
            minHeight: '730px',
            padding: '20px',
            position: 'absolute',
            right: 0,
            top: 0,
          })}
        >
          <header
            className={css({
              borderRadius: '10px',
              borderStyle: 'solid',
              borderWidth: '1px',
              minHeight: '160px',
              padding: '20px',
              width: '100%',
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
            fill="#F8F4EB"
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
            fill="#F8F4EB"
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
          stroke="#F8F4EB"
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
          <path fill="#fff" d="M0 0H530V706H0z" />
        </clipPath>
        <clipPath id="tuned-in-panels-clip2">
          <path fill="#fff" d="M0 0H530V706H0z" />
        </clipPath>
        <clipPath id="tuned-in-panels-clip3">
          <path
            fill="#fff"
            transform="matrix(-1 0 0 1 530 0)"
            d="M0 0H530V706H0z"
          />
        </clipPath>
        <clipPath id="tuned-in-panels-clip4">
          <path
            fill="#fff"
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
    // Reset when scrolling back up
    if (scrollProgress < 0.6) {
      setRightActive(false);
      setMiddleActive(false);
      setLeftActive(false);
      return;
    }
    if (scrollProgress >= 0.8) {
      setRightActive(true);
    }
    if (scrollProgress >= 0.7) {
      setMiddleActive(true);
    }
    if (scrollProgress >= 0.6) {
      setLeftActive(true);
    }
  }, [scrollProgress]);

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
          zIndex: 1,
          transform: 'translate3d(0,0,0)',
        })}
      >
        <div
          className={css({
            paddingBottom: '286px',
            transform: 'translate3d(0,0,0)',
            position: 'relative',
            zIndex: 2,
          })}
        >
          <StickyLine color={STICKY_LINE_COLOR} zIndex={3} />
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
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(3, 1fr)',
              listStyleType: 'none',
              marginTop: '0',
              marginBottom: '0',
              minHeight: '460px',
              paddingLeft: '20px',
              paddingRight: '20px',
              position: 'relative',
              zIndex: 3,
              width: '100%',
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
