import {FormattedMessage} from 'react-intl';

import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {DARK_SURFACE} from '@/constants';

export const InfoPageFooterUpsell = () => {
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
        <H2>
          <FormattedMessage
            description="Big heading of the sign-up section at the bottom of the content pages, above the footer. {br} is a line break"
            defaultMessage="Try Pinecast{br}for free"
            values={{br: <br />}}
          />
        </H2>
        <Body4 style={{maxWidth: '32rem'}}>
          <FormattedMessage
            description="Text under the heading of the sign-up section at the bottom of the content pages"
            defaultMessage="Whether you’re just starting out or you’re more established, we have a solution for you."
          />
        </Body4>

        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
          })}
        >
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
        </div>
        <Caption style={{color: 'var(--color-core-accent)'}}>
          <FormattedMessage
            description="Small note under the sign-up buttons at the bottom of the content pages"
            defaultMessage="No credit card required"
          />
        </Caption>
      </div>
    </section>
  );
};
