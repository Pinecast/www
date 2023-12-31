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
        padding: '20px 0',
      })}
    >
      <Caption
        as="h3"
        style={{
          color: 'var(--color-core-accent)',
          marginTop: '0',
          marginRight: 'auto',
          marginBottom: '12px',
          marginLeft: 'auto',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        Features
      </Caption>
      <Link
        href="/features"
        className={css({
          color: 'inherit',
          textAlign: 'center',
          textDecoration: 'none',
          ':hover': {textDecoration: 'underline'},
        })}
      >
        <Body1 as="span">All Features</Body1>
      </Link>
    </div>
  );
};
