import {useCSS} from '@/hooks/useCSS';
import {StyleObject} from 'styletron-react';

// A panel that opens and closes with a height animation. Give it an `id` and
// point the aria-controls of its button at it.
//
// The panel is a grid with one row that grows from `0fr` to `1fr`. An open
// panel is as tall as its content, so that no text is cut off when the text
// is larger or has more spacing (WCAG 1.4.12). A fixed `max-height` cut it off.
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
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        overflow: 'hidden',
        transition: 'grid-template-rows 0.2s',
        ...style,
      })}
      // A closed panel is inert, so that the keyboard and assistive technology
      // cannot reach its links. `hidden` would do the same, but it would stop
      // the animation.
      inert={!open}
    >
      {/* The grid item. It has no minimum height, so that the row can close
          to 0. A 0fr row cannot close up the padding or the border of its
          item, so `innerStyle` goes on the element inside it. */}
      <div className={css({minHeight: 0})}>
        <div className={css({...innerStyle})}>{children}</div>
      </div>
    </div>
  );
};
