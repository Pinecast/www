import Link from 'next/link';
import * as React from 'react';

import {MonumentGroteskSemiMono} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {FooterNavLinks} from './FooterNavLinks';
import {
  MOBILE_MEDIA_QUERY,
  CAN_HOVER_MEDIA_QUERY,
  DARK_SURFACE,
} from '@/constants';
import {useDarkSection} from '@/hooks/useDarkSection';
import {Codec, VideoMimeType, NoncriticalVideo} from './NoncriticalVideo';

const VIDEO_WIDTH = 1670;
const VIDEO_HEIGHT = 1045;
const ASPECT_RATIO = VIDEO_HEIGHT / VIDEO_WIDTH;

const LOGOTYPE = 'url(/images/logotype.svg)';
// On a phone, the logotype is a band of this height in the flow of the card,
// between the links and the legal row, with this much room above and below it.
const LOGOTYPE_HEIGHT_MOBILE = 60;
const LOGOTYPE_GAP_MOBILE = 16;
const CARD_SIDE_PADDING_MOBILE = 30;

export const Footer = () => {
  const css = useCSS();

  const ref = React.useRef<HTMLDivElement>(null);
  useDarkSection(ref);

  const legalLinkClass = css({
    color: 'var(--color-core-accent)',
    textDecoration: 'none',
    textUnderlineOffset: '0.2em',
    transition: 'color 0.2s',
    // A label wraps to the next row of the footer as a whole, not inside.
    whiteSpace: 'nowrap',
    ':hover': {
      [CAN_HOVER_MEDIA_QUERY]: {
        color: '#fff',
        textDecoration: 'underline',
      },
    },
  });

  return (
    <div
      className={css({
        backgroundColor: '#fe7575',
        overflow: 'hidden',
      })}
    >
      <div
        ref={ref}
        className={css({
          // Clip out a thin black border that wraps the video.
          margin: '-4px',
          paddingTop: `${ASPECT_RATIO * 100}%`,
          position: 'relative',
        })}
      >
        <NoncriticalVideo
          sources={[
            {
              src: '/videos/Footer2x.mp4',
              mimeType: VideoMimeType.MP4,
              codec: Codec.H264,
            },
            {
              src: '/videos/Footer2x.av1.mp4',
              mimeType: VideoMimeType.MP4,
              codec: Codec.AV1,
            },
          ]}
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

          // The floating mute button (MainHeader) covers the bottom left of
          // the screen up to 1180px: 120px wide, 48px high, 24px from the
          // bottom. At the end of the page, the page cannot scroll a link out
          // from under it, and on a phone the links of the footer wrap into
          // that corner. This room under the card is for the button: it floats
          // in the room, and not over the card.
          [MOBILE_MEDIA_QUERY]: {
            paddingBottom: '80px',
          },
        })}
      >
        <footer
          className={css({
            '--color-primary-dark': '#fff',
            '--color-primary-light': 'var(--color-space)',
            ...DARK_SURFACE,
            backgroundColor: 'var(--color-primary-light)',
            // The logotype stands 100px above the bottom of the card. This is
            // clear of the legal row, which is one line high. On a phone, the
            // row wraps to more lines, so the logotype is not here: see the
            // band below.
            backgroundImage: LOGOTYPE,
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
              backgroundImage: 'none',
              maxHeight: 'auto',
              minHeight: '630px',
              paddingLeft: `${CARD_SIDE_PADDING_MOBILE}px`,
              paddingRight: `${CARD_SIDE_PADDING_MOBILE}px`,
              paddingTop: '25px',
            },
          })}
        >
          <nav
            aria-label="Footer"
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
                ['/ai-use', 'AI Use'],
              ]}
            />
            <FooterNavLinks
              title="Follow along"
              links={[
                ['https://blog.pinecast.com', 'Blog'],
                ['https://bsky.app/profile/pinecast.bsky.social', 'Bluesky'],
                ['https://reddit.com/r/pinecast', 'Reddit'],
              ]}
            />
          </nav>
          {/* The logotype on a phone. It is a band in the flow of the card, so
              the card grows to hold it, and no text can run into it, however
              many lines the links and the legal row wrap to (also with the text
              spacing of WCAG 1.4.12). A logotype at a fixed distance from the
              bottom of the card did not do this: the legal row grew up into it.
              It stands out to the edges of the card, as the background of the
              card does on a larger screen. tests/footer.spec.ts finds it as the
              one element of the footer with a background image. */}
          <div
            className={css({
              display: 'none',
              [MOBILE_MEDIA_QUERY]: {
                display: 'block',
                flex: '1 0 auto',
                minHeight: `${LOGOTYPE_HEIGHT_MOBILE}px`,
                marginTop: `${LOGOTYPE_GAP_MOBILE}px`,
                marginBottom: `${LOGOTYPE_GAP_MOBILE}px`,
                marginLeft: `-${CARD_SIDE_PADDING_MOBILE}px`,
                marginRight: `-${CARD_SIDE_PADDING_MOBILE}px`,
                backgroundImage: LOGOTYPE,
                backgroundRepeat: 'repeat-x',
                backgroundSize: `auto ${LOGOTYPE_HEIGHT_MOBILE}px`,
                backgroundPosition: '-11px 100%',
              },
            })}
          />
          <div
            className={css({
              display: 'flex',
              gap: '50px',
              color: 'var(--color-core-accent)',
              borderTop: '1px solid var(--color-core-accent)',
              fontSize: '12px',
              paddingTop: '10px',
              paddingBottom: '20px',
              ...MonumentGroteskSemiMono,
              [MOBILE_MEDIA_QUERY]: {
                // The row has four items, and they do not fit on one line at
                // the width of a phone. The rows are 26px apart, so a link is
                // at least 24px from the links above and below it (WCAG 2.5.8).
                flexWrap: 'wrap',
                gap: '12px 16px',
                justifyContent: 'space-between',
              },
            })}
          >
            {/* tests/footer.spec.ts finds this row by the © line, and checks
                that each link in it fits, is clear of the mute button, and that
                the row is clear of the logotype. Add, remove or rename links
                as you need. Keep the © line and the links in the same
                element. */}
            <span>&copy; Pinecast 2026</span>
            <Link className={legalLinkClass} href="/terms">
              Terms &amp; conditions
            </Link>
            <Link className={legalLinkClass} href="/privacy">
              Privacy
            </Link>
            {/* The link to the accessibility statement is part of the
                documentation that Revised 508 (602.2) and EN 301 549 (12.1.1)
                need. Keep it in the footer of every page. */}
            <Link className={legalLinkClass} href="/features/accessibility">
              Accessibility
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
