import * as React from 'react';

// t - time
// b - beginning value
// c - change in value
// d - duration
const easingFunctions = {
  linear: (t: number, b: number, c: number, d: number) => (c * t) / d + b,
  easeIn: (t: number, b: number, c: number, d: number) => c * (t /= d) * t + b,
  easeOut: (t: number, b: number, c: number, d: number) =>
    -c * (t /= d) * (t - 2) + b,
  easeInOut: (t: number, b: number, c: number, d: number) =>
    (t /= d / 2) < 1 ? (c / 2) * t * t + b : (-c / 2) * (--t * (t - 2) - 1) + b,
} as const;

type Keyframe = {
  target: number;
  ease?: keyof typeof easingFunctions;
};
type ElementDef = {
  property: keyof React.CSSProperties | `--${string}`;
  unit?: 'px' | '%' | '' | 'vw';
  keyframes: Array<Keyframe>;
};
export type Timeline = Record<string, ElementDef>;

const handlers = new Set<(scrollY: number, windowHeight: number) => void>();
const handler = () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  for (const handler of handlers) {
    handler(scrollY, windowHeight);
  }
};
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', handler, {passive: true});
}

export type ElementOutput = Record<
  string,
  [property: keyof React.CSSProperties | `--${string}`, value: string]
>;
export const useScrollTimeline = (
  containerRef: React.RefObject<HTMLElement>,
  timeline: Timeline,
  callback: (elements: ElementOutput) => void,
) => {
  const timelineRef = React.useRef<Array<[string, ElementDef]>>(null as any);
  if (timelineRef.current === null) {
    timelineRef.current = Object.entries(timeline) as any;
  }

  React.useEffect(() => {
    const values = Object.values(timelineRef.current);
    const timelineLength = timelineRef.current[0][1].keyframes.length;
    for (const otherValue of values.slice(1)) {
      if (otherValue[1].keyframes.length !== timelineLength) {
        throw new Error('All timelines must have the same length');
      }
    }
  }, []);

  const handler = React.useCallback(
    (scrollY: number, windowHeight: number) => {
      const {offsetTop: containerTop, offsetHeight: containerHeight} =
        containerRef.current!;
      if (
        containerTop - windowHeight > scrollY ||
        containerTop + containerHeight < scrollY
      ) {
        // console.log('Ignoring off-screen section');
        return;
      }
      // Calculate a value, `percentagePosition`, which indicates the percentage of the
      // way through the element `containerRef.current` is through the viewport. 0% should
      // represent when the top of the element appears on-screen (from the bottom of the
      // viewport or if the element is at the top of the page), and 100% should represent
      // when the bottom of the element disappears off the top of the screen (or if the
      // viewport reaches the bottom of the page).
      const minScrollPosition =
        containerTop < windowHeight ? 0 : containerTop - windowHeight;
      const percentagePosition =
        (scrollY - minScrollPosition) / containerHeight;

      // const topScroll = Math.max(0, containerTop - windowHeight);
      // const bottomScroll = containerTop + containerHeight;
      // const percentagePosition =
      //   (scrollY - topScroll) / (bottomScroll - topScroll);

      const numKeyframes = timelineRef.current[0][1].keyframes.length - 1;
      const startKeyframe = Math.max(
        0,
        Math.min(Math.floor(percentagePosition * numKeyframes), numKeyframes),
      );
      const endKeyframe = Math.min(
        Math.ceil(percentagePosition * numKeyframes),
        numKeyframes,
      );

      const percentageOfKeyframe =
        (percentagePosition - startKeyframe / numKeyframes) * numKeyframes;

      const values: Record<
        string,
        [keyof React.CSSProperties | `--${string}`, string]
      > = {};
      for (const [
        element,
        {property, unit, keyframes},
      ] of timelineRef.current) {
        const start = keyframes[startKeyframe];
        const end = keyframes[endKeyframe];
        const value = easingFunctions[end.ease ?? 'linear'](
          percentageOfKeyframe,
          start.target,
          end.target - start.target,
          1,
        );
        values[element] = [property, `${value}${unit ?? 'px'}`];
      }
      callback(values);
    },
    [callback, containerRef],
  );

  React.useEffect(() => {
    handlers.add(handler);
    handler(window.scrollY, window.innerHeight);

    return () => {
      handlers.delete(handler);
    };
  }, [handler]);
};
