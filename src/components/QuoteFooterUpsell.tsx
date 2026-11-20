import {FormattedMessage} from 'react-intl';

import {FOOTER_BUTTON_STYLE, FooterUpsell} from './InfoPageFooterUpsell';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';

// The section at the bottom of the page for colleges and universities, in
// place of the sign-up section: a school buys from a quote, not at a checkout
// (EducationLayout). The note spells out the address, for a reader whose
// browser opens no mail program for a `mailto:` link.
export const QuoteFooterUpsell = () => (
  <FooterUpsell
    heading={
      <FormattedMessage
        description="Big heading of the quote section at the bottom of the page for colleges and universities, above the footer. {br} is a line break"
        defaultMessage="Get a quote{br}for your school"
        values={{br: <br />}}
      />
    }
    text={
      <FormattedMessage
        description="Text under the heading of the quote section at the bottom of the page for colleges and universities"
        defaultMessage="Tell us how many shows and students you have, and when your year of service starts. We usually send a quote within 36 hours."
      />
    }
    buttons={
      <>
        <PrimaryButton
          href="mailto:support@pinecast.com"
          style={FOOTER_BUTTON_STYLE}
        >
          <FormattedMessage
            description="Button in the quote section at the bottom of the page for colleges and universities. It opens an email to Pinecast support"
            defaultMessage="Request a quote"
          />
        </PrimaryButton>
        <SecondaryButton href="/features" style={FOOTER_BUTTON_STYLE}>
          <FormattedMessage
            description="Button in the quote section at the bottom of the page for colleges and universities, to the Features page"
            defaultMessage="What’s included?"
          />
        </SecondaryButton>
      </>
    }
    note={
      <FormattedMessage
        description="Small note under the buttons of the quote section at the bottom of the page for colleges and universities. {email} is the address of Pinecast support"
        defaultMessage="Or write to {email}"
        values={{email: 'support@pinecast.com'}}
      />
    }
  />
);
