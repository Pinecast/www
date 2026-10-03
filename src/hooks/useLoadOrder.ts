import * as React from 'react';

// The order that a page loads its files in. The still images of the home hero
// come first: until they are in, the tiles of the hero show a flat color, and
// they are what the user looks at. The files that nobody needs yet (the
// sounds, the videos that replace the stills, the globe under the hero) wait
// for them. If they started at the same time, they would share the bandwidth,
// and on a slow connection the stills would be seconds late.
//
// An image that must come first calls `markCritical`. A hook that loads files
// that can wait calls `useAfterCritical`, and starts to load when it returns
// true. A page without critical images gets true after its first render.

let pending = 0;
const listeners = new Set<() => void>();

// Make the files that wait (`useAfterCritical`) wait for this image, until it
// loads or fails. Call it when the image starts to load.
export const markCritical = (image: HTMLImageElement) => {
  // An image that is in already (it is in the cache, or a preload got it) or
  // that failed is `complete`.
  if (image.complete) {
    return;
  }
  pending++;
  const settle = () => {
    image.removeEventListener('load', settle);
    image.removeEventListener('error', settle);
    pending--;
    listeners.forEach(listener => listener());
  };
  image.addEventListener('load', settle);
  image.addEventListener('error', settle);
};

// A press of a key or a pointer button: the user is there, and may do
// something that needs a file that waits.
const INPUT_EVENTS = ['pointerdown', 'keydown'] as const;

// True when all of the critical images are in or have failed. It reads them in
// an effect, after the first render of the whole page has marked them. With
// `orInput`, it is also true from the first press of a key or of a pointer
// button, so that the file is there for what the user does next.
export const useAfterCritical = ({orInput = false} = {}): boolean => {
  const [after, setAfter] = React.useState(false);
  React.useEffect(() => {
    if (after) {
      return;
    }
    if (pending === 0) {
      setAfter(true);
      return;
    }
    const open = () => setAfter(true);
    const check = () => {
      if (pending === 0) {
        open();
      }
    };
    listeners.add(check);
    if (orInput) {
      for (const type of INPUT_EVENTS) {
        window.addEventListener(type, open, {capture: true, passive: true});
      }
    }
    return () => {
      listeners.delete(check);
      for (const type of INPUT_EVENTS) {
        window.removeEventListener(type, open, {capture: true});
      }
    };
  }, [after, orInput]);
  return after;
};
