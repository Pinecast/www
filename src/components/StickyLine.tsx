import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';

type Props = {
  color?: string;
  size?: number;
  zIndex?: number;
};

export const StickyLine = React.forwardRef<HTMLDivElement, Props>(
  function StickyLine(
    {color = 'currentColor', size: height = 1.5, zIndex = 2}: Props,
    ref,
  ) {
    const css = useCSS();
    return (
      <div
        ref={ref}
        className={css({
          backgroundColor: color,
          position: 'sticky',
          height: `${height}px`,
          marginTop: `${-1 * height}px`,
          top: `calc(50vh - ${height}px)`,
          left: '0',
          right: '0',
          width: '100%',
          zIndex: zIndex,
        })}
      />
    );
  },
);
