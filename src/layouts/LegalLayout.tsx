import {H1} from '@/components/Typography';
import * as React from 'react';
import {BaseLayout, PAGE_TITLE_STYLE} from './BaseLayout';

export const LegalLayout = BaseLayout(
  ({title}) => (
    <>
      <H1 style={PAGE_TITLE_STYLE}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-sky)'},
);
