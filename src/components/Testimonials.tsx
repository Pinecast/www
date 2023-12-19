import {useCSS} from '@/hooks/useCSS';
import * as React from 'react';
import {Body3, Body4, H1, H2, Link, Overline, Subhead} from './Typography';
import {GintoNordCondensed} from '@/fonts';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {StickyLine} from './StickyLine';

const BUTTON_STYLE = {height: 'auto', paddingTop: '4px', paddingBottom: '4px'};
const MAX_WIDTH = 1300;

export const Testimonials = () => {
  const css = useCSS();

  return (
    <>
      <div
        id="testimonials"
        className={css({
          marginTop: '-25px',
          marginBottom: '-65px',
          paddingTop: '65px',
        })}
      />
      <StickyLine color="var(--color-space)" />
      <section
        className={css({
          backgroundColor: 'var(--color-sand)',
          marginTop: '-165px', // Height of lime-green marquee on Home page
          paddingTop: '165px',
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
            padding: '100px 30px 100px',
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
