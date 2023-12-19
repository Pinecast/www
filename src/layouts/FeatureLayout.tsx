import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout} from './BaseLayout';

export const FeatureLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        Pinecast features
      </PillButton>
      <H1 style={{padding: '0 10%', marginBottom: '50px'}}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-orchid)'},
);
