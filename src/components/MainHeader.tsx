import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {MOBILE_MEDIA_QUERY} from '@/constants';
import Link from 'next/link';
import {SignIn} from '@/icons/SignIn';
import {MainHeaderLink} from './MainHeaderLink';
import {Hamburger} from '@/icons/Hamburger';
import {useDismiss} from '@/hooks/useDismiss';
import {Body1, Caption} from './Typography';

const NavLevelColumn = ({
  heading,
  caption,
  color,
}: {
  heading: React.ReactNode | string;
  caption: React.ReactNode | string;
  color: string;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        background: color,
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
          background: color,
          border: '1px solid var(--color-line)',
          borderRadius: '10px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          padding: '30px 20px',
          width: '100%',
        })}
      >
        <Body1 as="h3" style={{maxWidth: '10em'}}>
          {heading}
        </Body1>
        <Caption
          style={{
            color: 'var(--color-core-accent)',
            marginBottom: '8px',
          }}
        >
          {caption}
        </Caption>
      </header>
    </div>
  );
};

export const MainHeader = () => {
  const css = useCSS();
  const navRef = React.useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = React.useState(false);

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
          height: '80px',
          justifyContent: 'space-between',
          left: '20px',
          padding: '20px',
          position: 'fixed',
          right: '20px',
          top: '20px',
          transition:
            'background-color 0.2s, border-color 0.2s, border-radius 0.2s',
          zIndex: navOpen ? 130 : 95,
          [MOBILE_MEDIA_QUERY]: {
            height: '60px',
            top: '10px',
            left: '10px',
            right: '10px',
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
            display: 'none',
            WebkitAppearance: 'none',
            [MOBILE_MEDIA_QUERY]: {display: 'flex'},
          })}
          onClick={() => {
            setNavOpen(prevNavOpen => !prevNavOpen);
          }}
        >
          <Hamburger size={24} color="var(--color-primary-dark)" />
        </button>
        <div
          className={css({
            display: 'flex',
            gap: '0 1px',
            alignItems: 'center',
            marginLeft: '-15px',
            [MOBILE_MEDIA_QUERY]: {display: 'none'},
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
            display: 'flex',
            gap: '20px',
            [MOBILE_MEDIA_QUERY]: {display: 'none'},
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
            display: 'none',
            [MOBILE_MEDIA_QUERY]: {display: 'flex'},
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
          height: '51vh',
          justifyContent: 'flex-start',
          left: '20px',
          opacity: navOpen ? 1 : 0,
          pointerEvents: navOpen ? 'all' : 'none',
          position: 'fixed',
          right: '20px',
          top: navOpen ? '82px' : '80px',
          transition: 'opacity 0.2s 0.1s, top 0.2s',
          visibility: navOpen ? 'visible' : 'hidden',
          zIndex: navOpen ? 130 : 90,
          [MOBILE_MEDIA_QUERY]: {
            height: '92vh',
            top: navOpen ? '70px' : '70px',
            left: '10px',
            right: '10px',
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
            transition: 'all 0.4s',
            [MOBILE_MEDIA_QUERY]: {
              height: 'auto',
              top: '10px',
              left: '10px',
              right: '10px',
            },
          })}
        >
          <div
            className={css({
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(4, 1fr)',
              [MOBILE_MEDIA_QUERY]: {
                gridTemplateColumns: '1fr',
              },
            })}
          >
            <NavLevelColumn
              color="var(--color-orchid)"
              heading="Podcasting for beginners"
              caption="Level 1"
            />
            <NavLevelColumn
              color="var(--color-lime)"
              heading="Podcasting for power users"
              caption="Level 2"
            />
            <NavLevelColumn
              color="var(--color-sky)"
              heading="Corporate podcasters"
              caption="Level 3"
            />
            {/* <div
              className={css({
                background: 'green',
                border: '1px solid #000',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: '10px',
              })}
            >
              <header
                className={css({
                  background: 'var(--color-lime)',
                  border: '1px solid #000',
                  borderRadius: '10px',
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  padding: '30px 20px',
                })}
              >
                <Body1 as="h3">Podcasting for power users</Body1>
                <Caption
                  style={{
                    color: 'var(--color-core-accent)',
                    marginBottom: '8px',
                  }}
                >
                  Level 2
                </Caption>
              </header>
            </div>
            <div
              className={css({
                background: 'blue',
                borderRadius: '20px',
              })}
            >
              <Caption style={{color: 'var(--color-core-accent)'}}>
                Level 3
              </Caption>
              <Body1 as="h3">Podcasting for beginners</Body1>
            </div> */}
            <div
              className={css({
                background: 'var(--color-primary-dark)',
                borderRadius: '20px',
                color: 'var(--color-theme-mode)',
                padding: '30px',
              })}
            >
              <Body1 as="h3">Quick tips for getting started</Body1>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};
