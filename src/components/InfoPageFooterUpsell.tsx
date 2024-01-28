import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';

export const InfoPageFooterUpsell = () => {
  const css = useCSS();

  return (
    <section
      className={css({
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
          Try Pinecast
          <br />
          for free
        </H2>
        <Body4 style={{maxWidth: '32rem'}}>
          Whether you&rsquo;re just starting out or you&rsquo;re more
          established, we have a solution for you.
        </Body4>

        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
          })}
        >
          <PrimaryButton href="https://pinecast.com/signup">
            Start for free
          </PrimaryButton>
          <SecondaryButton href="/features">
            What&rsquo;s included?
          </SecondaryButton>
        </div>
        <Caption style={{color: 'var(--color-core-accent)'}}>
          No credit card required
        </Caption>
      </div>
    </section>
  );
};
