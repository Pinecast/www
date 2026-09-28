import * as React from 'react';

// The "Pause animations" toggle in the header pauses every animation that
// starts by itself and runs for more than five seconds (WCAG 2.2.2): the
// videos, the canvas loops, the marquee and the looping CSS animations. Each
// one freezes where it is. With `prefers-reduced-motion: reduce`, they start
// paused, and the user can still play them.
//
// The choice is kept in localStorage, so it stays while the user moves between
// pages. Without a choice, the reduced motion preference decides.

const STORAGE_KEY = 'motion';
const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';

// Set on <html> to "paused" or "playing". The style block in _document pauses
// looping CSS animations from it, before React loads.
export const MOTION_ATTRIBUTE = 'data-motion';

// Put these props on an element with a looping CSS animation, so that the
// toggle pauses it. Reduced motion does not cut its animation short, as it does
// all other animations and transitions: the toggle controls it instead.
export const loopingAnimationProps = {'data-looping': ''};

// Sets MOTION_ATTRIBUTE before the first paint, so that a paused page does not
// start to move before React loads. _document puts it in the <head>.
export const MOTION_INIT_SCRIPT = `try{var c=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});var p=c?c==="paused":matchMedia(${JSON.stringify(
  REDUCED_MOTION_MEDIA,
)}).matches;document.documentElement.setAttribute(${JSON.stringify(
  MOTION_ATTRIBUTE,
)},p?"paused":"playing")}catch(e){}`;

type Choice = 'paused' | 'playing' | null;

const readChoice = (): Choice => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'paused' || value === 'playing' ? value : null;
  } catch {
    return null;
  }
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia !== 'undefined' &&
  window.matchMedia(REDUCED_MOTION_MEDIA).matches;

let choice: Choice | undefined;
const listeners = new Set<() => void>();

export const isMotionPaused = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (choice === undefined) {
    choice = readChoice();
  }
  return choice ? choice === 'paused' : prefersReducedMotion();
};

const update = () => {
  document.documentElement.setAttribute(
    MOTION_ATTRIBUTE,
    isMotionPaused() ? 'paused' : 'playing',
  );
  listeners.forEach(listener => listener());
};

export const setMotionPaused = (paused: boolean) => {
  choice = paused ? 'paused' : 'playing';
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {}
  update();
};

let listening = false;
const listen = () => {
  if (listening) {
    return;
  }
  listening = true;
  window.matchMedia?.(REDUCED_MOTION_MEDIA).addEventListener('change', update);
  // A choice made in another tab applies here too.
  window.addEventListener('storage', evt => {
    if (evt.key === STORAGE_KEY || evt.key === null) {
      choice = readChoice();
      update();
    }
  });
};

const subscribe = (listener: () => void) => {
  listen();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The static export renders with no preference, so the first render in the
// browser must match it. React then renders again with the real values.
const getServerSnapshot = () => false;

export const useMotion = () => {
  const paused = React.useSyncExternalStore(
    subscribe,
    isMotionPaused,
    getServerSnapshot,
  );
  // Reduced motion also makes the scroll-linked effects static, whatever the
  // toggle says: the toggle is about animations that start by themselves.
  const reducedMotion = React.useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    getServerSnapshot,
  );
  const togglePaused = React.useCallback(
    () => setMotionPaused(!isMotionPaused()),
    [],
  );
  return {paused, reducedMotion, setPaused: setMotionPaused, togglePaused};
};
