import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {
  ADAPTIVE_SURFACE,
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from '@/constants';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {SignIn} from '@/icons/SignIn';
import {AudioWaveformIcon} from './AudioWaveformIcon';
import {
  HEADER_FOCUS_STYLE,
  MainHeaderButton,
  MainHeaderLink,
} from './MainHeaderLink';
import {Hamburger} from '@/icons/Hamburger';
import {useAudioManager} from '@/hooks/useAudioManager';
import {useDismiss} from '@/hooks/useDismiss';
import {aboveOverlayProps, useInertOutside} from '@/hooks/useInertOutside';
import {useScrollLock} from '@/hooks/useScrollLock';
import {Body1, Caption} from './Typography';
import {QuickTipsBlock} from './QuickLinks';
import {RightArrow} from '@/icons/RightArrow';
import {FeaturesBlock} from './FeaturesBlock';
import {
  CustomerPersonaAnimation,
  PERSONAS,
  PersonaSlug,
} from './CustomerPersona';
import {Tooltip, TooltipPosition} from './Tooltip';
import {ScreenReaderText, VISUALLY_HIDDEN} from './ScreenReaderText';
import {SoundEffect} from '@/hooks/useSoundEffects';
import {Bubble, BUBBLE_FOCUS_RING} from './Bubble';
import {useScrollListener} from '@/hooks/useScrollProgress';
import {MotionToggle} from './MotionToggle';

const PersonaBlock = ({
  caption,
  heading,
  isActive = false,
  slug,
}: {
  caption: React.ReactNode | string;
  heading: React.ReactNode | string;
  isActive?: boolean;
  slug: PersonaSlug;
}) => {
  const {color, url} = PERSONAS[slug];
  const css = useCSS();
  return (
    <div
      className={css({
        backgroundColor: color,
        border: '1px solid var(--color-line)',
        borderRadius: '20px',
        height: '100px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 0,
        width: '100%',
        [MIN_TABLET_MEDIA_QUERY]: {
          display: 'flex',
          height: 'auto',
          alignItems: 'flex-end',
        },
      })}
    >
      <Link
        href={url}
        className={css({
          // The tile is always light, whatever the menu around it.
          '--color-focus-ring': 'var(--color-space)',
          borderRadius: 'inherit',
          color: 'var(--color-space)',
          display: 'grid',
          textDecoration: 'none',
          height: '100%',
          width: '100%',
          placeContent: 'stretch',
          placeItems: 'stretch',
          // Below the tablet size the link fills the tile, which clips
          // anything outside it (overflow: hidden). Draw the ring inside.
          ':focus-visible': {outlineOffset: '-4px'},

          [MIN_TABLET_MEDIA_QUERY]: {
            background: color,
            borderRadius: '10px',
            border: '1px solid var(--color-line)',
            display: 'flex',
            flexDirection: 'column-reverse',
            height: 'auto',
            margin: '10px',
            padding: '30px 20px',
            // Here the link has a margin inside the tile: room for the ring.
            ':focus-visible': {outlineOffset: '2px'},
          },
        })}
      >
        <div
          className={css({
            borderBottomLeftRadius: 'inherit',
            display: 'grid',
            padding: '15px',
            placeSelf: 'end',
            width: '100%',
            [MIN_TABLET_MEDIA_QUERY]: {
              display: 'contents',
            },
          })}
        >
          <Body1
            style={{
              letterSpacing: '-0.015em',
              [MIN_TABLET_MEDIA_QUERY]: {
                letterSpacing: '-0.03em',
                lineHeight: '24px',
                maxWidth: '8em',
              },
              [MOBILE_MEDIA_QUERY]: {
                fontSize: '16px',
                lineHeight: '18px',
                maxWidth: '8em',
              },
              [TABLET_MEDIA_QUERY]: {
                fontSize: '18px',
                lineHeight: '20px',
                maxWidth: '12em',
              },
            }}
          >
            {heading}
          </Body1>
          <Caption
            style={{
              color: 'var(--color-space)',
              marginBottom: '8px',
              display: 'none',
              textTransform: 'uppercase',
              [MIN_TABLET_MEDIA_QUERY]: {
                display: 'block',
                maxWidth: '8em',
              },
            }}
          >
            {caption}
          </Caption>
        </div>
        <div
          className={css({
            borderTopRightRadius: 'inherit',
            borderBottomRightRadius: 'inherit',
            height: '100px',
            position: 'absolute',
            right: '10px',
            width: '200px',
            [MIN_TABLET_MEDIA_QUERY]: {
              height: '100%',
              width: '100%',
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            },
          })}
        >
          <CustomerPersonaAnimation
            slug={slug}
            isActive={isActive}
            zIndex={-1}
          />
        </div>
        <RightArrow
          size={24}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '10px',
            [MIN_TABLET_MEDIA_QUERY]: {right: '30px', bottom: '30px'},
          }}
        />
      </Link>
    </div>
  );
};

const MENU_ID = 'site-menu';

// The links and buttons in `root` that Tab can reach, in order.
const getTabbableElements = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(element => element.getClientRects().length > 0);

// The close button of the open menu. The buttons that open the menu are in the
// header, outside the dialog, so a screen reader that obeys aria-modal cannot
// reach them, and a touch screen reader has no Escape key. It is the first
// element of the dialog, next to the trigger, and it shows only while it has
// focus, like the skip link.
const CLOSE_BUTTON_STYLE: StyleObject = {
  ...MonumentGroteskBold,
  backgroundColor: 'var(--color-white)',
  borderColor: 'var(--color-space)',
  // The tight corner points at the trigger, at the top left.
  borderRadius: '3px 22px 22px 22px',
  borderStyle: 'solid',
  borderWidth: '2px',
  boxShadow: '3px 4px 0 rgba(9, 9, 9, 0.18)',
  color: 'var(--color-space)',
  cursor: 'pointer',
  fontSize: '16px',
  left: '10px',
  lineHeight: '20px',
  padding: '10px 18px',
  position: 'absolute',
  top: '10px',
  whiteSpace: 'nowrap',
  zIndex: 1,
  [MIN_TABLET_MEDIA_QUERY]: {left: '20px', top: '20px'},
  ':not(:focus)': VISUALLY_HIDDEN,
};

export const MainHeader = () => {
  const css = useCSS();
  const router = useRouter();

  const navRef = React.useRef<HTMLDivElement>(null);
  const navScrollRef = React.useRef<HTMLElement>(null);
  // The button that opened the menu. Focus goes back to it when the menu closes.
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [navOpen, setNavOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  useScrollListener(
    React.useCallback(scrollY => setHasScrolled(scrollY > 200), []),
  );

  const muteToggleTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const {
    loading: audioMangerLoading,
    soundEffects: {play: playSoundEffect},
    muted,
    toggleMuted,
  } = useAudioManager();

  // Prevent background scrolling of the document when the dropdown nav is open.
  const [lock, unlock] = useScrollLock();

  const closeNav = React.useCallback(() => {
    // Return focus to the trigger, unless the user moved it to something
    // outside the menu (a click on the dim overlay moves it to the body).
    const active = document.activeElement;
    if (
      !active ||
      active === document.body ||
      navRef.current?.contains(active)
    ) {
      triggerRef.current?.focus({preventScroll: true});
    }
    setNavOpen(false);
  }, []);

  const toggleNav = (trigger: HTMLButtonElement) => {
    if (navOpen) {
      closeNav();
    } else {
      triggerRef.current = trigger;
      setNavOpen(true);
    }
  };

  // Allow Escape and any clicks outside of the dropdown nav to dismiss the nav.
  useDismiss(navRef, closeNav, navOpen);

  // A link in the menu to the page that is already open does not load a new
  // page, so close the menu when a navigation completes.
  React.useEffect(() => {
    if (!navOpen) {
      return;
    }
    router.events.on('routeChangeComplete', closeNav);
    router.events.on('hashChangeComplete', closeNav);
    return () => {
      router.events.off('routeChangeComplete', closeNav);
      router.events.off('hashChangeComplete', closeNav);
    };
  }, [closeNav, navOpen, router.events]);

  React.useEffect(() => {
    if (navOpen) {
      lock();
      // Show the top of the menu each time it opens.
      navScrollRef.current?.scrollTo({top: 0});
    } else {
      unlock();
    }
    document.body.classList.toggle('dimmed', navOpen);
  }, [lock, navOpen, unlock]);

  // The open menu is a modal dialog: the page behind the dim overlay is inert.
  useInertOutside(navOpen);

  // Move focus into the open menu, and keep Tab and Shift+Tab inside it.
  React.useEffect(() => {
    const nav = navRef.current;
    if (!navOpen || !nav) {
      return;
    }
    // The nav fades in with `transition: all`, and that includes visibility:
    // on the first frame its links are still hidden and cannot take focus. So
    // try again on the next frames, while focus has not gone elsewhere.
    let frame = 0;
    let attempts = 0;
    const focusFirstLink = () => {
      // The first link, not the close button before it: the close button is
      // one Shift+Tab away.
      const first = getTabbableElements(nav).find(
        element => element.localName === 'a',
      );
      // The menu does not scroll the page, and it grows from the top, so do
      // not scroll anything to show the link.
      first?.focus({preventScroll: true});
      const active = document.activeElement;
      if (
        first &&
        active !== first &&
        (active === document.body || active === triggerRef.current) &&
        ++attempts < 30
      ) {
        frame = requestAnimationFrame(focusFirstLink);
      }
    };
    focusFirstLink();

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key !== 'Tab') {
        return;
      }
      const elements = getTabbableElements(nav);
      if (!elements.length) {
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;
      if (!nav.contains(active)) {
        evt.preventDefault();
        (evt.shiftKey ? last : first).focus();
      } else if (evt.shiftKey && active === first) {
        evt.preventDefault();
        last.focus();
      } else if (!evt.shiftKey && active === last) {
        evt.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navOpen]);

  const onClickSoundButton = React.useCallback(
    (evt: React.MouseEvent) => {
      evt.preventDefault();

      if (muted) {
        playSoundEffect(SoundEffect.SOUND_ON_1);
      }

      clearTimeout(muteToggleTimer.current);
      muteToggleTimer.current = setTimeout(() => {
        if (!muted) {
          playSoundEffect(SoundEffect.SOUND_OFF_1);
        }
      }, 0);

      toggleMuted();
    },
    [muted, playSoundEffect, toggleMuted],
  );

  const buttonSize = (audioMangerLoading || muted) && !hasScrolled ? 96 : 48;
  return (
    <>
      <header
        {...aboveOverlayProps}
        className={css({
          ...ADAPTIVE_SURFACE,
          background: 'var(--color-primary-light)',
          borderStyle: 'solid',
          borderColor: navOpen
            ? 'var(--color-line) var(--color-line) transparent'
            : 'var(--color-line)',
          borderRadius: navOpen ? '20px 20px 0 0' : '20px',
          borderWidth: '1px',
          display: 'flex',
          height: '60px',
          top: '10px',
          left: '10px',
          right: '10px',
          justifyContent: 'space-between',
          position: 'fixed',
          transition:
            'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, border-radius 0.2s ease-in-out',
          // Prevent the width from shifting when opened.
          width: 'calc(100vw - 20px - var(--scrollbar-width, 0))',
          zIndex: navOpen ? 140 : 95,
          [MIN_TABLET_MEDIA_QUERY]: {
            height: '80px',
            top: '20px',
            left: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            alignItems: 'center',
            right: '20px',
            width: 'calc(100vw - 40px - var(--scrollbar-width, 0))',
          },
          ['::before']: {
            // Patch up the missing bottom border so the tooltip is layered correctly atop the nav + the dimmed overlay when the nav is expanded.
            borderLeft: '1px solid var(--color-line)',
            borderRight: '1px solid var(--color-line)',
            content: '""',
            display: 'block',
            height: '1px',
            left: '-1px',
            opacity: navOpen ? 1 : 0,
            pointerEvents: 'none',
            position: 'absolute',
            right: '-1px',
            top: '58px',
            [MIN_TABLET_MEDIA_QUERY]: {
              top: '78px',
            },
          },
        })}
      >
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={navOpen}
          aria-controls={MENU_ID}
          className={css({
            ...HEADER_FOCUS_STYLE,
            alignItems: 'center',
            appearance: 'none',
            background: 'none',
            border: 'none',
            // Round, so that the focus ring stays inside the header.
            borderRadius: '18px',
            display: 'flex',
            cursor: 'pointer',
            paddingTop: 0,
            paddingRight: '24px',
            paddingBottom: 0,
            paddingLeft: '24px',
            WebkitAppearance: 'none',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
          })}
          onClick={evt => {
            evt.preventDefault();
            toggleNav(evt.currentTarget);
          }}
        >
          <Hamburger size={24} color="var(--color-primary-dark)" />
        </button>
        <div
          className={css({
            display: 'none',
            gap: '0 1px',
            alignItems: 'center',
            marginLeft: '-18px',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'flex'},
          })}
        >
          <Tooltip
            isActive={!audioMangerLoading && muted}
            position={TooltipPosition.BOTTOM}
            text="This site is better with sound!"
          >
            {describedBy => (
              <label>
                <ScreenReaderText>
                  {audioMangerLoading || muted ? 'Unmute' : 'Mute'}
                </ScreenReaderText>
                <button
                  type="button"
                  aria-describedby={describedBy}
                  className={css({
                    ...HEADER_FOCUS_STYLE,
                    appearance: 'none',
                    backgroundColor: 'transparent',
                    borderRadius: '18px',
                    borderWidth: '0',
                    cursor: 'pointer',
                    paddingTop: '30px',
                    paddingRight: '23px',
                    paddingBottom: '30px',
                    paddingLeft: '35px',
                  })}
                  onClick={onClickSoundButton}
                >
                  <AudioWaveformIcon
                    color="var(--color-primary-dark)"
                    muted={audioMangerLoading ? true : muted}
                    // Flex, not inline-flex: an inline icon sits on the text
                    // baseline, with room for descenders under it, 1.5px
                    // above the center of the header.
                    style={{display: 'flex'}}
                  />
                </button>
              </label>
            )}
          </Tooltip>
          <MotionToggle
            style={{
              borderRadius: '18px',
              paddingTop: '29px',
              paddingRight: '12px',
              paddingBottom: '29px',
              paddingLeft: '4px',
            }}
          />
          <nav
            aria-label="Primary"
            className={css({
              alignItems: 'center',
              display: 'flex',
              gap: '0 1px',
            })}
          >
            <MainHeaderLink
              href="/features"
              onClick={() =>
                playSoundEffect(SoundEffect.GLOBE_TRANSITION_STATES)
              }
            >
              Features
            </MainHeaderLink>
            {/* "Learn" opens the menu. The footer links to the /learn page. */}
            <MainHeaderButton
              aria-expanded={navOpen}
              aria-controls={MENU_ID}
              onClick={evt => {
                evt.preventDefault();
                playSoundEffect(SoundEffect.CLICK_DROP);
                toggleNav(evt.currentTarget);
              }}
            >
              Learn
            </MainHeaderButton>
          </nav>
        </div>
        <div
          className={css({
            display: 'none',
            gap: '20px',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'flex'},
          })}
        >
          <SecondaryButton href="https://pinecast.com/login">
            Sign in
          </SecondaryButton>
          <PrimaryButton
            href="https://pinecast.com/signup"
            onPointerDown={() => playSoundEffect(SoundEffect.CTA_CLICK_3)}
          >
            Sign up
          </PrimaryButton>
        </div>
        <div
          className={css({
            alignItems: 'center',
            display: 'flex',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
          })}
        >
          <MotionToggle
            style={{
              alignSelf: 'stretch',
              paddingTop: 0,
              paddingRight: '6px',
              paddingBottom: 0,
              paddingLeft: '6px',
            }}
          />
          <Link
            href="https://pinecast.com/login"
            aria-label="Sign in"
            className={css({
              ...HEADER_FOCUS_STYLE,
              // Flex, not block: an inline icon sits on the text baseline,
              // with room for descenders under it, 2px above the center.
              display: 'flex',
              // Round, so that the focus ring stays inside the header.
              borderRadius: '18px',
              paddingTop: '15px',
              paddingRight: '20px',
              paddingBottom: '15px',
              paddingLeft: '20px',
            })}
          >
            <SignIn size={24} color="var(--color-primary-dark)" />
          </Link>
        </div>
      </header>
      <div
        {...aboveOverlayProps}
        ref={navRef}
        id={MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={css({
          ...ADAPTIVE_SURFACE,
          borderRadius: '0 0 20px 20px',
          borderWidth: '0 1px 1px',
          borderStyle: 'solid',
          borderColor: 'var(--color-line)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          // On a phone, 100vh is the height with the browser toolbar hidden.
          // The max-height in dvh follows the toolbar, so that the end of the
          // menu stays above it. A browser that does not know dvh ignores the
          // max-height and uses the height in vh.
          height: 'min(550px, calc(100vh - 80px))',
          maxHeight: 'calc(100dvh - 80px)',
          justifyContent: 'flex-start',
          left: '10px',
          opacity: navOpen ? 1 : 0,
          position: 'fixed',
          right: '10px',
          top: navOpen ? '68px' : '70px',
          transition: 'opacity 0.2s 0.1s ease-in-out, top 0.2s ease-in-out',
          visibility: navOpen ? 'visible' : 'hidden',
          zIndex: navOpen ? 130 : 90,
          width: 'calc(100vw - 20px - var(--scrollbar-width, 0))',
          [MIN_TABLET_MEDIA_QUERY]: {
            height: 'min(500px, calc(100vh - 120px))',
            maxHeight: 'calc(100dvh - 120px)',
            top: navOpen ? '82px' : '80px',
            left: '20px',
            right: '20px',
            width: 'calc(100vw - 40px - var(--scrollbar-width, 0))',
          },
        })}
      >
        <button
          type="button"
          className={css(CLOSE_BUTTON_STYLE)}
          onClick={evt => {
            evt.preventDefault();
            closeNav();
          }}
        >
          Close menu
        </button>
        <nav
          ref={navScrollRef}
          aria-label="Menu"
          className={css({
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            display: 'flex',
            // Set `flex: 1` to give the illusion of growing from zero to the full height.
            flex: navOpen ? 1 : 0,
            height: 'auto',
            // Scroll inside the menu when its links do not fit (a short
            // screen, zoom or larger text). `overflow-y` changes to `auto`
            // only when the menu stops growing, so that no scroll bar shows
            // during the animation. A browser without `transition-behavior`
            // changes it at once.
            overflowX: 'hidden',
            overflowY: navOpen ? 'auto' : 'hidden',
            overscrollBehavior: 'contain',
            justifyContent: 'space-between',
            padding: '0 10px',
            // Longhands, so that a browser that does not know
            // `transition-behavior` ignores only that declaration.
            transitionProperty: navOpen
              ? 'all, overflow-y'
              : 'background, flex',
            transitionDuration: navOpen ? '0.2s, 0s' : '0.2s',
            transitionTimingFunction: 'ease-in-out',
            transitionDelay: navOpen ? '0s, 0.2s' : '0s',
            transitionBehavior: navOpen ? 'normal, allow-discrete' : 'normal',

            top: '10px',
            left: '10px',
            right: '10px',
            [MIN_TABLET_MEDIA_QUERY]: {
              padding: '20px',
              top: '0',
              left: '0',
              right: '0',
            },
          })}
        >
          <div
            className={css({
              display: 'grid',
              gap: '8px',
              gridTemplateColumns: '1fr',
              gridTemplateRows:
                'min-content min-content min-content min-content',
              width: '100%',
              [MIN_TABLET_MEDIA_QUERY]: {
                gap: '20px',
                gridTemplateColumns: '1fr 1fr 1fr 1.25fr',
                // Fill the menu, but never shrink the tiles below their
                // content: the menu scrolls instead.
                gridTemplateRows: 'minmax(min-content, 100%)',
              },
            })}
          >
            <FeaturesBlock />
            <PersonaBlock
              slug={PersonaSlug.BEGINNER}
              isActive={navOpen}
              heading="Podcasting for beginners"
              caption="Level 1"
            />
            <PersonaBlock
              slug={PersonaSlug.ADVANCED}
              isActive={navOpen}
              heading="Podcasting for power users"
              caption="Level 2"
            />
            <PersonaBlock
              slug={PersonaSlug.ORGANIZATIONS}
              isActive={navOpen}
              heading="Corporate podcasters"
              caption="Level 3"
            />
            <QuickTipsBlock isOpen={navOpen} />
          </div>
        </nav>
      </div>
      <div
        className={css({
          '--button-size': '120px',
          '--button-spacing': '24px',
          '--button-tap-size':
            'calc(var(--button-size) + var(--button-spacing))',
          '--button-tooltip-height': `${buttonSize}px`,
          position: 'fixed',
          bottom: 'var(--button-spacing)',
          width: 'var(--button-size)',
          zIndex: 140,
          // Hidden while the menu is open: on a short screen or at zoom it
          // covered the links of the menu. Like the rest of the page, it is
          // not usable behind the open menu.
          opacity: navOpen ? 0 : 1,
          visibility: navOpen ? 'hidden' : 'visible',
          transition: 'opacity 0.2s ease-in-out, visibility 0.2s',
          [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
        })}
      >
        <Tooltip
          isActive={!audioMangerLoading && muted && !hasScrolled}
          position={TooltipPosition.RIGHT}
          text="This site is better with sound!"
        >
          {describedBy => (
            <label>
              <ScreenReaderText>
                {audioMangerLoading || muted ? 'Unmute' : 'Mute'}
              </ScreenReaderText>
              <button
                type="button"
                aria-describedby={describedBy}
                className={css({
                  opacity: !hasScrolled ? 1 : 0.4,
                  // The ring goes around the bubble, not the wider button. With
                  // keyboard focus, the bubble shows in full and in view, also
                  // when it has faded or moved off the screen after a scroll.
                  ':focus-visible': {opacity: 1, outline: 'none'},
                  ':focus-visible > *': {...BUBBLE_FOCUS_RING, left: '20px'},
                })}
                style={{
                  appearance: 'none',
                  backgroundColor: 'transparent',
                  borderWidth: '0',
                  cursor: 'pointer',
                  display: 'block',
                  height: 'var(--button-tooltip-height)',
                  transition:
                    'height 0.2s ease-in-out, opacity 0.2s ease-in-out',
                  padding: 0,
                  width: 'var(--button-size)',
                }}
                onClick={onClickSoundButton}
              >
                <Bubble
                  color="var(--color-primary-dark)"
                  size={buttonSize}
                  offsetX={!muted && hasScrolled ? -buttonSize : 20}
                  offsetY={0}
                >
                  <AudioWaveformIcon
                    color="var(--bubble-text-color)"
                    muted={audioMangerLoading ? true : muted}
                    style={{transform: 'scale(1.5)'}}
                  />
                </Bubble>
              </button>
            </label>
          )}
        </Tooltip>
      </div>
    </>
  );
};
