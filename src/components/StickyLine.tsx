import {useCSS} from '@/hooks/useCSS';

export const StickyLine = ({color, size}: {color: string; size?: number}) => {
  const css = useCSS();
  const height = size ?? 1.5;
  return (
    <div
      className={css({
        backgroundColor: `${color ?? 'currentcolor'}`,
        position: 'sticky',
        height: `${height}px`,
        marginTop: `${-1 * height}px`,
        top: `calc(50vh - ${height}px)`,
        left: '0',
        right: '0',
        width: '100%',
        zIndex: 2,
      })}
    />
  );
};
