import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from '@/constants';
import Link from 'next/link';
import {SignIn} from '@/icons/SignIn';
import {MainHeaderLink} from './MainHeaderLink';
import {Hamburger} from '@/icons/Hamburger';
import {useDismiss} from '@/hooks/useDismiss';
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
          borderRadius: 'inherit',
          color: 'var(--color-space)',
          display: 'grid',
          textDecoration: 'none',
          height: '100%',
          width: '100%',
          placeContent: 'stretch',
          placeItems: 'stretch',

          [MIN_TABLET_MEDIA_QUERY]: {
            background: color,
            borderRadius: '10px',
            border: '1px solid var(--color-line)',
            display: 'flex',
            flexDirection: 'column-reverse',
            height: 'auto',
            margin: '10px',
            padding: '30px 20px',
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

export const MainHeader = () => {
  const css = useCSS();

  const navRef = React.useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = React.useState(false);

  // Prevent background scrolling of the document when the dropdown nav is open.
  const [lock, unlock] = useScrollLock();

  // Allow any clicks outside of the dropdown nav to dismiss the nav.
  useDismiss(navRef, () => setNavOpen(false), navOpen);

  React.useEffect(() => {
    if (navOpen) {
      lock();
    } else {
      unlock();
    }
    document.body.classList.toggle('dimmed', navOpen);
  }, [lock, navOpen, unlock]);

  return (
    <>
      <header
        className={css({
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

          padding: '20px',
          position: 'fixed',

          transition:
            'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, border-radius 0.2s ease-in-out',
          // Prevent the width from shifting when opened.
          width: 'calc(100vw - 20px - var(--scrollbar-width, 15px))',
          zIndex: navOpen ? 130 : 95,
          [MIN_TABLET_MEDIA_QUERY]: {
            height: '80px',
            top: '20px',
            left: '20px',
            right: '20px',
            width: 'calc(100vw - 40px - var(--scrollbar-width, 15px))',
          },
        })}
      >
        <button
          type="button"
          aria-label="Toggle menu"
          className={css({
            alignItems: 'center',
            appearance: 'none',
            background: 'none',
            border: 'none',
            display: 'flex',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
          })}
          onClick={evt => {
            evt.preventDefault();
            setNavOpen(prevNavOpen => !prevNavOpen);
          }}
        >
          <Hamburger size={24} color="var(--color-primary-dark)" />
        </button>
        <div
          className={css({
            display: 'none',
            gap: '0 1px',
            alignItems: 'center',
            marginLeft: '-15px',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'flex'},
          })}
        >
          <MainHeaderLink href="/features">Features</MainHeaderLink>
          <MainHeaderLink
            href="/learn"
            onClick={() => {
              setNavOpen(prevNavOpen => !prevNavOpen);
            }}
          >
            Learn
          </MainHeaderLink>
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
          <PrimaryButton href="https://pinecast.com/signup">
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
          <Link
            href="https://pinecast.com/login"
            className={css({display: 'block', height: '24px'})}
          >
            <SignIn size={24} color="var(--color-primary-dark)" />
          </Link>
        </div>
      </header>
      <div
        ref={navRef}
        className={css({
          borderRadius: '0 0 20px 20px',
          borderWidth: '0 1px 1px',
          borderStyle: 'solid',
          borderColor: 'var(--color-line)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'min(550px, calc(100vh - 80px))',
          justifyContent: 'flex-start',
          left: '10px',
          opacity: navOpen ? 1 : 0,
          position: 'fixed',
          right: '10px',
          top: navOpen ? '68px' : '70px',
          transition: 'opacity 0.2s 0.1s ease-in-out, top 0.2s ease-in-out',
          visibility: navOpen ? 'visible' : 'hidden',
          zIndex: navOpen ? 130 : 90,
          width: 'calc(100vw - 20px - var(--scrollbar-width, 15px))',
          [MIN_TABLET_MEDIA_QUERY]: {
            height: 'min(500px, calc(100vh - 120px))',
            top: navOpen ? '82px' : '80px',
            left: '20px',
            right: '20px',
            width: 'calc(100vw - 40px - var(--scrollbar-width, 15px))',
          },
        })}
      >
        <nav
          className={css({
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            display: 'flex',
            // Set `flex: 1` to give the illusion of growing from zero to the full height.
            flex: navOpen ? 1 : 0,
            height: 'auto',
            overflow: 'hidden',
            justifyContent: 'space-between',
            padding: '0 10px',
            transition: navOpen
              ? 'all 0.2s ease-in-out'
              : 'background 0.2s ease-in-out, flex 0.2s ease-in-out',

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
                gridTemplateRows: '100%',
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
    </>
  );
};
