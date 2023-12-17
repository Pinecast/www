import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {MIN_DESKTOP_MEDIA_QUERY, MIN_TABLET_MEDIA_QUERY} from '@/constants';
import Link from 'next/link';
import {SignIn} from '@/icons/SignIn';
import {MainHeaderLink} from './MainHeaderLink';
import {Hamburger} from '@/icons/Hamburger';
import {useDismiss} from '@/hooks/useDismiss';
import {Body1, Caption, PillButton} from './Typography';
import useMatchMedia from '@/hooks/useMatchMedia';

const QUICK_LINKS = [
  ['/learn/create-a-podcast', 'Create a podcast'],
  ['/learn/import-a podcast', 'Import a podcast'],
  ['/learn/promoting-your-podcast', 'Promoting your show'],
  ['/learn/understand-your-growth', 'Understanding your growth'],
  ['/learn/monetize-your-show', 'Monetize your show'],
  ['/learn/podcasting-glossary', 'Podcasting glossary'],
];

const PersonaBlock = ({
  caption,
  color,
  heading,
  illustrationSrc,
  illustrationOffsetY,
}: {
  caption: React.ReactNode | string;
  color: string;
  heading: React.ReactNode | string;
  illustrationSrc: string;
  illustrationOffsetY?: number;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        backgroundColor: color,
        backgroundImage: `url(${illustrationSrc})`,
        backgroundSize: `cover`,
        backgroundPosition: `50% ${illustrationOffsetY || 0}px`,
        border: '1px solid var(--color-line)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '10px',
        width: '100%',
      })}
    >
      <header
        className={css({
          borderRadius: '10px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          padding: '30px 20px',
          width: '100%',
          [MIN_DESKTOP_MEDIA_QUERY]: {
            background: color,
            border: '1px solid var(--color-line)',
          },
        })}
      >
        <Body1
          as="h3"
          style={{
            [MIN_DESKTOP_MEDIA_QUERY]: {
              maxWidth: '8em',
            },
          }}
        >
          {heading}
        </Body1>
        <Caption
          style={{
            color: 'var(--color-core-accent)',
            marginBottom: '8px',
            display: 'none',
            [MIN_DESKTOP_MEDIA_QUERY]: {
              display: 'block',
              maxWidth: '8em',
            },
          }}
        >
          {caption}
        </Caption>
      </header>
    </div>
  );
};

// Vertical treatment for desktop viewports (4:3, 16:9, ultra-wide).
const QuickTipsNarrow = ({}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        background: 'var(--color-primary-dark)',
        borderRadius: '20px',
        color: 'var(--color-primary-dark)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
        [MIN_DESKTOP_MEDIA_QUERY]: {
          padding: '30px',
        },
      })}
    >
      <Body1 as="h3" style={{maxWidth: '8em'}}>
        Quick tips for getting started
      </Body1>
      <ul
        className={css({
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'minmax(0, 1fr)',
          listStyleType: 'none',
          margin: 'auto 0 0 0',
          placeSelf: 'top',
          placeContent: 'bottom',
          padding: '0',
        })}
      >
        {QUICK_LINKS.map(([href, title]) => (
          <li key={href}>
            <Link
              href={href}
              className={css({
                color: 'inherit',
                whiteSpace: 'nowrap',
              })}
            >
              <PillButton
                style={{
                  fontSize: '1rem',
                  padding: '0.125em 1em',
                }}
              >
                {title}
              </PillButton>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Horizontal treatment for smaller viewports (mobile, tablet).
const QuickTipsWide = ({}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        color: 'var(--color-primary-dark)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '30px',
        margin: '0 auto',
        maxWidth: '40em',
        width: '90%',
        textAlign: 'center',
      })}
    >
      <Caption
        as="h3"
        style={{
          color: 'var(--color-core-accent)',
          margin: '0 auto',
          textTransform: 'uppercase',
        }}
      >
        Quick Tips
      </Caption>
      <ul
        className={css({
          color: 'var(--color-primary-dark)',
          display: 'inline-block',
          fontSize: '0',
          isolation: 'isolate',
          listStyleType: 'none',
          margin: '8px auto 0',
          maxWidth: '80%',
          padding: '0',
        })}
      >
        {QUICK_LINKS.map(([href, title]) => (
          <React.Fragment key={href}>
            <Link
              href={href}
              className={css({
                color: 'inherit',
                display: 'contents',
              })}
            >
              <PillButton
                style={{
                  display: 'inline-flex',
                  color: 'inherit',
                  fontSize: '1rem',
                  margin: '12px 4px 0',
                  padding: '0.125em 1em',
                }}
              >
                {title}
              </PillButton>
            </Link>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

const QuickTipsBlock = ({}) => {
  const isLarge = useMatchMedia(MIN_TABLET_MEDIA_QUERY);
  const isSmall = !isLarge;
  return (
    <>
      {isSmall && <QuickTipsWide />}
      {isLarge && <QuickTipsNarrow />}
    </>
  );
};

export const MainHeader = () => {
  const css = useCSS();

  const navRef = React.useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = React.useState(false);

  // Allow any clicks outside of the dropdown nav to dismiss the nav.
  useDismiss(navRef, () => setNavOpen(false), navOpen);

  React.useEffect(() => {
    document.body.classList.toggle('dimmed', navOpen);
  }, [navOpen]);

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
            'background-color 0.2s, border-color 0.2s, border-radius 0.2s',
          zIndex: navOpen ? 130 : 95,
          [MIN_TABLET_MEDIA_QUERY]: {
            height: '80px',
            top: '20px',
            left: '20px',
            right: '20px',
          },
        })}
      >
        <button
          type="button"
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
            style={{display: 'block', height: '24px'}}
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
          // A fixed parent height is required for the grow/shrink height effect.
          height: '92vh',
          justifyContent: 'flex-start',
          left: '10px',
          opacity: navOpen ? 1 : 0,
          // pointerEvents: navOpen ? 'all' : 'none',
          position: 'fixed',
          right: '10px',
          // top: navOpen ? '82px' : '80px',
          top: navOpen ? '70px' : '70px',
          transition: 'opacity 0.2s 0.1s, top 0.2s',
          visibility: navOpen ? 'visible' : 'hidden',
          zIndex: navOpen ? 130 : 90,
          [MIN_TABLET_MEDIA_QUERY]: {
            height: '51vh',
            top: navOpen ? '82px' : '80px',
            left: '20px',
            right: '20px',
          },
        })}
      >
        <nav
          className={css({
            background: 'var(--color-primary-light)',
            display: 'flex',
            // Set `flex: 1` to give the illusion of growing from zero to the full height.
            flex: navOpen ? 1 : 0,
            height: 'auto',
            overflow: 'hidden',
            justifyContent: 'space-between',
            padding: '20px',
            transition: navOpen ? 'all 0.2s' : 'all 0.4s',

            top: '10px',
            left: '10px',
            right: '10px',
            [MIN_TABLET_MEDIA_QUERY]: {
              top: '0',
              left: '0',
              right: '0',
            },
          })}
        >
          <div
            className={css({
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: '1fr',
              width: '100%',
              [MIN_TABLET_MEDIA_QUERY]: {
                gridTemplateColumns: 'repeat(4, 1fr)',
              },
            })}
          >
            <PersonaBlock
              color="var(--color-orchid)"
              illustrationSrc="/images/art/user-beginner.png"
              illustrationOffsetY={-26}
              heading="Podcasting for beginners"
              caption="Level 1"
            />
            <PersonaBlock
              color="var(--color-lime)"
              illustrationSrc="/images/art/user-advanced.png"
              illustrationOffsetY={-56}
              heading="Podcasting for power users"
              caption="Level 2"
            />
            <PersonaBlock
              color="var(--color-sky)"
              illustrationSrc="/images/art/user-organizations.png"
              illustrationOffsetY={-14}
              heading="Corporate podcasters"
              caption="Level 3"
            />
            <QuickTipsBlock />
          </div>
        </nav>
      </div>
    </>
  );
};
