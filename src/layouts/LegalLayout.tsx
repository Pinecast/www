import {H1} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout} from './BaseLayout';

export const LegalLayout = BaseLayout(
  ({title}) => (
    <>
      <H1 style={{padding: '0 10%', marginBottom: '50px'}}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-orchid)'},
);
