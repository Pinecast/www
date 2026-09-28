import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import React from 'react';
import Link from 'next/link';
import {Body1, Caption} from './Typography';
import {useCSS} from '@/hooks/useCSS';

export const FeaturesBlock = () => {
  const css = useCSS();
  return (
    <div
      data-theme-adaptive
      className={css({
        [MIN_TABLET_MEDIA_QUERY]: {
          display: 'none',
        },
        padding: '10px 0 4px',
      })}
    >
      <Link
        href="/features"
        className={css({
          color: 'inherit',
          // A block, as wide as its heading, so that the focus ring goes
          // around the heading. An inline link around a block draws none.
          display: 'block',
          margin: '-4px auto',
          // Room between the ring and the text. The negative margin keeps
          // the text where it was.
          padding: '4px 8px',
          width: 'fit-content',
          textAlign: 'center',
          textDecoration: 'none',
          ':hover': {textDecoration: 'underline'},
        })}
      >
        <Caption
          as="h2"
          style={{
            color: 'var(--color-core-accent-text)',
            marginTop: '0',
            marginRight: 'auto',
            marginBottom: '0',
            marginLeft: 'auto',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          Features
        </Caption>
      </Link>
    </div>
  );
};
