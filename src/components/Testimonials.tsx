import * as React from 'react';
import {StyleObject} from 'styletron-react';
import {Body4, H1, H2} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {useVisibleElements} from '@/hooks/useVisibleElements';

const TESTIMONIALS = [
  {
    color: 'sand',
    quotation: (
      <>
        Pinecast is amazing. It lets us run a high quality show without feeling
        like our creativity is limited.
      </>
    ),
    customer: 'Never Sleeps Network',
    joinYear: 2016,
    numEpisodes: 108,
    audioFile: '/audio/testimonials/never-sleeps-network.webm',
  },
  {
    color: 'lime',
    quotation: (
      <>
        Pinecast is the absolute best in the game. The perfect one-stop shop for
        all our podcasting services.
      </>
    ),
    customer: 'Girls! Girls! Girls! Podcast',
    joinYear: 2021,
    numEpisodes: 680,
    audioFile: '/audio/testimonials/girls-girls-girls-podcast.webm',
  },
  {
    color: 'orchid',
    quotation: (
      <>
        Pinecast has given me all the tools I need to thrive, while ensuring
        I&rquo;m never concerned about storage, length, size or volume.
      </>
    ),
    customer: 'Digging Dexter Podcast',
    joinYear: 2016,
    numEpisodes: 108,
    audioFile: '/audio/testimonials/digging-dexter-podcast.webm',
  },
  {
    color: 'sky',
    quotation: (
      <>
        Pinecast is the bee&rqsuo;s knees. What else could we ever ask for?
        Perfection.
      </>
    ),
    customer: 'The Newsroom Podcast',
    joinYear: 2022,
    numEpisodes: 149,
    audioFile: '/audio/testimonials/the-newsroom-podcast-podcast.webm',
  },
];

const CUSTOMER_BLOCK_STYLE: StyleObject = {
  display: 'grid',
  padding: '10vh 10vw',
  placeContent: 'center',
  textAlign: 'center',
};

const Customers = ({}) => {
  const css = useCSS();
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

  React.useEffect(() => {
    const testimonial =
      TESTIMONIALS[
        customersRef.current.findIndex(el => el === visibleCustomer)
      ];
    if (!testimonial) {
      return;
    }
    document.body.style.setProperty(
      '--page-bg',
      `var(--color-${testimonial.color})`,
    );
  }, [visibleCustomer]);

  return (
    <>
      <div
        className={css({
          marginTop: '-10vh',
          paddingBottom: '100px',
          position: 'relative',
          textAlign: 'center',
          textWrap: 'balance',
        })}
      >
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
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={item.customer}
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
            zIndex: 2,
          })}
        >
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={item.customer}
              className={css(CUSTOMER_BLOCK_STYLE)}
            >
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
            zIndex: 1,
            '::after': {
              backgroundColor: 'var(--page-bg, var(--color-sand))',
              bottom: '0',
              content: '""',
              display: 'block',
              height: '50vh',
              left: '0',
              position: 'sticky',
              right: '0',
              transition: 'background 0.2s ease-in-out',
              width: '100%',
              zIndex: 1,
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
      </div>
    </>
  );
};

export const Testimonials = ({topPosition}: {topPosition?: number}) => {
  const css = useCSS();

  return (
    <>
      <section
        id="testimonials"
        className={css({
          backgroundColor: 'var(--page-bg, var(--color-sand))',
          cursor: 'default',
          transition: 'background 0.2s ease-in-out',
          // Le sigh… This works around a Safari bug wherein the stacking
          // order becomes out of whack when scrolling past and then behind
          // elements that are `position: sticky`.
          // @see https://bugs.webkit.org/show_bug.cgi?id=168725
          transform: 'translate3d(0,0,0)',
          marginTop: `${topPosition ?? 0}px`,
          paddingTop:
            topPosition && topPosition < 0 ? `${topPosition * -1}px` : '0',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            alignItems: 'center',
            textAlign: 'center',
            margin: '0 auto',
            maxWidth: '40em',
            paddingTop: '264px',
            paddingRight: '30px',
            paddingBottom: '240px',
            paddingLeft: '30px',
          })}
        >
          <H2
            style={{
              textWrap: 'balance',
            }}
          >
            Don&rsquo;t just take our word for it
          </H2>
          <Body4 style={{maxWidth: '36ch'}}>
            We take pride in running a top-notch service. People really like us.
            So much so, they left nice messages for you.
          </Body4>
        </div>
        <Customers />
      </section>
    </>
  );
};
