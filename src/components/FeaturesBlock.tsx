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
          textAlign: 'center',
          textDecoration: 'none',
          ':hover': {textDecoration: 'underline'},
        })}
      >
        <Caption
          as="h3"
          style={{
            color: 'var(--color-core-accent)',
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
