import * as React from 'react';
import {useScrollProgress} from './useScrollProgress';

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

export type ElementOutput = Record<
  string,
  [property: keyof React.CSSProperties | `--${string}`, value: string]
>;
export const useScrollTimeline = (
  containerRef: React.RefObject<HTMLElement>,
  timeline: Timeline,
  callback: (elements: ElementOutput) => void,
) => {
  const percentagePosition = useScrollProgress(containerRef);

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

  React.useEffect(() => {
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
    for (const [element, {property, unit, keyframes}] of timelineRef.current) {
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
  }, [percentagePosition, callback]);

  return percentagePosition;
};
