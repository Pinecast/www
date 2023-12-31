import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout} from './BaseLayout';

export const LearnLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        Learn with Pinecast
      </PillButton>
      <H1 style={{padding: '0 10%', marginBottom: '50px'}}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-lime)'},
);
