import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const Hamburger = ({size, color = 'currentColor', style}: IconProps) => {
  const css = useCSS();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={style && css(style)}
    >
      <path fill={color} d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  );
};
