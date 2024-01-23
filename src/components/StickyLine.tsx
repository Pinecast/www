import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';

type Props = {
  color?: string;
  invertColor?: boolean;
  size?: number;
  zIndex?: number;
};

export const StickyLine = ({
  color: backgroundColor = 'currentColor',
  invertColor = false,
  size = 1.5,
  zIndex = 2,
}: Props) => {
  const css = useCSS();
  return (
    <div
      className={css({
        // When enabled, invert the line colour based on the backdrop beneath.
        ...(invertColor ? {mixBlendMode: 'difference'} : {}),
        backgroundColor,
        height: `${size}px`,
        marginTop: `${-1 * size}px`,
        pointerEvents: 'none',
        position: 'sticky',
        top: `calc(50lvh - ${size}px)`,
        left: '0',
        right: '0',
        width: '100%',
        zIndex,
      })}
    />
  );
};
