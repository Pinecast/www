import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const Check = ({size, color = 'currentColor', style}: IconProps) => {
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
      <path
        fill="#fff"
        fillRule="evenodd"
        d="m16.382 9.322-5.407 6.42-3.332-3.392.713-.7 2.562 2.608 4.699-5.58.765.644Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
