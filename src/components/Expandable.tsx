import {useCSS} from '@/hooks/useCSS';
import {StyleObject} from 'styletron-react';

export const Expandable = ({
  children,
  id,
  open,
  innerStyle,
}: {
  children: React.ReactNode;
  id?: string;
  open: boolean;
  innerStyle?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <div
      id={id}
      role="region"
      className={css({
        height: 'auto',
        overflow: 'hidden',
        maxHeight: open ? '400px' : '0',
        transition: 'max-height 0.2s',
      })}
      aria-hidden={!open}
    >
      <div className={css({...innerStyle})}>{children}</div>
    </div>
  );
};
