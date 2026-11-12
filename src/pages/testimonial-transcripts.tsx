import * as React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {TESTIMONIALS} from '@/components/Testimonials';
import {Title} from '@/components/TextBlocks';
import {LegalLayout} from '@/layouts/LegalLayout';
import {useMDXComponents} from '../../mdx-components';

export default function TestimonialTranscripts() {
  const intl = useIntl();
  // Paragraphs match the MDX pages that share this layout. @types/mdx types
  // components through the global JSX namespace, which React 19 dropped.
  const Paragraph = (useMDXComponents({}).p ?? 'p') as React.ElementType;
  return (
    <LegalLayout
      // Short words: the layout's h1 can't wrap a longer one at 320px. The
      // h1 does not say what the page holds, so the <title> does.
      title={intl.formatMessage({
        description:
          'Main heading of the page with the transcripts of the audio testimonials from customers. Use short words only: the heading is large, and on a phone screen it cannot wrap a longer word. The heading does not say what the page holds; the title in the browser tab does',
        defaultMessage: 'In Their Own Words',
      })}
      documentTitle={intl.formatMessage({
        description:
          'Title of the page with the transcripts of the audio testimonials from customers, in the browser tab',
        defaultMessage: 'Testimonial transcripts',
      })}
      description={intl.formatMessage({
        description:
          'Description of the page with the transcripts of the audio testimonials from customers, for search engines and link previews',
        defaultMessage:
          'Transcripts of the audio testimonials from Pinecast customers',
      })}
      heroImage="/images/hero/central.png"
    >
      <Paragraph>
        <FormattedMessage
          description="First paragraph of the page with the transcripts of the audio testimonials from customers. Below it, each customer name is a heading, followed by the transcript"
          defaultMessage="These are transcripts of the audio testimonials on our home page."
        />
      </Paragraph>
      {TESTIMONIALS.map(({customer, script}) => (
        <React.Fragment key={customer}>
          <Title>{customer}</Title>
          {/* The customer's own recorded words: not translated. */}
          <Paragraph>{script.text.replace(/'/g, '’')}</Paragraph>
        </React.Fragment>
      ))}
    </LegalLayout>
  );
}
