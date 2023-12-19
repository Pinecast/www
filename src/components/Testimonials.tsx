import {useCSS} from '@/hooks/useCSS';
import * as React from 'react';
import {Body3, Body4, H1, H2, Link, Overline, Subhead} from './Typography';
import {GintoNordCondensed} from '@/fonts';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {StickyLine} from './StickyLine';
import {useIntersection} from '@/hooks/useIntersection';
import {useIntersectionObserver} from '@/hooks/useIntersectionObserver';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';
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

export const Testimonials = ({topPosition}: {topPosition?: number}) => {
  const css = useCSS();

  const customersRef = React.useRef<Element[]>([]);
  const addCustomerRef = (index: number) => (el: Element | null) => {
    if (!el) {
      return;
    }
    customersRef.current[index] = el;
  };

  const [visibleCustomer] = useVisibleElements(customersRef, {
    rootMargin: '-50% 0% -50% 0%', // Middle of viewport, where StickyLine is
  });

  React.useEffect(() => {
    const testimonial =
      TESTIMONIALS[
        customersRef.current.findIndex(el => el === visibleCustomer)
      ];
    if (!testimonial) {
      return;
    }
    console.log('clear', testimonial);
    document.body.style.setProperty(
      '--page-bg',
      `var(--color-${testimonial.color})`,
    );
  }, [visibleCustomer]);

  return (
    <>
      <section
        id="testimonials"
        className={css({
          backgroundColor: 'var(--page-bg, var(--color-sand))',
          marginTop: `${topPosition ?? 0}px`,
          paddingTop:
            topPosition && topPosition < 0 ? `${topPosition * -1}px` : '0',
          transition: 'background 0.2s ease-in-out',
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
            paddingBottom: '264px',
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
        {TESTIMONIALS.map((item, idx) => (
          <div
            key={item.customer}
            id={`customer-${item.customer}`}
            ref={addCustomerRef(idx)}
            className={css({
              alignContent: 'center',
              display: 'grid',
              padding: '20vh 0',
              textAlign: 'center',
            })}
          >
            <H1 style={{margin: '0'}}>{item.customer}</H1>
          </div>
        ))}
      </section>
    </>
  );
};
