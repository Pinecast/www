import {useCSS} from '@/hooks/useCSS';
import * as React from 'react';
import {Body3, Body4, H1, H2, Link, Overline, Subhead} from './Typography';
import {GintoNordCondensed} from '@/fonts';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {StickyLine} from './StickyLine';

export const Testimonials = ({topMargin}: {topMargin?: number}) => {
  const css = useCSS();

  return (
    <>
      <section
        id="testimonials"
        className={css({
          backgroundColor: 'var(--color-sand)',
          marginTop: `${topMargin ?? 0}px`,
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
      </section>
    </>
  );
};
