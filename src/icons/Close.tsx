import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

// An ×, for a button that closes something.
export const Close = ({size, color = 'currentColor', style}: IconProps) => {
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
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  );
};
