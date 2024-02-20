import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {Body3, Body4, Caption, H1, H2} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {useIntersectionProgress} from '@/hooks/useIntersectionProgress';
import {useVisibleElements} from '@/hooks/useVisibleElements';
import {
  CAN_HOVER_MEDIA_QUERY,
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {useAudioManager} from '@/hooks/useAudioManager';
import {AudioFiles, useSound} from '@/hooks/useSound';
import {SectionDivider} from './SectionDivider';
import {TestimonialQuotation, type Script} from './TestimonialQuotation';

import * as livingBlindfully from '../../public/testimonials/living-blindfully.json';
import * as makeLifeWork from '../../public/testimonials/make-life-work.json';

const supportsWAAPI = () =>
  Boolean(
    typeof window !== 'undefined' &&
      Object.hasOwnProperty.call(Element.prototype, 'animate'),
  );

type Testimonial = {
  audioFiles?: AudioFiles;
  audioDuration: number;
  color: string;
  customer: string;
  joinYear: number;
  quotation: string;
  quotationStartIdx: number;
  script: Script;
};

const TESTIMONIALS: Testimonial[] = [
  {
    audioFiles: {
      opus: '/testimonials/living-blindfully.opus.webm',
      mp3: '/testimonials/living-blindfully.mp3',
      aac: '/testimonials/living-blindfully.m4a',
    },
    audioDuration: 49,
    color: 'var(--color-lime)',
    customer: 'Living Blindfully',
    joinYear: 2020,
    quotation:
      'I started podcasting in 2004 and have worked with quite a few podcast hosting companies over the years. Nothing has come close to Pinecast',
    quotationStartIdx: 8,
    script: livingBlindfully,
  },
  {
    audioFiles: {
      opus: '/testimonials/make-life-work.opus.webm',
      mp3: '/testimonials/make-life-work.mp3',
      aac: '/testimonials/make-life-work.m4a',
    },
    audioDuration: 23,
    color: 'var(--color-sky)',
    customer: 'Make Life Work',
    joinYear: 2019,
    quotation:
      "Over the past five years or so, I've trusted Pinecast to reliably host all my podcasts.",
    quotationStartIdx: 14,
    script: makeLifeWork,
  },
];

const ANIMATION_OPTIONS: KeyframeAnimationOptions = {
  duration: 100,
  easing: 'linear',
};

const padTime = (time: number) => `${time}`.padStart(2, '0');

const formatTime = (seconds: number) =>
  [padTime(Math.floor(seconds / 60)), padTime(seconds % 60)].join(':');

type AudioPlayerRef = {
  play(): void;
  pause(): void;
  slideTo(progress: number): void;
};

type AudioPlayerProps = Omit<Testimonial, 'color'> & {};

const [TICKER_WIDTH_SMALL, TICKER_WIDTH_LARGE] = [110, 160];
const [TICKER_HEIGHT_SMALL, TICKER_HEIGHT_LARGE] = [30, 40];

const [QUOTE_HEIGHT_SMALL, QUOTE_HEIGHT_LARGE] = [190, 207];
const [QUOTE_WIDTH_SMALL, QUOTE_WIDTH_LARGE] = [294, 344];

const [PLAYER_INSET_SMALL, PLAYER_INSET_LARGE] = [10, 10];
const [PLAYER_HEIGHT_SMALL, PLAYER_HEIGHT_LARGE] = [
  TICKER_HEIGHT_SMALL / 2 + PLAYER_INSET_SMALL + QUOTE_HEIGHT_SMALL,
  TICKER_HEIGHT_LARGE / 2 + PLAYER_INSET_LARGE + QUOTE_HEIGHT_LARGE,
];
const [PLAYER_WIDTH_SMALL, PLAYER_WIDTH_LARGE] = [
  QUOTE_WIDTH_SMALL,
  QUOTE_WIDTH_LARGE,
];

const AudioPlayer = React.memo(
  React.forwardRef<AudioPlayerRef, AudioPlayerProps>(
    function AudioPlayer(testimonial, ref) {
      const css = useCSS();

      const quoteRef = React.useRef<HTMLDivElement>(null);
      const tickerWrapperRef = React.useRef<HTMLDivElement>(null);
      const tickerInnerRef = React.useRef<HTMLDivElement>(null);
      const tickerTimeRef = React.useRef<HTMLDivElement>(null);

      const animationsRef = React.useRef<Animation[]>([]);

      const {muted: globalMuted, setMuted: setGlobalMuted} = useAudioManager();

      const {
        element: audioElement,
        controls: {play, pause, mute, unmute},
        state: {time: currentTimeSec, playing},
        ref: audioRef,
      } = useSound({
        sources: testimonial?.audioFiles,
        autoPlay: supportsWAAPI(),
        muted: globalMuted,
      });

      React.useEffect(() => {
        if (globalMuted) {
          mute();
        } else {
          unmute();
        }
      }, [globalMuted, mute, unmute]);

      React.useImperativeHandle(ref, () => ({
        play,
        pause,
        async slideTo(progress: number) {
          if (
            !supportsWAAPI() ||
            !quoteRef.current ||
            !tickerWrapperRef.current ||
            !tickerInnerRef.current ||
            !tickerTimeRef.current
          ) {
            return;
          }

          if (animationsRef.current.length) {
            // Reuse animation and scrub to new time.
            animationsRef.current.forEach(animation => {
              animation.currentTime = progress * 100;
            });
            return;
          }

          const tickerWrapperStart = 0.05;
          const animationTickerWrapperScale = tickerWrapperRef.current.animate(
            [
              {scale: '0', offset: 0, transformOrigin: '0 50%'},
              {
                scale: '0.5',
                offset: tickerWrapperStart,
                transformOrigin: '0 50%',
              },
              {
                scale: '1',
                offset: tickerWrapperStart * 2,
                transformOrigin: '0 50%',
              },
              {
                scale: '1',
                offset: 1 - tickerWrapperStart * 2,
                transformOrigin: '100% 50%',
              },
              {
                scale: '0.5',
                offset: 1 - tickerWrapperStart,
                transformOrigin: '100% 50%',
              },
              {
                scale: '0',
                offset: 1,
                transformOrigin: '100% 50%',
              },
            ],
            ANIMATION_OPTIONS,
          );
          animationsRef.current.push(animationTickerWrapperScale);

          const tickerInnerStart = tickerWrapperStart;
          const animationTickerDot = tickerInnerRef.current.animate(
            [
              {scale: '0', offset: 0},
              {scale: '1', offset: tickerInnerStart},
              {scale: '1', offset: 1 - tickerInnerStart},
              {scale: '0', offset: 1},
            ],
            ANIMATION_OPTIONS,
          );
          animationsRef.current.push(animationTickerDot);

          const tickerTimeStart = tickerWrapperStart;
          const animationTickerTime = tickerTimeRef.current.animate(
            [
              {opacity: 0, offset: 0},
              {opacity: 0, offset: tickerTimeStart},
              {opacity: 1, offset: tickerTimeStart + 0.01},
              {opacity: 1, offset: 1 - (tickerTimeStart + 0.01)},
              {opacity: 0, offset: 1 - tickerTimeStart},
              {opacity: 0, offset: 1},
            ],
            ANIMATION_OPTIONS,
          );
          animationsRef.current.push(animationTickerTime);

          const quoteStart = tickerWrapperStart;
          const animationQuoteScale = quoteRef.current.animate(
            [
              {scale: '0', offset: 0, opacity: '0', transformOrigin: '0 0'},
              {
                scale: '0',
                opacity: '0',
                offset: quoteStart / 2,
                transformOrigin: '0 0',
              },
              {
                scale: '1',
                opacity: '1',
                offset: quoteStart,
                transformOrigin: '0 0',
              },
              {
                scale: '1',
                opacity: '1',
                offset: 1 - (quoteStart + 0.01),
                transformOrigin: '90% 0',
              },
              {
                scale: '1',
                opacity: '1',
                offset: 1 - quoteStart,
                transformOrigin: '90% 0',
              },
              {
                scale: '0',
                offset: 1,
                transformOrigin: '100% 0',
                opacity: '0',
              },
            ],
            ANIMATION_OPTIONS,
          );
          animationsRef.current.push(animationQuoteScale);

          const animationTickerWrapperPan = tickerWrapperRef.current.animate(
            [
              {translate: '0 0', transformOrigin: '0% 50%'},
              {
                translate: 'calc(100vw - var(--ticker-width) + 10px) 0',
                transformOrigin: '100% 50%',
              },
            ],
            ANIMATION_OPTIONS,
          );
          animationsRef.current.push(animationTickerWrapperPan);

          const animationQuotePan = quoteRef.current.animate(
            [
              {translate: '0 0'},
              {
                translate: 'calc(100vw - var(--player-width)) 0',
                transformOrigin: '100% 0%',
              },
            ],
            ANIMATION_OPTIONS,
          );
          animationsRef.current.push(animationQuotePan);

          // Scrub the 100ms-long animation based on the scroll-progress percentage.
          animationsRef.current.forEach(animation => {
            animation.currentTime = progress * 100;
            animation.pause();
          });
        },
      }));

      return (
        <div
          className={css({
            '--player-height': `${PLAYER_HEIGHT_SMALL}px`,
            '--player-width': `${PLAYER_WIDTH_SMALL}px`,
            '--quote-height': `${QUOTE_HEIGHT_SMALL}px`,
            '--quote-width': `${QUOTE_WIDTH_SMALL}px`,
            '--ticker-height': `${TICKER_HEIGHT_SMALL}px`,
            '--ticker-width': `${TICKER_WIDTH_SMALL}px`,
            contain: 'size',
            display: 'grid',
            height: 'var(--player-height)',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '50lvh',
            zIndex: 4,
            [MIN_TABLET_MEDIA_QUERY]: {
              '--player-height': `${PLAYER_HEIGHT_LARGE}px`,
              '--player-width': `${PLAYER_WIDTH_LARGE}px`,
              '--quote-height': `${QUOTE_HEIGHT_LARGE}px`,
              '--quote-width': `${QUOTE_WIDTH_LARGE}px`,
              '--ticker-height': `${TICKER_HEIGHT_LARGE}px`,
              '--ticker-width': `${TICKER_WIDTH_LARGE}px`,
            },
          })}
        >
          {audioElement}
          {/* White pill for time ticker */}
          <div
            ref={tickerWrapperRef}
            className={css({
              alignContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-space)',
              borderRadius: '300px',
              contain: 'strict',
              display: 'flex',
              height: 'var(--ticker-height)',
              justifyContent: 'center',
              position: 'absolute',
              scale: '0',
              top: 'calc(-0.5px - 0.5 * var(--ticker-height))',
              transformOrigin: '0% 50%',
              transition: '0.2s linear',
              translate: '0',
              width: 'var(--ticker-width)',
              zIndex: 4,
            })}
          >
            <div
              ref={tickerInnerRef}
              className={css({
                borderRadius: 'inherit',
                padding: '6px 14.5px',
                scale: '0',
                transition: '0.2s linear',
                whiteSpace: 'nowrap',
                [MIN_TABLET_MEDIA_QUERY]: {
                  padding: '10px 27.5px',
                  transformOrigin: '5% 50%',
                },
              })}
            >
              <Caption
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  fontSize: '10px',
                  position: 'relative',
                  top: '0.5px',
                  lineHeight: '1',
                  [MIN_TABLET_MEDIA_QUERY]: {
                    fontSize: '12px',
                  },
                  '::before': {
                    backgroundColor: 'var(--color-space)',
                    borderRadius: '100%',
                    content: '""',
                    display: 'block',
                    height: '4px',
                    marginRight: '7px',
                    position: 'relative',
                    top: '-0.5px',
                    width: '4px',
                    [MIN_TABLET_MEDIA_QUERY]: {
                      height: '9px',
                      marginRight: '10px',
                      width: '9px',
                    },
                  },
                }}
              >
                <span
                  ref={tickerTimeRef}
                  className={css({opacity: 0, transition: '0.2s linear'})}
                >{`${formatTime(Math.trunc(currentTimeSec))} / ${formatTime(
                  testimonial.audioDuration,
                )}`}</span>
              </Caption>
            </div>
          </div>
          {/* Black box for quotation */}
          <div
            ref={quoteRef}
            className={css({
              alignSelf: 'flex-end',
              backgroundColor: 'var(--color-space)',
              borderRadius: '10px',
              color: 'var(--color-core-accent)',
              contain: 'content',
              display: 'flex',
              flexDirection: 'column',
              height: 'var(--quote-height)',
              justifyContent: 'space-between',
              padding: '20px',
              position: 'relative',
              scale: '0',
              textAlign: 'left',
              top: 'var(calc(--ticker-height) + 2) / 2',
              transition: '0.2s linear',
              translate: '0',
              width: 'var(--quote-width)',
            })}
          >
            <Body3
              style={{
                fontSize: '20px',
                lineHeight: '22px',
                [TABLET_MEDIA_QUERY]: {
                  fontSize: '16px',
                  lineHeight: '18px',
                },
                [MOBILE_MEDIA_QUERY]: {
                  fontSize: '14px',
                  lineHeight: '16px',
                },
              }}
            >
              <TestimonialQuotation
                audio={audioRef}
                script={testimonial.script}
                quotation={testimonial.quotation}
                quotationStartIdx={testimonial.quotationStartIdx}
              />
            </Body3>
            <footer
              className={css({
                display: 'grid',
                gap: '0.125em 10px',
                gridTemplateColumns: '1fr 1fr',
                whiteSpace: 'nowrap',
                width: '100%',
              })}
            >
              <Caption
                style={{
                  color: 'var(--color-white)',
                  gridColumn: '1 / -1',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {testimonial.customer}
              </Caption>
              <Caption
                style={{
                  lineHeight: 1.2,
                  marginBottom: '-0.275em',
                }}
              >
                {`Customer since ${testimonial.joinYear}`}
              </Caption>
              <button
                type="button"
                className={css({all: 'unset', appearance: 'none'})}
                onClick={() => {
                  if (playing) {
                    pause();
                  } else {
                    setGlobalMuted(false);
                    play();
                  }
                }}
              >
                <Caption
                  style={{
                    color: 'var(--color-white)',
                    cursor: 'pointer',
                    lineHeight: 1.2,
                    marginTop: '-0.125em',
                    marginBottom: 'calc(-0.275em - 20px)',
                    marginRight: '-20px',
                    paddingTop: '0.125em',
                    paddingRight: '20px',
                    paddingBottom: '20px',
                    textAlign: 'right',
                    textDecoration: 'none',
                    textUnderlineOffset: '0.42em',
                    transition: 'color 0.2s ease-in-out',
                    position: 'relative',
                    zIndex: 9,
                    ':hover': {
                      [CAN_HOVER_MEDIA_QUERY]: {
                        color: 'var(--color-core-accent)',
                        textDecoration: 'underline',
                      },
                    },
                  }}
                >
                  {playing ? 'Pause' : 'Play'}
                </Caption>
              </button>
            </footer>
          </div>
        </div>
      );
    },
  ),
);

const CUSTOMER_BLOCK_STYLE: StyleObject = {
  display: 'grid',
  marginBottom: '-9vh',
  marginTop: '-10vh',
  paddingBottom: '10vh',
  paddingLeft: '10vw',
  paddingRight: '10vw',
  paddingTop: '14vh',
  placeContent: 'center',
  textAlign: 'center',

  [MIN_TABLET_MEDIA_QUERY]: {
    marginBottom: '-4vh',
    marginTop: '-12vh',
    paddingBottom: '1vh',
    paddingLeft: '10vw',
    paddingRight: '10vw',
    paddingTop: '24vh',
  },
};

const Customers = ({}) => {
  const css = useCSS();

  const audioPlayerRef = React.useRef<AudioPlayerRef>(null);

  const customersRef = React.useRef<Element[]>([]);

  const addCustomerRef = (index: number) => (el: Element | null) => {
    if (!el) {
      return;
    }
    customersRef.current[index] = el;
  };

  const [visibleCustomer] = useVisibleElements(customersRef, {
    // Observe when a customer block intersects at the middle of viewport, where StickyLine is
    rootMargin: '-50% 0% -50% 0%',
  });

  const currentTestimonial =
    visibleCustomer &&
    TESTIMONIALS[customersRef.current.findIndex(el => el === visibleCustomer)];

  React.useEffect(() => {
    if (currentTestimonial) {
      document.body.style.setProperty('--page-bg', currentTestimonial.color);
      audioPlayerRef.current?.play();
    }
    return () => {
      document.body.style.removeProperty('--page-bg');
    };
  }, [currentTestimonial]);

  const intersectionProgressRef = React.useRef<HTMLDivElement>(null);
  useIntersectionProgress(
    intersectionProgressRef,
    React.useMemo(
      () => ({
        async onProgress(target: HTMLDivElement, progress: number) {
          if (audioPlayerRef.current) {
            await audioPlayerRef.current.slideTo(progress);
          }
        },
      }),
      [],
    ),
  );

  return (
    <div
      className={css({
        marginTop: '-10vh',
        // Intentional: 'clip' vs. 'hidden' with a negative margin below to conceal the height of the Sticky Façade.
        overflow: 'clip',
        paddingBottom: '130px',
        position: 'relative',
        textAlign: 'center',
        textWrap: 'balance',
      })}
    >
      {currentTestimonial && (
        <AudioPlayer ref={audioPlayerRef} {...currentTestimonial} />
      )}
      <div
        className={css({
          // Workaround for Safari layering bug when scrolling past `position: sticky` elements.
          // @see https://bugs.webkit.org/show_bug.cgi?id=168725
          transform: 'translate3d(0,0,0)',
        })}
        ref={intersectionProgressRef}
      >
        <div
          className={css({
            // Sticky Façade — hides the bottom half of the viewport for
            // the scrolling text effect. The outlined text appears on top.
            // After scrolling past the viewport center, the filled text appears.
            backgroundColor: 'var(--page-bg, var(--color-sand))',
            height: '50lvh',
            left: '0',
            marginBottom: 'calc(-50vh - 100px)',
            position: 'sticky',
            right: '0',
            // Intentional: 'top' vs. 'bottom' so the position remains fixed for mobile browsers with
            // viewports that expand/shrink the address bar chrome based on scroll direction.
            top: '50lvh',
            transition: 'background 0.2s ease-in-out',
            width: '100%',
          })}
        />
        <div
          aria-hidden="true"
          role="presentation"
          className={css({
            // Invisible text to ensure the height for the absolutely
            // stacked characters below is identical to their height
            // if they were positioned statically.
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
          })}
        >
          {TESTIMONIALS.map(item => (
            <div key={item.customer} className={css(CUSTOMER_BLOCK_STYLE)}>
              <H1>{item.customer}</H1>
            </div>
          ))}
        </div>

        <div
          className={css({
            // Outlined Text
            color: 'var(--color-space)',
            left: '0',
            position: 'absolute',
            right: '0',
            top: '0',
            transform: 'translate3d(0,0,0)',
            WebkitTextFillColor: 'transparent',
            WebkitTextStrokeColor: 'var(--color-space)',
            WebkitTextStrokeWidth: 'thin',
          })}
        >
          {TESTIMONIALS.map(item => (
            <div key={item.customer} className={css(CUSTOMER_BLOCK_STYLE)}>
              <H1>{item.customer}</H1>
            </div>
          ))}
        </div>

        <div
          className={css({
            // Filled Text
            color: 'var(--color-space)',
            left: '0',
            position: 'absolute',
            right: '0',
            transform: 'translate3d(0,0,0)',
            top: '0',
            WebkitTextFillColor: 'var(--color-space)',
            WebkitTextStrokeColor: 'var(--color-space)',
            WebkitTextStrokeWidth: 'thin',
            zIndex: -1,
          })}
        >
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={item.customer}
              ref={addCustomerRef(idx)}
              className={css(CUSTOMER_BLOCK_STYLE)}
            >
              <H1>{item.customer}</H1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Testimonials = ({
  topPosition = 0,
  zIndex,
}: {
  topPosition?: number;
  zIndex: number;
}) => {
  const css = useCSS();
  return (
    <>
      <section
        id="testimonials"
        className={css({
          cursor: 'default',
          marginTop: `${topPosition}px`,
          paddingTop: topPosition < 0 ? `${topPosition * -1}px` : '0',
          paddingBottom: '140px',
          position: 'relative',
          zIndex,
          [MIN_TABLET_MEDIA_QUERY]: {
            paddingBottom: '120px',
          },
        })}
      >
        <div
          className={css({
            color: 'var(--color-space)',
            textAlign: 'center',
            margin: '264px 0 220px',
            [MIN_TABLET_MEDIA_QUERY]: {
              margin: '260px 0 216px',
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
                margin: '260px 0 240px',
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
                Don&rsquo;t just take our word for it
              </H2>
              <Body4
                style={{
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
                We take pride in running a top-notch service. People really like
                us. So much so, they left nice messages for you.
              </Body4>
            </div>
            <div
              className={css({
                gridColumnStart: '6',
                gridColumnEnd: '-6',
                margin: '0 -40px',
                [MIN_TABLET_MEDIA_QUERY]: {
                  gridColumnStart: '6',
                  gridColumnEnd: '8',
                  margin: '0 10px',
                },
              })}
            >
              <SecondaryButton
                href="https://pinecast.com/signup"
                style={{
                  backgroundColor: 'var(--page-bg, var(--color-sand))',
                  color: 'var(--color-space)',
                  display: 'grid',
                  lineHeight: '1.2',
                  placeContent: 'center',
                  marginBottom: '30px',
                  minHeight: '48px',
                  transition: 'background-color 0.2s ease-in-out',
                  whiteSpace: 'nowrap',
                }}
              >
                Start for free
              </SecondaryButton>
              <Caption style={{color: 'var(--color-core-accent)'}}>
                No credit card required
              </Caption>
            </div>
          </div>
        </div>
        <Customers />
      </section>
      <SectionDivider />
    </>
  );
};
