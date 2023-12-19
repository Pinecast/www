import Link from 'next/link';
import * as React from 'react';

import {MonumentGroteskSemiMono} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {FooterNavLinks} from './FooterNavLinks';
import {MOBILE_MEDIA_QUERY, CAN_HOVER_MEDIA_QUERY} from '@/constants';
import {useDarkSection} from '@/hooks/useDarkSection';
import {NoncriticalVideo} from './NoncriticalVideo';

const VIDEO_WIDTH = 1670;
const VIDEO_HEIGHT = 1045;
const ASPECT_RATIO = VIDEO_HEIGHT / VIDEO_WIDTH;

export const Footer = () => {
  const css = useCSS();

  const ref = React.useRef<HTMLDivElement>(null);
  useDarkSection(ref);

  return (
    <div
      style={{
        background: '#ff6869',
        overflow: 'hidden',
      }}
    >
      <div
        ref={ref}
        style={{
          // Clip out a thin black border that wraps the video.
          margin: '-4px',
          paddingTop: `${ASPECT_RATIO * 100}%`,
          position: 'relative',
        }}
      >
        <NoncriticalVideo
          av1Source="/videos/Footer2x.av1.mp4"
          defaultSource="/videos/Footer2x.mp4"
          height={VIDEO_HEIGHT}
          width={VIDEO_WIDTH}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      <div
        className={css({
          alignItems: 'flex-end',
          marginTop: '-11%',
          minHeight: `calc(max(100vw * ${ASPECT_RATIO} - 380px, 70vh))`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingRight: '20px',
          paddingLeft: '20px',
          paddingBottom: '20px',
          position: 'relative',
        })}
      >
        <footer
          className={css({
            '--color-primary-dark': '#fff',
            '--color-primary-light': 'var(--color-space)',
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
            position: 'relative',
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
                textUnderlineOffset: '0.2em',
                transition: 'color 0.2s',
                ':hover': {
                  [CAN_HOVER_MEDIA_QUERY]: {
                    color: '#fff',
                    textDecoration: 'underline',
                  },
                },
              })}
              href="/terms"
            >
              Terms &amp; conditions
            </Link>
            <Link
              className={css({
                color: 'var(--color-core-accent)',
                textDecoration: 'none',
                textUnderlineOffset: '0.2em',
                transition: 'color 0.2s',
                ':hover': {
                  [CAN_HOVER_MEDIA_QUERY]: {
                    color: '#fff',
                    textDecoration: 'underline',
                  },
                },
              })}
              href="/privacy"
            >
              Privacy
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
