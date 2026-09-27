import {useCSS} from '@/hooks/useCSS';
import {StyleObject} from 'styletron-react';

// A panel that opens and closes with a height animation. Give it an `id` and
// point the aria-controls of its button at it.
export const Expandable = ({
  children,
  id,
  open,
  style,
  innerStyle,
}: {
  children: React.ReactNode;
  id?: string;
  open: boolean;
  style?: StyleObject;
  innerStyle?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <div
      id={id}
      className={css({
        height: 'auto',
        overflow: 'hidden',
        maxHeight: open ? '400px' : '0',
        transition: 'max-height 0.2s',
        ...style,
      })}
      // A closed panel is inert, so that the keyboard and assistive technology
      // cannot reach its links. `hidden` would do the same, but it would stop
      // the animation.
      inert={!open}
    >
      <div className={css({...innerStyle})}>{children}</div>
    </div>
  );
};
