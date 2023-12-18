import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import React from 'react';
import Link from 'next/link';
import {Body1, Caption, PillButton} from './Typography';
import {useCSS} from '@/hooks/useCSS';

const QUICK_LINKS = [
  ['/learn/create-a-podcast', 'Create a podcast'],
  ['/learn/promoting-your-podcast', 'Promoting your show'],
  ['/learn/import-a podcast', 'Import a podcast'],
  ['/learn/understand-your-growth', 'Understanding your growth'],
  ['/learn/monetize-your-show', 'Monetize your show'],
  ['/learn/podcasting-glossary', 'Podcasting glossary'],
];

export const QuickTipsBlock = ({isOpen}: {isOpen: boolean}) => {
  const css = useCSS();
  return (
    <div
      data-theme-adaptive
      className={css({
        [MIN_TABLET_MEDIA_QUERY]: {
          background: 'var(--color-primary-dark)',
          borderRadius: '20px',
          color: 'var(--color-primary-light)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '30px',
        },
        background: 'var(--color-primary-light)',
        padding: '20px 0',
      })}
    >
      <Body1
        as="h3"
        style={{
          maxWidth: '8em',
          display: 'none',
          [MIN_TABLET_MEDIA_QUERY]: {display: 'block'},
        }}
      >
        Quick tips for getting started
      </Body1>
      <Caption
        as="h3"
        style={{
          color: 'var(--color-core-accent)',
          margin: '0 auto',
          textAlign: 'center',
          textTransform: 'uppercase',
          [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
        }}
      >
        Quick Tips
      </Caption>
      <ul
        className={css({
          listStyleType: 'none',
          padding: '0',

          [MIN_TABLET_MEDIA_QUERY]: {
            color: 'var(--color-primary-light)',
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'minmax(0, 1fr)',
            margin: 'auto 0 0 0',
            maxWidth: '80%',
            placeSelf: 'top',
            placeContent: 'bottom',
          },
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1ch',
          justifyContent: 'center',
          margin: '8px auto 0',

          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s',
        })}
      >
        {QUICK_LINKS.map(([href, title]) => (
          <li key={href}>
            <Link
              href={href}
              className={css({
                color: 'inherit',
                whiteSpace: 'nowrap',
              })}
            >
              <PillButton
                as="span"
                style={{
                  padding: '0.125em 0.875em',
                }}
              >
                {title}
              </PillButton>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
