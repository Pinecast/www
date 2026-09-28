import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const Pause = ({size, color = 'currentColor', style}: IconProps) => {
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
      <rect fill={color} x="6" y="4" width="4" height="16" rx="2" />
      <rect fill={color} x="14" y="4" width="4" height="16" rx="2" />
    </svg>
  );
};
