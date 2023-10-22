import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const Collapse = ({size, color = 'currentColor', style}: IconProps) => {
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
      <circle cx="12" cy="12" r="10" fill={color} />
      <path stroke="#060606" d="M7 11.954h10" />
    </svg>
  );
};
