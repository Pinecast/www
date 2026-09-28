import {H1} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout, pageTitleStyle} from './BaseLayout';

export const LegalLayout = BaseLayout(
  ({title}) => (
    <>
      <H1 style={pageTitleStyle(title)}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-sky)'},
);
