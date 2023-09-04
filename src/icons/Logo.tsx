import {useCSS} from '@/hooks/useCSS';
import type {IconProps} from './IconProps';

export const Logo = ({size, color = 'currentColor', style}: IconProps) => {
  const css = useCSS();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      className={style && css(style)}
    >
      <path
        fill={color}
        d="M561.738 530.174c50.862 50.025 117.878 80.662 191.289 81.291V517.63c-105.422-1.369-191.068-97.979-193.988-217.826h-94.036c-3.032 119.699-88.677 216.161-193.988 217.53v93.835c73.448-.629 140.464-31.266 191.326-81.328-17.743 131.243-117.804 232.108-238.196 232.108v93.835c94.591 0 180.052-43.402 241.005-112.89V912.07h93.741V742.894c60.917 69.525 146.415 112.89 240.969 112.89v-93.835c-120.281 0-220.269-100.68-238.122-231.738v-.037Z"
      />
      <path
        fill={color}
        d="M148.428 821.51c-24.843-35.09-44.463-73.424-58.302-113.92-16.002-46.762-24.134-95.798-24.134-145.654 0-248.052 201.874-449.865 450-449.865 248.127 0 450 201.813 450 449.865 0 49.856-8.131 98.855-24.134 145.654a448.839 448.839 0 0 1-58.301 113.92l-77.213-54.592c19.62-27.707 35.1-57.949 46.029-89.906 12.645-36.917 19.024-75.624 19.024-115.039 0-195.921-159.425-355.298-355.405-355.298-195.98 0-355.404 159.34-355.404 355.261 0 39.415 6.415 78.122 19.023 115.039 10.929 31.957 26.409 62.199 46.03 89.905l-77.213 54.63Z"
      />
    </svg>
  );
};