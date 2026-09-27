import type {StyleObject} from 'styletron-react';

// Icons are decorative: each one renders with aria-hidden and cannot take
// focus. Name the link or button that holds an icon instead.
export type IconProps = {
  color?: string;
  size: number;
  style?: StyleObject;
};
