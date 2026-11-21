import {QuoteFooterUpsell} from '@/components/QuoteFooterUpsell';
import {H1, PillButton} from '@/components/Typography';
import * as React from 'react';
import {FormattedMessage} from 'react-intl';
import {BaseLayout, pageTitleStyle} from './BaseLayout';

// The layout of the page for colleges and universities (/education). Sky is
// the color of the persona that links to it (PERSONAS.organizations). It ends
// with a quote section instead of the sign-up one: a school buys from a quote.
export const EducationLayout = BaseLayout(
  ({title}) => (
    <>
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        <FormattedMessage
          description="Label above the title of the page for colleges and universities, in a pill. Shown in capital letters. Colleges in the American sense: schools of higher education that grant degrees, not secondary schools"
          defaultMessage="For colleges and universities"
        />
      </PillButton>
      <H1 style={pageTitleStyle(title)}>{title}</H1>
    </>
  ),
  {
    defaultColor: 'var(--color-sky)',
    footerUpsell: () => <QuoteFooterUpsell />,
  },
);
