import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout, PAGE_TITLE_STYLE} from './BaseLayout';

export const LearnLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        Learn with Pinecast
      </PillButton>
      <H1 style={PAGE_TITLE_STYLE}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-lime)'},
);
