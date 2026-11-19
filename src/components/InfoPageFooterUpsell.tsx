import * as React from 'react';
import {FormattedMessage} from 'react-intl';

import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {DARK_SURFACE} from '@/constants';

// The dark section at the bottom of a page, above the footer: a big heading,
// a line of text, a row of buttons and a small note. The content pages show
// the sign-up section (InfoPageFooterUpsell); a layout can give another one
// (`footerUpsell` of BaseLayout), as the page for colleges and universities
// does with QuoteFooterUpsell.
export const FooterUpsell = ({
  heading,
  text,
  buttons,
  note,
}: {
  heading: React.ReactNode;
  text: React.ReactNode;
  buttons: React.ReactNode;
  note: React.ReactNode;
}) => {
  const css = useCSS();

  return (
    <section
      className={css({
        ...DARK_SURFACE,
        backgroundColor: 'var(--color-space)',
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
          maxWidth: '946px',
          padding: '100px 30px 0',

          '--color-line': '#888',
          '--color-primary-dark': '#fff',
          '--color-primary-light': 'var(--color-space)',
          '--color-theme-mode': 'var(--color-space)',
          '--color-core-accent': '#888',
          color: 'var(--color-primary-dark)',
        })}
      >
        <H2>{heading}</H2>
        <Body4 style={{maxWidth: '32rem'}}>{text}</Body4>

        <div
          className={css({
            display: 'flex',
            // A button has a fixed height. Where two do not fit side by side
            // (320px, larger text spacing), each takes its own row, so that
            // a label does not wrap and spill out of its button.
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
          })}
        >
          {buttons}
        </div>
        <Caption style={{color: 'var(--color-core-accent)'}}>{note}</Caption>
      </div>
    </section>
  );
};

export const InfoPageFooterUpsell = () => (
  <FooterUpsell
    heading={
      <FormattedMessage
        description="Big heading of the sign-up section at the bottom of the content pages, above the footer. {br} is a line break"
        defaultMessage="Try Pinecast{br}for free"
        values={{br: <br />}}
      />
    }
    text={
      <FormattedMessage
        description="Text under the heading of the sign-up section at the bottom of the content pages"
        defaultMessage="Whether you’re just starting out or you’re more established, we have a solution for you."
      />
    }
    buttons={
      <>
        <PrimaryButton href="https://pinecast.com/signup">
          <FormattedMessage
            description="Button in the sign-up section at the bottom of the content pages, to the sign-up form"
            defaultMessage="Start for free"
          />
        </PrimaryButton>
        <SecondaryButton href="/features">
          <FormattedMessage
            description="Button in the sign-up section at the bottom of the content pages, to the Features page"
            defaultMessage="What’s included?"
          />
        </SecondaryButton>
      </>
    }
    note={
      <FormattedMessage
        description="Small note under the sign-up buttons at the bottom of the content pages"
        defaultMessage="No credit card required"
      />
    }
  />
);
