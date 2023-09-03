import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const SignIn = ({size, color = 'currentColor', style}: IconProps) => {
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
      <path
        fill={color}
        d="M19 3H5c-1.11 0-2 .89-2 2v2h2V5h14v14H5v-2H3v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
      />
      <path fill={color} d="M3 11h12v2H3z" />
      <path
        fill={color}
        fillRule="evenodd"
        d="M12 7a4 4 0 0 0 4 4v2a6 6 0 0 1-6-6h2Z"
        clipRule="evenodd"
      />
      <path
        fill={color}
        fillRule="evenodd"
        d="M12 17a4 4 0 0 1 4-4v-2a6 6 0 0 0-6 6h2Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
