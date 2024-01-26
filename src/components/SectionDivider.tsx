import * as React from 'react';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {useCSS} from '@/hooks/useCSS';

const DIVIDER_HEIGHT = 140;

export const SectionDivider = () => {
  const css = useCSS();
  return (
    <div
      className={css({
        height: `${DIVIDER_HEIGHT}px`,
        marginBottom: `${-1 * DIVIDER_HEIGHT}px`,
        marginTop: '-1.5px',
      })}
    >
      <svg
        className={css({
          display: 'block',
          width: '100%',
          [MIN_TABLET_MEDIA_QUERY]: {
            display: 'none',
          },
        })}
        viewBox="0 0 375 33"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M187.5 19C570.786 19 881.5 -57.4474 881.5 -151.75C881.5 -246.053 570.786 -322.5 187.5 -322.5C-195.786 -322.5 -506.5 -246.053 -506.5 -151.75C-506.5 -57.4474 -195.786 19 187.5 19Z"
          fill="var(--page-bg, var(--color-sand))"
          style={{transition: 'fill 0.2s ease-in-out'}}
        />
      </svg>
      <svg
        className={css({
          display: 'none',
          width: '100%',
          [MIN_TABLET_MEDIA_QUERY]: {
            display: 'block',
          },
        })}
        viewBox="0 0 1670 140"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M835 90C1601.57 90 2223 -62.8948 2223 -251.5C2223 -440.105 1601.57 -593 835 -593C68.4288 -593 -553 -440.105 -553 -251.5C-553 -62.8948 68.4288 90 835 90Z"
          fill="var(--page-bg, var(--color-sand))"
          style={{transition: 'fill 0.2s ease-in-out'}}
        />
      </svg>
    </div>
  );
};
