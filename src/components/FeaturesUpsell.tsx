import {FormattedMessage} from 'react-intl';

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
        <FormattedMessage
          description="Big heading at the end of a feature page, above the button to all the features. {br} is a line break"
          defaultMessage="Discover more{br}features"
          values={{br: <br />}}
        />
      </H2>

      <SecondaryButton
        href="/features"
        style={{
          // The divider under the button overlaps its bottom edge (z-index
          // 2). Lift the button above it while it shows its focus ring.
          position: 'relative',
          ':focus-visible': {zIndex: 3},
        }}
      >
        <FormattedMessage
          description="Button at the end of a feature page, to the Features page with all the features"
          defaultMessage="See all features"
        />
      </SecondaryButton>
    </div>
  );
};
