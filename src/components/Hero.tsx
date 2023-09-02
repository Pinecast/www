import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {MOBILE_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';

export const Hero = () => {
  const css = useCSS();
  return (
    <section
      className={css({
        height: '100%',
        paddingTop: '176px',
        paddingLeft: '20px',
        paddingRight: '20px',
        [MOBILE_MEDIA_QUERY]: {
          paddingTop: '106px',
          paddingLeft: '10px',
          paddingRight: '10px',
        },
      })}
    >
      <div
        className={css({
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          maxWidth: '570px',
          margin: '0 auto',
          textAlign: 'center',
          [MOBILE_MEDIA_QUERY]: {
            gap: '15px',
            maxWidth: '340px',
          },
        })}
      >
        <H2>
          Hi! I&rsquo;m
          <br />
          your host
        </H2>
        <Body4>
          Welcome to Pinecast, a batteries-included
          <br />
          podcast hosting platform
        </Body4>
        <SecondaryButton
          href="https://pinecast.com/signup"
          style={{
            paddingLeft: '40px',
            paddingRight: '40px',
            [MOBILE_MEDIA_QUERY]: {
              paddingLeft: '30px',
              paddingRight: '30px',
            },
          }}
        >
          Start for free
        </SecondaryButton>
        <Caption style={{color: 'var(--color-core-accent)'}}>
          No credit card required
        </Caption>
      </div>
    </section>
  );
};
