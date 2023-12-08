import {useCSS} from '@/hooks/useCSS';
import {useCalculateResizableValue} from '@/hooks/useCalculateResizableValue';
import * as React from 'react';

const TICK_INTERVAL = 20;
const TICK_WIDTH = 10;

export const SideTicks = () => {
  const css = useCSS();

  const ref = React.useRef<SVGSVGElement>(null);
  React.useEffect(() => {
    const render = () => {
      const canvas = ref.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      const {height, width} = canvas;
      // ctx.fillStyle = 'red';
      ctx.clearRect(0, 0, width, height);
      const topOffset = window.scrollY;
      const startOffset = (topOffset % TICK_INTERVAL) * -1;

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = startOffset; i < height; i += TICK_INTERVAL) {
        ctx.moveTo(3, i);
        ctx.lineTo(TICK_WIDTH + 3, i);

        ctx.moveTo(width - 3, i);
        ctx.lineTo(width - TICK_WIDTH - 3, i);
      }
      ctx.stroke();

      requestAnimationFrame(render);
    };
    render();
    const timer = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(timer);
    };
  }, []);

  useCalculateResizableValue(() => {
    ref.current!.width = document.body.clientWidth;
    ref.current!.height = window.innerHeight;
  });

  return (
    <svg
      ref={ref}
      className={css({
        position: 'fixed',
        top: 0,
        marginBottom: '-100vh',
      })}
    />
  );
};
