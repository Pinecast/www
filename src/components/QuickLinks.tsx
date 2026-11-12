import {
  ADAPTIVE_SURFACE,
  DARK_SURFACE,
  MIN_TABLET_MEDIA_QUERY,
} from '@/constants';
import React from 'react';
import Link from 'next/link';
import {
  defineMessage,
  FormattedMessage,
  type MessageDescriptor,
} from 'react-intl';
import {Body1, Caption, PillButton} from './Typography';
import {useCSS} from '@/hooks/useCSS';

const QUICK_LINKS: Array<[string, MessageDescriptor]> = [
  [
    '/learn/create-a-podcast',
    defineMessage({
      description:
        'A link in the Quick tips list of the menu, to a Learn article. Shown as a pill that does not wrap',
      defaultMessage: 'Create a podcast',
    }),
  ],
  [
    '/learn/promoting-your-podcast',
    defineMessage({
      description:
        'A link in the Quick tips list of the menu, to a Learn article. Shown as a pill that does not wrap',
      defaultMessage: 'Promoting your show',
    }),
  ],
  [
    '/learn/import-a-podcast',
    defineMessage({
      description:
        'A link in the Quick tips list of the menu, to a Learn article. Shown as a pill that does not wrap',
      defaultMessage: 'Import a podcast',
    }),
  ],
  [
    '/learn/understand-your-growth',
    defineMessage({
      description:
        'A link in the Quick tips list of the menu, to a Learn article. Shown as a pill that does not wrap',
      defaultMessage: 'Understanding your growth',
    }),
  ],
  [
    '/learn/monetize-your-podcast',
    defineMessage({
      description:
        'A link in the Quick tips list of the menu, to a Learn article. Shown as a pill that does not wrap',
      defaultMessage: 'Monetize your show',
    }),
  ],
  [
    '/learn/podcasting-glossary',
    defineMessage({
      description:
        'A link in the Quick tips list of the menu, to a Learn article. Shown as a pill that does not wrap',
      defaultMessage: 'Podcasting glossary',
    }),
  ],
];

export const QuickTipsBlock = ({isOpen}: {isOpen: boolean}) => {
  const css = useCSS();
  return (
    <div
      data-theme-adaptive
      className={css({
        ...ADAPTIVE_SURFACE,
        [MIN_TABLET_MEDIA_QUERY]: {
          ...DARK_SURFACE,
          background: 'var(--color-space)',
          border: '1px solid var(--color-sand)',
          borderRadius: '20px',
          color: 'var(--color-white)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
          padding: '30px',
        },
        // background: 'var(--color-primary-light)',
        padding: '16px 0 4px',
      })}
    >
      <Body1
        as="h2"
        style={{
          maxWidth: '8em',
          display: 'none',
          [MIN_TABLET_MEDIA_QUERY]: {display: 'block'},
          '@media (max-height: 575px)': {
            fontSize: '24px',
            lineHeight: '24px',
          },
        }}
      >
        <FormattedMessage
          description="Heading of the Quick tips list in the menu, on a tablet or a computer. The heading is narrow (8em) and wraps onto several lines"
          defaultMessage="Quick tips for getting started"
        />
      </Body1>
      <Caption
        as="h2"
        style={{
          color: 'var(--color-core-accent-text)',
          marginTop: '0',
          marginRight: 'auto',
          marginBottom: '10px',
          marginLeft: 'auto',
          textAlign: 'center',
          textTransform: 'uppercase',
          [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
        }}
      >
        <FormattedMessage
          description="Short heading of the Quick tips list in the menu, on a phone. Shown in capital letters"
          defaultMessage="Quick Tips"
        />
      </Caption>
      <ul
        className={css({
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1ch',
          justifyContent: 'center',
          listStyleType: 'none',
          margin: '8px auto 0',
          opacity: isOpen ? 1 : 0,
          padding: '0',
          transition: 'opacity 0.2s',

          [MIN_TABLET_MEDIA_QUERY]: {
            color: 'var(--color-white)',
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'minmax(0, 1fr)',
            margin: 'auto 0 0 0',
            maxWidth: '80%',
            placeSelf: 'top',
            placeContent: 'bottom',
          },
        })}
      >
        {QUICK_LINKS.map(([href, title]) => (
          <li key={href}>
            <Link
              href={href}
              className={css({
                color: 'inherit',
                whiteSpace: 'nowrap',
                // The inline link is shorter than its pill. Put the ring
                // around the pill.
                ':focus-visible': {outline: 'none'},
                ':focus-visible > *': {
                  outline: '2px solid var(--color-focus-ring)',
                  outlineOffset: '2px',
                },
              })}
            >
              <PillButton
                as="span"
                style={{
                  padding: '0.125em 0.875em',
                  '@media (max-height: 575px)': {
                    fontSize: '14px',
                    lineHeight: '20px',
                  },
                }}
              >
                <FormattedMessage {...title} />
              </PillButton>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
