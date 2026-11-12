import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {FormattedMessage} from 'react-intl';
import {BaseLayout, pageTitleStyle} from './BaseLayout';

export const LearnLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        <FormattedMessage
          description="Label above the title of a Learn article, in a pill. Shown in capital letters"
          defaultMessage="Learn with Pinecast"
        />
      </PillButton>
      <H1 style={pageTitleStyle(title)}>{title}</H1>
    </>
  ),
  {defaultColor: 'var(--color-lime)'},
);
