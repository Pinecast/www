import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout} from './BaseLayout';
import {FeaturesUpsell} from '@/components/FeaturesUpsell';

export const FeatureLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        Pinecast Features
      </PillButton>
      <H1 style={{padding: '0 10%', marginBottom: '50px'}}>{title}</H1>
    </>
  ),
  () => (
    <>
      <FeaturesUpsell />
    </>
  ),
  {defaultColor: 'var(--color-grape-50)'},
);
