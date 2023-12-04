import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {MonumentGroteskBold} from '@/fonts';
import {MOBILE_BREAKPOINT} from '@/constants';

export const Intro = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <p
      className={css({
        ...MonumentGroteskBold,
        fontSize: '42px',
        letterSpacing: '-1px',
        lineHeight: '42px',
        maxWidth: '70%',
        [MOBILE_BREAKPOINT]: {
          maxWidth: '100%',
        },
      })}
    >
      {children}
    </p>
  );
};
