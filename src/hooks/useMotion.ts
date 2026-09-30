import * as React from 'react';

// The "Pause animations" toggle in the header pauses every animation that
// starts by itself and runs for more than five seconds (WCAG 2.2.2): the
// videos, the canvas loops, the marquee and the looping CSS animations. Each
// one freezes where it is. With `prefers-reduced-motion: reduce`, they start
// paused, and the user can still play them.
//
// The choice is kept in localStorage, so it stays while the user moves between
// pages. Without a choice, the reduced motion preference decides. A choice to
// pause always holds. A choice to play holds only under the preference that it
// was made under: a user who turns on reduced motion later gets paused
// animations again.

const STORAGE_KEY = 'motion';
const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';

// Set on <html> to "paused" or "playing". The style block in _document pauses
// looping CSS animations from it, before React loads.
export const MOTION_ATTRIBUTE = 'data-motion';

// Put these props on an element with a looping CSS animation, so that the
// toggle pauses it. Reduced motion does not cut its animation short, as it does
// all other animations and transitions: the toggle controls it instead.
export const loopingAnimationProps = {'data-looping': ''};

// The stored value is "paused", or "playing:reduce" or "playing:no-preference"
// with the preference of the choice. A "playing" from before counts as made
// without reduced motion. readChoice and the script below read it the same way.
const REDUCE = 'reduce';
const NO_PREFERENCE = 'no-preference';

// Sets MOTION_ATTRIBUTE before the first paint, so that a paused page does not
// start to move before React loads. _document puts it in the <head>.
export const MOTION_INIT_SCRIPT = `try{var r=matchMedia(${JSON.stringify(
  REDUCED_MOTION_MEDIA,
)}).matches,c=(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})||"").split(":"),p=c[0]==="paused"||(c[0]==="playing"&&(c[1]===${JSON.stringify(
  REDUCE,
)})===r?false:r);document.documentElement.setAttribute(${JSON.stringify(
  MOTION_ATTRIBUTE,
)},p?"paused":"playing")}catch(e){}`;

// `reduce` is the preference that a choice to play was made under, and null
// for a choice to pause.
type Choice = {paused: boolean; reduce: boolean | null} | null;

const readChoice = (): Choice => {
  try {
    const [state, preference] = (
      window.localStorage.getItem(STORAGE_KEY) ?? ''
    ).split(':');
    if (state === 'paused') {
      return {paused: true, reduce: null};
    }
    if (state === 'playing') {
      return {paused: false, reduce: preference === REDUCE};
    }
    return null;
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
  const reduce = prefersReducedMotion();
  return choice && (choice.reduce === null || choice.reduce === reduce)
    ? choice.paused
    : reduce;
};

// How to scroll the page when the page starts the scroll, not the user: at
// once while motion is paused and under reduced motion, also when the user
// played the animations there. Otherwise as the page scrolls for a link that
// the user follows.
export const getScrollBehavior = (): ScrollBehavior =>
  isMotionPaused() || prefersReducedMotion() ? 'instant' : 'smooth';

const update = () => {
  document.documentElement.setAttribute(
    MOTION_ATTRIBUTE,
    isMotionPaused() ? 'paused' : 'playing',
  );
  listeners.forEach(listener => listener());
};

export const setMotionPaused = (paused: boolean) => {
  const reduce = prefersReducedMotion();
  choice = {paused, reduce: paused ? null : reduce};
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      paused ? 'paused' : `playing:${reduce ? REDUCE : NO_PREFERENCE}`,
    );
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
