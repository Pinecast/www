import Link from 'next/link';
import * as React from 'react';

import {MonumentGroteskSemiMono} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {FooterNavLinks} from './FooterNavLinks';
import {
  MOBILE_MEDIA_QUERY,
  NOT_MIN_TABLET_MEDIA_QUERY,
  CAN_HOVER_MEDIA_QUERY,
  DARK_SURFACE,
} from '@/constants';
import {useDarkSection} from '@/hooks/useDarkSection';
import {Codec, VideoMimeType, NoncriticalVideo} from './NoncriticalVideo';

const VIDEO_WIDTH = 1670;
const VIDEO_HEIGHT = 1045;
const ASPECT_RATIO = VIDEO_HEIGHT / VIDEO_WIDTH;

const LOGOTYPE = 'url(/images/logotype.svg)';
// The logotype is a band in the flow of the card, between the links and the
// legal row, at all sizes. These are its height (the height of the image on a
// desktop) and the room that the card keeps above and below it. On a desktop,
// the room below is what put the logotype 100px above the bottom of the card,
// clear of a legal row that is one line high.
const LOGOTYPE_HEIGHT = 200;
const LOGOTYPE_GAP_ABOVE = 32;
const LOGOTYPE_GAP_BELOW = 52;
const CARD_SIDE_PADDING = 83;
const LOGOTYPE_OFFSET = -50;
const LOGOTYPE_HEIGHT_MOBILE = 60;
const LOGOTYPE_GAP_MOBILE = 16;
const CARD_SIDE_PADDING_MOBILE = 30;
const LOGOTYPE_OFFSET_MOBILE = -11;

// The room under the video that the card and its container have at least, so
// that the footer is as tall as the window, down to the aspect of the video.
const CONTAINER_MIN_HEIGHT = `max(100vw * ${ASPECT_RATIO} - 380px, 70vh)`;
// The room under the card. Where the floating mute button shows, it is room for
// the button (see the container below). The card's minimum height takes it
// away, so that the footer is still as tall as the window.
const CONTAINER_PADDING_BOTTOM = 20;
const CONTAINER_PADDING_BOTTOM_MUTE_BUTTON = 80;
// The card fills that room, but not past this height. A window that is taller
// has empty room above the card. A card whose content is taller than the room
// is taller, and so is the page.
const CARD_MAX_MIN_HEIGHT = 690;

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
          minHeight: `calc(${CONTAINER_MIN_HEIGHT})`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingRight: '20px',
          paddingLeft: '20px',
          '--footer-room': `${CONTAINER_PADDING_BOTTOM}px`,
          paddingBottom: 'var(--footer-room)',
          position: 'relative',

          // The floating mute button (MainHeader) covers the bottom left of
          // the screen up to 1180px: 120px wide, 48px high, 24px from the
          // bottom. At the end of the page, the page cannot scroll a link out
          // from under it. The legal row wraps on a phone, and wherever its
          // links do not fit, and a link then starts a line in that corner.
          // This room under the card is for the button wherever the button
          // shows: it floats in the room, and not over the card, however the
          // row wraps.
          [NOT_MIN_TABLET_MEDIA_QUERY]: {
            '--footer-room': `${CONTAINER_PADDING_BOTTOM_MUTE_BUTTON}px`,
          },
        })}
      >
        <footer
          className={css({
            '--color-primary-dark': '#fff',
            '--color-primary-light': 'var(--color-space)',
            ...DARK_SURFACE,
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            display: 'flex',
            flex: 'none',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '20px',
            // The card is as tall as its content, and no shorter than this.
            // It has no maximum height: a maximum would cut the card short of
            // its content, and the legal row would fall out of the card, on a
            // window that is zoomed or that has the text spacing of WCAG 1.4.12.
            minHeight: `min(${CONTAINER_MIN_HEIGHT} - var(--footer-room), ${CARD_MAX_MIN_HEIGHT}px)`,
            paddingLeft: `${CARD_SIDE_PADDING}px`,
            paddingRight: `${CARD_SIDE_PADDING}px`,
            paddingTop: '83px',
            position: 'relative',
            width: '100%',

            [MOBILE_MEDIA_QUERY]: {
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
          {/* The logotype. It is a band in the flow of the card, so the card
              grows to hold it, and no text can run into it, however many lines
              the links and the legal row wrap to, and however tall the window
              is (also with the text spacing of WCAG 1.4.12, and at 200% zoom).
              A logotype at a fixed distance from the bottom of the card did not
              do this: the card is as tall as the window, and on a short window
              the links went down onto the logotype, and on a phone the legal
              row grew up into it. If there is room, the band takes it, and the
              logotype stays at the bottom of the band. It stands out to the
              edges of the card. tests/footer.spec.ts finds it as the one
              element of the footer with a background image. */}
          <div
            className={css({
              flex: '1 0 auto',
              minHeight: `${LOGOTYPE_HEIGHT}px`,
              marginTop: `${LOGOTYPE_GAP_ABOVE}px`,
              marginBottom: `${LOGOTYPE_GAP_BELOW}px`,
              marginLeft: `-${CARD_SIDE_PADDING}px`,
              marginRight: `-${CARD_SIDE_PADDING}px`,
              backgroundImage: LOGOTYPE,
              backgroundRepeat: 'repeat-x',
              backgroundSize: `auto ${LOGOTYPE_HEIGHT}px`,
              backgroundPosition: `${LOGOTYPE_OFFSET}px 100%`,
              [MOBILE_MEDIA_QUERY]: {
                minHeight: `${LOGOTYPE_HEIGHT_MOBILE}px`,
                marginTop: `${LOGOTYPE_GAP_MOBILE}px`,
                marginBottom: `${LOGOTYPE_GAP_MOBILE}px`,
                marginLeft: `-${CARD_SIDE_PADDING_MOBILE}px`,
                marginRight: `-${CARD_SIDE_PADDING_MOBILE}px`,
                backgroundSize: `auto ${LOGOTYPE_HEIGHT_MOBILE}px`,
                backgroundPosition: `${LOGOTYPE_OFFSET_MOBILE}px 100%`,
              },
            })}
          />
          <div
            className={css({
              display: 'flex',
              // The row has four items. They do not fit on one line at the
              // width of a phone, and they wrap. The rows are 26px apart, so a
              // link is at least 24px from the links above and below it
              // (WCAG 2.5.8).
              flexWrap: 'wrap',
              gap: '12px 50px',
              color: 'var(--color-core-accent)',
              borderTop: '1px solid var(--color-core-accent)',
              fontSize: '12px',
              paddingTop: '10px',
              paddingBottom: '20px',
              ...MonumentGroteskSemiMono,
              [MOBILE_MEDIA_QUERY]: {
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
              {/* Up to 900px the link says only "Terms". Then the row fits on
                  one line from about 500px, also with the text spacing of WCAG
                  1.4.12: with the long label it wrapped from 701px to 785px.
                  The rest of the label is hidden from a screen reader too, so
                  the name of the link is the text that it shows (WCAG 2.5.3).
                  If you change the label, keep its first word as the short
                  form, or shorten it in another way. */}
              Terms
              <span
                className={css({
                  '@media (max-width: 900px)': {display: 'none'},
                })}
              >
                {' & conditions'}
              </span>
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
