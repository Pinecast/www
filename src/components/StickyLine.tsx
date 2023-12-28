import {useCSS} from '@/hooks/useCSS';

export const StickyLine = ({
  color = 'currentColor',
  size: height = 1.5,
  zIndex = 2,
}: {
  color?: string;
  size?: number;
  zIndex?: number;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        backgroundColor: color,
        position: 'fixed',
        height: `${height}px`,
        marginTop: `${-1 * height}px`,
        top: `calc(50dvh - ${height}px)`,
        left: '0',
        right: '0',
        width: '100%',
        zIndex: zIndex,
      })}
    />
  );
};
