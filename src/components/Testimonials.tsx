import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {Body3, Body4, Caption, H1, H2} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {useIntersectionProgress} from '@/hooks/useIntersectionProgress';
import {useVisibleElements} from '@/hooks/useVisibleElements';
import {CAN_HOVER_MEDIA_QUERY, MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {AudioFiles, useSound} from '@/hooks/useSound';

type Testimonial = {
  audioFiles?: AudioFiles;
  audioDuration: number;
  color: string;
  customer: string;
  joinYear: number;
  quotation: React.ReactNode | string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    audioFiles: {
      vorbis: '/testimonials/living-blindfully.vorbis.ogg',
      opus: '/testimonials/living-blindfully.opus.webm',
      mp3: '/testimonials/living-blindfully.mp3',
      aac: '/testimonials/living-blindfully.aac',
    },
    audioDuration: 49,
    color: 'sand',
    customer: 'Living Blindfully',
    joinYear: 1999,
    quotation: (
      <>
        Ease of use, reliability, accessibility, and support. I&rsquo;m a huge
        Pinecast fan. I recommend them unreservedly.
      </>
    ),
  },
  {
    audioFiles: {
      vorbis: '/testimonials/girls-girls-girls-podcast.vorbis.ogg',
      opus: '/testimonials/girls-girls-girls-podcast.opus.webm',
      mp3: '/testimonials/girls-girls-girls-podcast.mp3',
      aac: '/testimonials/girls-girls-girls-podcast.aac',
    },
    audioDuration: 30,
    color: 'lime',
    customer: 'Girls! Girls! Girls! Podcast',
    joinYear: 2021,
    quotation: (
      <>
        Pinecast is the absolute best in the game. The perfect one-stop shop for
        all our podcasting services.
      </>
    ),
  },
  {
    audioFiles: {
      vorbis: '/testimonials/digging-dexter-podcast.vorbis.ogg',
      opus: '/testimonials/digging-dexter-podcast.opus.webm',
      mp3: '/testimonials/digging-dexter-podcast.mp3',
      aac: '/testimonials/digging-dexter-podcast.aac',
    },
    audioDuration: 40,
    color: 'orchid',
    customer: 'Digging Dexter Podcast',
    joinYear: 2016,
    quotation: (
      <>
        Pinecast has given me all the tools I need to thrive, while ensuring
        I&rsquo;m never concerned about storage, length, size or volume.
      </>
    ),
  },
  {
    audioFiles: {
      vorbis: '/testimonials/the-newsroom-podcast-podcast.vorbis.ogg',
      opus: '/testimonials/the-newsroom-podcast-podcast.opus.webm',
      mp3: '/testimonials/the-newsroom-podcast-podcast.mp3',
      aac: '/testimonials/the-newsroom-podcast-podcast.aac',
    },
    audioDuration: 50,
    color: 'sky',
    customer: 'The Newsroom Podcast',
    joinYear: 2022,
    quotation: (
      <>
        Pinecast is the bee&rsquo;s knees. What else could we ever ask for?
        Perfection.
      </>
    ),
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

      const {audio, isPlaying, play, pause} = useSound(testimonial.audioFiles!);

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

      // TODO: Proxy this property to be live.
      const currentTimeSec = 0 ?? audio?.currentTime;

      return (
        <div
          className={css({
            // As the child moves horizontally as the page is vertically scrolled, to improve the performance of
            // the scroll-linked `transform` on the child, give hints to the browser to create a new stacking
            // context that is independent of other styles on the page (enable containment for layout, paint, and size).
            content: 'strict',
            display: 'grid',
            height: `${PLAYER_HEIGHT_SMALL}px`,
            left: '0',
            position: 'fixed',
            right: '0',
            top: '50dvh',
            width: '100%',
            zIndex: 2,
            [MIN_TABLET_MEDIA_QUERY]: {
              height: `${PLAYER_HEIGHT_LARGE}px`,
            },
          })}
        >
          <div
            ref={playerRef}
            className={css({
              contain: 'strict',
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
              willChange: 'opacity, transform',
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
                [MIN_TABLET_MEDIA_QUERY]: {
                  height: `${TICKER_HEIGHT_LARGE}px`,
                  width: `${TICKER_WIDTH_LARGE}px`,
                },
              })}
            >
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
                  >{`${formatTime(currentTimeSec)} / ${formatTime(
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
              <Body3>{testimonial.quotation}</Body3>
              <footer
                className={css({
                  display: 'grid',
                  gap: '0.125em 10px',
                  gridTemplateColumns: '1fr 1fr',
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
                  onClick={isPlaying ? pause : play}
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
                    {isPlaying ? 'Pause' : 'Play'}
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
      document.body.style.setProperty(
        '--page-bg',
        `var(--color-${currentTestimonial.color})`,
      );
      audioPlayerRef.current?.play();
    }
    return () => {
      document.body.style.removeProperty('--page-bg');
    };
  }, [currentTestimonial]);

  const intersectionProgressRef = React.useRef<HTMLDivElement>(null);
  useIntersectionProgress(intersectionProgressRef, {
    onProgress(target: HTMLDivElement, progress: number) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.slideTo(progress);
      }
    },
  });

  return (
    <div
      className={css({
        marginTop: '-10vh',
        paddingBottom: '100px',
        position: 'relative',
        textAlign: 'center',
        textWrap: 'balance',
      })}
    >
      {currentTestimonial && (
        <AudioPlayer
          ref={audioPlayerRef}
          audioFiles={currentTestimonial.audioFiles}
          audioDuration={currentTestimonial.audioDuration}
          customer={currentTestimonial.customer}
          joinYear={currentTestimonial.joinYear}
          quotation={currentTestimonial.quotation}
        />
      )}
      <div ref={intersectionProgressRef}>
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
            // Filled Text
            color: 'var(--color-space)',
            left: '0',
            position: 'absolute',
            right: '0',
            top: '0',
            WebkitTextFillColor: 'var(--color-space)',
            WebkitTextStrokeColor: 'var(--color-space)',
            WebkitTextStrokeWidth: 'thin',
            // Le sigh… This works around a Safari bug wherein the stacking
            // order becomes out of whack when scrolling past and then behind
            // elements that are `position: sticky`.
            // @see https://bugs.webkit.org/show_bug.cgi?id=168725
            transform: 'translate3d(0,0,0)',
            '::after': {
              backgroundColor: 'var(--page-bg, var(--color-sand))',
              bottom: '0',
              content: '""',
              display: 'block',
              height: '50dvh',
              left: '0',
              position: 'sticky',
              right: '0',
              transition: 'background 0.2s ease-in-out',
              width: '100%',
            },
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
        <div
          className={css({
            // Outlined Text
            color: 'var(--color-space)',
            left: '0',
            position: 'absolute',
            right: '0',
            top: '0',
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
      </div>
    </div>
  );
};

export const Testimonials = ({topPosition}: {topPosition?: number}) => {
  const css = useCSS();

  return (
    <section
      id="testimonials"
      className={css({
        backgroundColor: 'var(--page-bg, var(--color-sand))',
        cursor: 'default',
        marginTop: `${topPosition ?? 0}px`,
        paddingTop:
          topPosition && topPosition < 0 ? `${topPosition * -1}px` : '0',
        position: 'relative',
        transition: 'background 0.2s ease-in-out',
      })}
    >
      <div
        className={css({
          color: 'var(--color-space)',
          textAlign: 'center',
          margin: '264px 0 240px',
          position: 'relative',
          zIndex: 1,
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
            <H2 style={{textWrap: 'balance', marginBottom: '30px'}}>
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
                whiteSpace:'nowrap'
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
  );
};
