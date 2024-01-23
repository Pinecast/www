import {RefObject, useEffect, useState} from 'react';

const climb = (num: number, min: number, max: number) => {
  if (Math.abs(min - num) < Math.abs(max - num)) {
    return min;
  } else {
    return max;
  }
};

const genRange = (start: number, stop: number, step = 1) => {
  if (step <= 0) {
    return [start];
  }
  const range = Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);
  if (range[range.length - 1] === stop) {
    return range;
  }
  range.push(stop);
  return range;
};

interface CreateIntersectionProgressOptions<T extends Element> {
  // target element
  target: T;
  // trigger distance from the top/left of the viewport (in range percentage of [0..1]; default: 0.5)
  offset?: number;
  // scrolling detection frequency threshold (in px; default: 0.01)
  threshold?: number;
  // scrolling detection axis (default: y)
  axis?: 'x' | 'y';
  // called when progress changes
  onProgress?: (target: T, progress: number) => void;
  // called when target reaches threshold
  onEnter?: (target: T) => void;
  // called when target leaves threshold
  onLeave?: (target: T) => void;
}

interface IntersectionProgressInstance<T extends Element> {
  target: T;
  // intersection observer inside this instance
  observer: IntersectionObserver;
  // destroy instance and remove all event listeners
  destroy: () => void;
}

function createIntersectionProgress<T extends Element>({
  target,
  offset = 0.5,
  threshold = 0.001,
  axis = 'y',
  onProgress = () => {},
  onEnter = () => {},
  onLeave = () => {},
}: CreateIntersectionProgressOptions<T>): IntersectionProgressInstance<T> {
  const createIntersectionObserver = () => {
    // Create a root bounding box for observing the [0..1] progression of the target.
    let rootMargin: string;
    let thresholdStep: number;

    if (axis === 'y') {
      // vertical
      const m1 = -offset * window.innerHeight;
      const m2 = (offset - 1) * window.innerHeight + target.clientHeight;
      // create a root bound box which same with target under trigger
      rootMargin = `${m1}px 0px ${m2}px 0px`;
      thresholdStep = threshold / target.clientHeight;
    } else {
      // horizontal
      const m1 = -offset * window.innerWidth;
      const m2 = (offset - 1) * window.innerWidth + target.clientWidth;
      rootMargin = `0px ${m2}px 0px ${m1}px`;
      thresholdStep = threshold / target.clientWidth;
    }

    let isIntersectingLastTick = false;
    let progressLastTick = -1;

    let isFirstEnter = true;
    setTimeout(() => {
      isFirstEnter = false;
    });

    const options = {rootMargin, threshold: genRange(0, 1, thresholdStep)};

    const observer = new IntersectionObserver(([entry]) => {
      const {boundingClientRect, intersectionRect, isIntersecting} = entry;
      let isProgressing = false;
      let progress = 0;

      if (axis === 'y') {
        isProgressing =
          boundingClientRect.top < intersectionRect.top && isIntersecting;
        progress = 1 - intersectionRect.height / boundingClientRect.height;
      } else if (axis === 'x') {
        isProgressing =
          boundingClientRect.left < intersectionRect.left && isIntersecting;
        progress = 1 - intersectionRect.width / boundingClientRect.width;
      }

      // Percent (as [0..1]) of completion of a step past the threshold.

      const isEntering = !isIntersectingLastTick && isProgressing;
      const isLeaving = isIntersectingLastTick && !isProgressing;
      isIntersectingLastTick = isProgressing;

      const onProgressChange = (progress: number) => {
        if (progressLastTick !== progress) {
          onProgress(target, progress);
        }
        progressLastTick = progress;
      };

      if (isEntering) {
        onEnter(target);
        if (!isFirstEnter) {
          onProgressChange(climb(progress, 0, 1));
        }
      }

      if (isProgressing && progressLastTick !== progress) {
        onProgressChange(progress);
      }

      if (isLeaving) {
        onLeave(target);
        onProgressChange(climb(progress, 0, 1));
      }
    }, options);

    return observer;
  };

  let intersectionObserver: IntersectionObserver = createIntersectionObserver();

  const resizeHandler = () => {
    intersectionObserver?.disconnect();
    intersectionObserver = createIntersectionObserver();
    intersectionObserver?.observe(target);
  };

  const createResizeObserver = () =>
    typeof window.ResizeObserver !== 'undefined'
      ? new ResizeObserver(resizeHandler)
      : null;

  // Observer for when size of target changes/
  const resizeObserver = createResizeObserver();

  // Listener for when browser window resizes.
  window.addEventListener('resize', resizeHandler);

  function destroy() {
    intersectionObserver?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('resize', resizeHandler);
  }

  resizeObserver?.observe(target);

  return {
    target,
    observer: intersectionObserver,
    destroy,
  };
}

type UseIntersectionProgressOptions<T extends Element> = Omit<
  CreateIntersectionProgressOptions<T>,
  'target'
> & {
  onProgress?: (target: T, progress: number) => void;
  onEnter?: (target: T) => void;
  onLeave?: (target: T) => void;
};

export function useIntersectionProgress<T extends Element>(
  ref: RefObject<T>,
  options: UseIntersectionProgressOptions<T> = {},
) {
  const [sc, setSc] = useState<IntersectionProgressInstance<T> | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }
    const newSc = createIntersectionProgress({target, ...options});
    setSc(newSc);
    return () => newSc.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, options.offset, options.threshold, options.axis]);

  return sc;
}
