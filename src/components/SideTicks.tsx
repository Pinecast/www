import {useCSS} from '@/hooks/useCSS';
import {useCalculateResizableValue} from '@/hooks/useCalculateResizableValue';
import * as React from 'react';

const TICK_INTERVAL = 20;
const TICK_WIDTH = 10;
const TOP_OFFSET = 600;

export const SideTicks = () => {
  const css = useCSS();

  const ref = React.useRef<SVGSVGElement>(null);
  const [height, setHeight] = React.useState(0);
  // `setWidth` is used to force an update of this component so the SVG is re-rendered.
  const [_, setWidth] = React.useState(0);

  useCalculateResizableValue(() => {
    setHeight(ref.current!.clientHeight);
    setWidth(ref.current!.clientWidth);
  });

  return (
    <svg
      ref={ref}
      className={css({
        position: 'absolute',
        top: `-${TOP_OFFSET}px`,
        width: '100%',
        height: `calc(100% + ${TOP_OFFSET}px)`,
        zIndex: 1,
      })}
    >
      {Array.from({length: Math.ceil(height / TICK_INTERVAL)}, (_, i) => (
        <React.Fragment key={i}>
          <line
            x1={1}
            x2={TICK_WIDTH + 1}
            y1={i * TICK_INTERVAL}
            y2={i * TICK_INTERVAL}
            stroke="white"
            opacity={0.5}
          />
          <line
            x1={ref.current!.clientWidth - TICK_WIDTH - 1}
            x2={ref.current!.clientWidth - 1}
            y1={i * TICK_INTERVAL}
            y2={i * TICK_INTERVAL}
            stroke="white"
            opacity={0.5}
          />
        </React.Fragment>
      ))}
      <line
        x1={0}
        x2={ref.current?.clientWidth ?? 0}
        y1={height / 2 + TOP_OFFSET / 2 + 60}
        y2={height / 2 + TOP_OFFSET / 2 + 60}
        stroke="white"
      />
    </svg>
  );
};
