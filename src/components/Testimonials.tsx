import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {Body3, Body4, Caption, H1, H2} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {useIntersectionProgress} from '@/hooks/useIntersectionProgress';
import {useVisibleElements} from '@/hooks/useVisibleElements';
import {CAN_HOVER_MEDIA_QUERY, MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {AudioFiles, useSound} from '@/hooks/useSound';
import {SectionDivider} from './SectionDivider';
import {TestimonialQuotation, type Script} from './TestimonialQuotation';

import * as livingBlindfully from '../../public/testimonials/living-blindfully.json';
import * as makeLifeWork from '../../public/testimonials/make-life-work.json';

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

const padTime = (time: number) => `${time}`.padStart(2, '0');

const formatTime = (seconds: number) =>
  [padTime(Math.floor(seconds / 60)), padTime(seconds % 60)].join(':');

const scaleNumber = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  // Convert the original range to a [0..1] range.
  const standardValue = (value - x1) / (y1 - x1);
  // Convert the [0..1] range to the new range.
  const mappedValue = standardValue * (y2 - x2) + x2;
  // Clamp the value to be within the bounds of the new range.
  return Math.min(Math.max(mappedValue, x2), y2);
};

const SCROLL_PERCENTAGE_TO_SHOW_PLAYER = 0.03;
const SCROLL_PERCENTAGE_TO_HIDE_PLAYER = 0.945;

const scalePlayerEnter = (num: number) =>
  scaleNumber(num, 0, SCROLL_PERCENTAGE_TO_SHOW_PLAYER, 0.15, 1);

const scalePlayerExit = (num: number) =>
  1 - scaleNumber(num, 0, SCROLL_PERCENTAGE_TO_HIDE_PLAYER, 0.15, 1);

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
  TICKER_HEIGHT_SMALL + PLAYER_INSET_SMALL + QUOTE_HEIGHT_LARGE,
  TICKER_HEIGHT_LARGE + PLAYER_INSET_LARGE + QUOTE_HEIGHT_LARGE,
];
const [PLAYER_WIDTH_SMALL, PLAYER_WIDTH_LARGE] = [
  QUOTE_WIDTH_SMALL,
  QUOTE_WIDTH_LARGE,
];

const AudioPlayer = React.memo(
  React.forwardRef<AudioPlayerRef, AudioPlayerProps>(
    function AudioPlayer(testimonial, ref) {
      const css = useCSS();

      const playerRef = React.useRef<HTMLDivElement>(null);
      const quoteRef = React.useRef<HTMLDivElement>(null);
      const tickerWrapperRef = React.useRef<HTMLDivElement>(null);
      const tickerDotRef = React.useRef<HTMLDivElement>(null);
      const tickerTimeRef = React.useRef<HTMLDivElement>(null);

      const {
        element: audioElement,
        controls: {play, pause},
        state: {time: currentTimeSec, playing},
        ref: audioRef,
      } = useSound({sources: testimonial?.audioFiles, autoPlay: true});

      React.useImperativeHandle(ref, () => ({
        play,
        pause,
        slideTo(progress: number) {
          if (
            !playerRef.current ||
            !quoteRef.current ||
            !tickerWrapperRef.current ||
            !tickerDotRef.current ||
            !tickerTimeRef.current
          ) {
            return;
          }

          playerRef.current.style.transform = `translateX(${progress * 100}vw)`;
          playerRef.current.style.maxWidth = `calc(100vw - ${
            progress * 100
          }vw)`;

          const player = {
            opacity: playerRef.current.style.opacity,
            transform: playerRef.current.style.transform,
          };
          const quote = {
            opacity: quoteRef.current.style.opacity,
            transform: quoteRef.current.style.transform,
          };
          const tickerWrapper = {
            opacity: tickerWrapperRef.current.style.opacity,
            transform: tickerWrapperRef.current.style.transform,
          };
          const tickerDot = {
            transform: tickerDotRef.current.style.transform,
          };
          const tickerTime = {
            opacity: tickerTimeRef.current.style.opacity,
            transform: tickerTimeRef.current.style.transform,
          };

          if (progress <= SCROLL_PERCENTAGE_TO_SHOW_PLAYER) {
            tickerWrapper.transform = `scale(${scalePlayerEnter(progress)})`;

            tickerTime.opacity = '0';
            tickerTime.transform = `scale(${scalePlayerEnter(progress)})`;

            tickerDot.transform = `scale(${scalePlayerEnter(progress)})`;

            quote.opacity = '0';
          } else {
            tickerWrapper.transform = 'scale(1)';

            tickerTime.opacity = '1';
            tickerTime.transform = 'scale(1)';

            tickerDot.transform = `scale(${scalePlayerEnter(progress)})`;

            quote.opacity = '1';
          }

          if (progress >= SCROLL_PERCENTAGE_TO_HIDE_PLAYER) {
            tickerWrapper.transform = 'scale(0)';

            tickerTime.opacity = '0';
            tickerTime.transform = `scale(${scalePlayerExit(progress)})`;

            tickerDot.transform = `scale(${scalePlayerExit(progress)})`;

            quote.opacity = `${scalePlayerExit(progress)}`;
          } else if (progress === 1) {
            tickerWrapper.transform = 'scale(0)';

            tickerTime.opacity = '0';
            tickerTime.transform = 'scale(0)';

            tickerDot.transform = 'scale(0)';

            quote.opacity = '0';
          }

          playerRef.current.style.opacity = player.opacity;
          playerRef.current.style.transform = player.transform;

          tickerWrapperRef.current.style.opacity = tickerWrapper.opacity;
          tickerWrapperRef.current.style.transform = tickerWrapper.transform;

          tickerDotRef.current.style.transform = tickerDot.transform;

          tickerTimeRef.current.style.opacity = tickerTime.opacity;
          tickerTimeRef.current.style.transform = tickerTime.transform;

          quoteRef.current.style.opacity = quote.opacity;
          quoteRef.current.style.transform = quote.transform;
        },
      }));

      return (
        <div
          className={css({
            contain: 'size',
            display: 'grid',
            height: `${PLAYER_HEIGHT_SMALL}px`,
            left: '0',
            position: 'fixed',
            right: '0',
            top: '50lvh',
            width: '100%',
            zIndex: 4,
            [MIN_TABLET_MEDIA_QUERY]: {
              height: `${PLAYER_HEIGHT_LARGE}px`,
            },
          })}
        >
          <div
            ref={playerRef}
            className={css({
              // // As the child moves horizontally as the page is vertically scrolled, to improve the performance of
              // // the scroll-linked `transform` on the child, give hints to the browser to create a new stacking
              // // context that is independent of other styles on the page (enable containment for layout, paint, and size).
              // contain: 'strict',
              display: 'flex',
              flexDirection: 'column',
              height: `${PLAYER_HEIGHT_SMALL}px`,
              position: 'relative',
              // Vertically center this element so the ticker box intersects with
              // the viewport's sticky horizontal line.
              top: `-${(TICKER_HEIGHT_SMALL + 2) / 2}px`,
              transition: 'transform 0.1s linear',
              // if progress is ascending -> start from left
              transformOrigin: '0% 50%',
              // if progress is descending -> start from right
              // transformOrigin: '100% 50%',
              width: `${PLAYER_WIDTH_SMALL}px`,
              // When the `slideTo` method is called, a `transform` is applied
              // to slide this element horizontally with vertical page scrolls.
              willChange: 'opacity, transform, max-width',
              zIndex: -1,

              [MIN_TABLET_MEDIA_QUERY]: {
                height: `${PLAYER_HEIGHT_LARGE}px`,
                top: `-${(TICKER_HEIGHT_LARGE + 2) / 2}px`,
                width: `${PLAYER_WIDTH_LARGE}px`,
              },
            })}
          >
            {/* White pill for time ticker */}
            <div
              ref={tickerWrapperRef}
              className={css({
                transition: 'opacity 0.1s linear, transform 0.1s linear',
                alignSelf: 'flex-start',
                alignContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-space)',
                borderRadius: '300px',
                contain: 'content',
                display: 'flex',
                height: `${TICKER_HEIGHT_SMALL}px`,
                justifyContent: 'center',
                marginBottom: '10px',
                position: 'relative',
                transform: 'scaleX(0)',
                transformOrigin: '0% 50%',
                width: `${TICKER_WIDTH_SMALL}px`,
                willChange: 'opacity, transform',
                zIndex: 4,
                [MIN_TABLET_MEDIA_QUERY]: {
                  height: `${TICKER_HEIGHT_LARGE}px`,
                  width: `${TICKER_WIDTH_LARGE}px`,
                },
              })}
            >
              {audioElement}
              <div
                ref={tickerDotRef}
                className={css({
                  padding: '6px 14.5px',
                  transform: 'scaleX(0)',
                  transformOrigin: '10% 50%',
                  whiteSpace: 'nowrap',
                  willChange: 'opacity, transform',
                  width: `${TICKER_WIDTH_SMALL}px`,
                  [MIN_TABLET_MEDIA_QUERY]: {
                    padding: '10px 27.5px',
                    transformOrigin: '5% 50%',
                    width: `${TICKER_WIDTH_LARGE}px`,
                  },
                })}
              >
                <Caption
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    position: 'relative',
                    // Nudge the text so the vertical alignment is actually centered.
                    top: '0.5px',
                    fontSize: '10px',
                    lineHeight: '10px',
                    [MIN_TABLET_MEDIA_QUERY]: {
                      fontSize: '12px',
                      lineHeight: '12px',
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
                    className={css({
                      transition: 'transform 0.1s linear',
                      willChange: 'opacity',
                    })}
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
                height: `${QUOTE_HEIGHT_SMALL}px`,
                justifyContent: 'space-between',
                marginBottom: 'auto',
                opacity: 0,
                transition: 'opacity 0.1s linear, transform 0.1s linear',
                padding: '20px',
                textAlign: 'left',
                transformOrigin: '50% 50%',
                willChange: 'opacity, transform',
                width: `${QUOTE_WIDTH_SMALL}px`,
                [MIN_TABLET_MEDIA_QUERY]: {
                  height: `${QUOTE_HEIGHT_LARGE}px`,
                  width: `${QUOTE_WIDTH_LARGE}px`,
                },
              })}
            >
              <Body3 style={{fontSize: '20px'}}>
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
                  onClick={playing ? pause : play}
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
                      transition: 'color 0.2s',
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
        </div>
      );
    },
  ),
);

const CUSTOMER_BLOCK_STYLE: StyleObject = {
  display: 'grid',
  padding: '10vh 2vw',
  placeContent: 'center',
  textAlign: 'center',
  [MIN_TABLET_MEDIA_QUERY]: {
    paddingLeft: '10vw',
    paddingRight: '10vw',
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
        onProgress(target: HTMLDivElement, progress: number) {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.slideTo(progress);
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
        paddingBottom: '100px',
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
          position: 'relative',
          zIndex,
        })}
      >
        <div
          className={css({
            color: 'var(--color-space)',
            textAlign: 'center',
            margin: '264px 0 240px',
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
