import * as React from 'react';

import {TESTIMONIALS} from '@/components/Testimonials';
import {Title} from '@/components/TextBlocks';
import {LegalLayout} from '@/layouts/LegalLayout';
import {useMDXComponents} from '../../mdx-components';

export default function TestimonialTranscripts() {
  // Paragraphs match the MDX pages that share this layout. @types/mdx types
  // components through the global JSX namespace, which React 19 dropped.
  const Paragraph = (useMDXComponents({}).p ?? 'p') as React.ElementType;
  return (
    <LegalLayout
      // Short words: the layout's h1 can't wrap a longer one at 320px. The
      // h1 does not say what the page holds, so the <title> does.
      title="In Their Own Words"
      documentTitle="Testimonial transcripts – Pinecast"
      description="Transcripts of the audio testimonials from Pinecast customers"
      heroImage="/images/hero/central.png"
    >
      <Paragraph>
        These are transcripts of the audio testimonials on our home page.
      </Paragraph>
      {TESTIMONIALS.map(({customer, script}) => (
        <React.Fragment key={customer}>
          <Title>{customer}</Title>
          <Paragraph>{script.text.replace(/'/g, '’')}</Paragraph>
        </React.Fragment>
      ))}
    </LegalLayout>
  );
}
