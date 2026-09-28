import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout, pageTitleStyle} from './BaseLayout';

export const LearnLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        Learn with Pinecast
      </PillButton>
      <H1 style={pageTitleStyle(title)}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-lime)'},
);
