import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const RightArrow = ({
  size = 24,
  color = 'currentColor',
  style,
}: IconProps) => {
  const css = useCSS();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={css({
        marginLeft: '8px',
        verticalAlign: 'middle',
        ...style,
      })}
    >
      <path fill={color} d="M4 11h15v2H4z" />
      <path
        fill={color}
        fillRule="evenodd"
        d="M16 7a4 4 0 0 0 4 4v2a6 6 0 0 1-6-6h2Z"
        clipRule="evenodd"
      />
      <path
        fill={color}
        fillRule="evenodd"
        d="M16 17a4 4 0 0 1 4-4v-2a6 6 0 0 0-6 6h2Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
