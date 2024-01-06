import {StyleObject} from 'styletron-react';
import {useCSS} from '@/hooks/useCSS';

export const AspectRatioBox = ({
  children,
  zIndex,
  style,
}: {
  children: React.ReactNode;
  zIndex?: number;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        height: 0,
        paddingBottom: 'calc(var(--aspect-ratio) * 100%)',
        position: 'relative',
        zIndex: zIndex,
        width: '100%',
        ...style,
      })}
    >
      <div
        className={css({
          bottom: '0',
          height: '100%',
          left: '0',
          position: 'absolute',
          right: '0',
          top: '0',
          width: '100%',
        })}
      >
        {children}
      </div>
    </div>
  );
};
