import {useCSS} from '@/hooks/useCSS';
import type {StyleObject} from 'styletron-react';
import type {IconProps} from './IconProps';

// The Download icon of the Figma file: a tray and an arrow into it. The arrow
// is a group of its own, with `arrowStyle`, so that a button can move it.
export const Download = ({
  size = 24,
  color = 'currentColor',
  style,
  arrowStyle,
}: IconProps & {arrowStyle?: StyleObject}) => {
  const css = useCSS();
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={style && css(style)}
    >
      <path
        fill={color}
        d="M21 19v-6h-2v6H5v-6H3v6a2 2 0 0 0 2 2h14c1.11 0 2-.9 2-2Z"
      />
      <g className={arrowStyle && css(arrowStyle)}>
        <path fill={color} d="M11 3h2v12h-2z" />
        <path
          fill={color}
          fillRule="evenodd"
          d="M17 12a4 4 0 0 0-4 4h-2a6 6 0 0 1 6-6v2Z"
          clipRule="evenodd"
        />
        <path
          fill={color}
          fillRule="evenodd"
          d="M7 12a4 4 0 0 1 4 4h2a6 6 0 0 0-6-6v2Z"
          clipRule="evenodd"
        />
      </g>
    </svg>
  );
};
