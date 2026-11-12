import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {FormattedMessage} from 'react-intl';
import {BaseLayout, pageTitleStyle} from './BaseLayout';
import {FeaturesUpsell} from '@/components/FeaturesUpsell';

export const FeatureLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        <FormattedMessage
          description="Label above the title of a feature page, in a pill. Shown in capital letters"
          defaultMessage="Pinecast Features"
        />
      </PillButton>
      <H1 style={pageTitleStyle(title)}>{title}</H1>
    </>
  ),
  () => (
    <>
      <FeaturesUpsell />
    </>
  ),
  {defaultColor: 'var(--color-grape-50)'},
);
