import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';

export const FeaturesUpsell = () => {
  const css = useCSS();

  return (
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
      })}
    >
      <H2>
        Discover more
        <br />
        features
      </H2>

      <SecondaryButton href="/features">See all features</SecondaryButton>
    </div>
  );
};
