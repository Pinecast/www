import {MonumentGroteskSemiMono} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {Body4, Caption} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {FooterNavLinks} from './FooterNavLinks';
import {MOBILE_MEDIA_QUERY} from '@/constants';
import React from 'react';
import { useDarkSection } from '@/hooks/useDarkSection';

export const Footer = () => {
  const css = useCSS();

  const ref = React.useRef<HTMLDivElement>(null);
  useDarkSection(ref);

  return (
    <div
      ref={ref}
      className={css({
        alignItems: 'flex-end',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '#f4578d',
        padding: '20px',
      })}
    >
      <footer
        className={css({
          '--color-primary-dark': '#f8f4eb',
          '--color-primary-light': '#090909',
          backgroundColor: 'var(--color-primary-light)',
          backgroundImage: 'url(/images/logotype.svg)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: '-50px calc(100% - 100px)',
          color: 'var(--color-primary-dark)',
          display: 'flex',
          flex: '1 1',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: '20px',
          height: '100%',
          maxHeight: '690px',
          paddingLeft: '83px',
          paddingRight: '83px',
          paddingTop: '83px',
          width: '100%',
          [MOBILE_MEDIA_QUERY]: {
            backgroundSize: 'auto 60px',
            backgroundPosition: '-11px calc(100% - 80px)',
            maxHeight: 'auto',
            paddingLeft: '30px',
            paddingRight: '30px',
            paddingTop: '25px',
          },
        })}
      >
        <nav
          className={css({
            display: 'grid',
            gap: '100px',
            gridTemplateColumns:
              '1fr fit-content(145px) fit-content(145px) fit-content(145px)',
            '@media (max-width: 1400px)': {
              display: 'flex',
              justifyContent: 'space-between',
              gap: '30px',
            },
            '@media (max-width: 900px)': {
              justifyContent: 'flex-start',
              gap: '100px',
            },
            [MOBILE_MEDIA_QUERY]: {
              flexDirection: 'column',
              gap: '30px',
            },
          })}
        >
          <div
            className={css({
              backgroundColor: 'var(--color-primary-light)',
              border: '1px solid var(--color-core-accent)',
              borderRadius: '10px',
              flexShrink: 2,
              padding: '23px 31px',
              maxWidth: '476px',
              width: '100%',
              '@media (max-width: 900px)': {
                display: 'none',
              },
            })}
          >
            <Body4 style={{marginBottom: '60px'}}>
              Pinecast is your batteries-included podcast hosting platform.
            </Body4>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              })}
            >
              <PrimaryButton href="https://pinecast.com/signup">
                Sign up
              </PrimaryButton>
              <Caption style={{color: 'var(--color-core-accent)'}}>
                No credit card required
              </Caption>
            </div>
          </div>
          <FooterNavLinks
            title="Features"
            links={[
              ['/features/distribution', 'Distribution'],
              ['/features/analytics', 'Analytics'],
              ['/features/monetization', 'Monetization'],
              ['/features', 'All features'],
            ]}
          />
          <FooterNavLinks
            title="Resources"
            links={[
              ['/learn', 'Learn'],
              ['https://help.pinecast.com', 'Support'],
              ['https://changelog.pinecast.com', 'Changelog'],
            ]}
          />
          <FooterNavLinks
            title="Follow along"
            links={[
              ['https://blog.pinecast.com', 'Blog'],
              ['https://twitter.com/getpinecast', 'Twitter'],
              ['https://reddit.com/r/pinecast', 'Reddit'],
            ]}
          />
        </nav>
        <div
          className={css({
            display: 'flex',
            gap: '50px',
            color: 'var(--color-core-accent)',
            borderTop: '1px solid var(--color-core-accent)',
            fontSize: '12px',
            paddingTop: '20px',
            paddingBottom: '20px',
            ...MonumentGroteskSemiMono,
            [MOBILE_MEDIA_QUERY]: {
              gap: 0,
              justifyContent: 'space-between',
            },
          })}
        >
          <span>&copy; Pinecast 2023</span>
          <Link
            className={css({
              color: 'var(--color-core-accent)',
              textDecoration: 'none',
              ':hover': {textDecoration: 'underline'},
            })}
            href="/terms"
          >
            Terms &amp; conditions
          </Link>
          <Link
            className={css({
              color: 'var(--color-core-accent)',
              textDecoration: 'none',
              ':hover': {textDecoration: 'underline'},
            })}
            href="/privacy"
          >
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
};
