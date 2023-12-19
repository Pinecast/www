import {useCSS} from '@/hooks/useCSS';

export const StickyLine = ({color, size}: {color: string; size?: string}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        backgroundColor: `${color ?? 'currentcolor'}`,
        position: 'sticky',
        height: `${size ?? 1.5}px`,
        top: '50vh',
        left: '0',
        right: '0',
        width: '100%',
        zIndex: 0,
      })}
    />
  );
};
