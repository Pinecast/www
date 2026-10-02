import * as React from 'react';
import {AudioMimeType, useAsyncAudio} from '@/hooks/useAsyncResource';
import {useAfterCritical} from '@/hooks/useLoadOrder';

export enum SoundEffect {
  CLICK_DROP = '/sounds/click-drop.mp3',
  CLICK = '/sounds/click.mp3',
  CTA_CLICK_1 = '/sounds/cta-click-01.mp3',
  CTA_CLICK_2 = '/sounds/cta-click-02.mp3',
  CTA_CLICK_3 = '/sounds/cta-click-03.mp3',
  DROP = '/sounds/drop.mp3',
  GLOBE_ANALYTICS_LOOP = '/sounds/globe-analytics-loop.mp3',
  GLOBE_DISTRIBUTION_LOOP = '/sounds/globe-distribution-loop.mp3',
  GLOBE_MONETIZATION_LOOP = '/sounds/globe-monetization-loop.mp3',
  GLOBE_TRANSITION_STATES = '/sounds/globe-transition-states.mp3',
  KNOB_CLICK = '/sounds/knob_click.mp3',
  KNOB_TURNING = '/sounds/knob-turning.mp3',
  LOGO_ROLLOVER_1 = '/sounds/logo-rollover-01.mp3',
  PAGE_TRANSITION_1 = '/sounds/page-transition-01.mp3',
  PAGE_TRANSITION_3 = '/sounds/page-transition-03.mp3',
  PAGE_TRANSITION_4 = '/sounds/page-transition-04.mp3',
  SITE_AMBIENCE_LOOP = '/sounds/site-ambience-loop.mp3',
  SITE_INTRO = '/sounds/site-intro.mp3',
  SOUND_OFF_1 = '/sounds/sound-off-01.mp3',
  SOUND_ON_1 = '/sounds/sound-on-01.mp3',
  SWOOSH_TRANSITION = '/sounds/swoosh-transition.mp3',
}

const {
  CLICK_DROP,
  CLICK,
  CTA_CLICK_1,
  CTA_CLICK_2,
  CTA_CLICK_3,
  DROP,
  GLOBE_ANALYTICS_LOOP,
  GLOBE_DISTRIBUTION_LOOP,
  GLOBE_MONETIZATION_LOOP,
  GLOBE_TRANSITION_STATES,
  KNOB_CLICK,
  KNOB_TURNING,
  LOGO_ROLLOVER_1,
  PAGE_TRANSITION_1,
  PAGE_TRANSITION_3,
  PAGE_TRANSITION_4,
  SITE_AMBIENCE_LOOP,
  SITE_INTRO,
  SOUND_OFF_1,
  SOUND_ON_1,
  SWOOSH_TRANSITION,
} = SoundEffect;

export type SoundEffectSource = [SoundEffect, HTMLAudioElement, boolean];

export type SoundEffectsApi = {
  sounds: Array<HTMLAudioElement>;
  play: (src: SoundEffect) => Promise<void>;
};

const {MP3} = AudioMimeType;

const mp3 = (value: string) => ({[MP3]: value});

export const useSoundEffects = ({
  muted = true,
}: {
  muted: boolean;
}): SoundEffectsApi => {
  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  const playLockMapRef = React.useRef(new Map<HTMLAudioElement, boolean>());

  const soundEffectsMap = React.useRef(
    new Map<SoundEffect, [HTMLAudioElement | null, boolean]>(),
  );
  const sounds = React.useRef<Array<HTMLAudioElement>>([]);

  // The sounds are silent until the user unmutes them, which takes a click.
  // They load when the stills of the hero are in, or when the user presses a
  // key or a pointer button, whichever is first: they should not hold up the
  // stills. A sound that the user asks for before it loads plays when it is in.
  const preload = useAfterCritical({orInput: true});

  const clickDrop = useAsyncAudio(mp3(CLICK_DROP), preload);
  const click = useAsyncAudio(mp3(CLICK), preload);
  const ctaClick1 = useAsyncAudio(mp3(CTA_CLICK_1), preload);
  const ctaClick2 = useAsyncAudio(mp3(CTA_CLICK_2), preload);
  const ctaClick3 = useAsyncAudio(mp3(CTA_CLICK_3), preload);
  const drop = useAsyncAudio(mp3(DROP), preload);
  const globeAnalyticsLoop = useAsyncAudio(mp3(GLOBE_ANALYTICS_LOOP), preload);
  const globeDistributionLoop = useAsyncAudio(
    mp3(GLOBE_DISTRIBUTION_LOOP),
    preload,
  );
  const globeMonetizationLoop = useAsyncAudio(
    mp3(GLOBE_MONETIZATION_LOOP),
    preload,
  );
  const globeTransitionStates = useAsyncAudio(
    mp3(GLOBE_TRANSITION_STATES),
    preload,
  );
  const knobClick = useAsyncAudio(mp3(KNOB_CLICK), preload);
  const knobTurning = useAsyncAudio(mp3(KNOB_TURNING), preload);
  const logoRollover1 = useAsyncAudio(mp3(LOGO_ROLLOVER_1), preload);
  const pageTransition1 = useAsyncAudio(mp3(PAGE_TRANSITION_1), preload);
  const pageTransition3 = useAsyncAudio(mp3(PAGE_TRANSITION_3), preload);
  const pageTransition4 = useAsyncAudio(mp3(PAGE_TRANSITION_4), preload);
  const siteAmbienceLoop = useAsyncAudio(mp3(SITE_AMBIENCE_LOOP), preload);
  const siteIntro = useAsyncAudio(mp3(SITE_INTRO), preload);
  const soundOff1 = useAsyncAudio(mp3(SOUND_OFF_1), preload);
  const soundOn1 = useAsyncAudio(mp3(SOUND_ON_1), preload);
  const swooshTransition = useAsyncAudio(mp3(SWOOSH_TRANSITION), preload);

  React.useEffect(() => {
    soundEffectsMap.current.set(CLICK_DROP, clickDrop);
    soundEffectsMap.current.set(CLICK, click);
    soundEffectsMap.current.set(CTA_CLICK_1, ctaClick1);
    soundEffectsMap.current.set(CTA_CLICK_2, ctaClick2);
    soundEffectsMap.current.set(CTA_CLICK_3, ctaClick3);
    soundEffectsMap.current.set(DROP, drop);
    soundEffectsMap.current.set(GLOBE_ANALYTICS_LOOP, globeAnalyticsLoop);
    soundEffectsMap.current.set(GLOBE_DISTRIBUTION_LOOP, globeDistributionLoop);
    soundEffectsMap.current.set(GLOBE_MONETIZATION_LOOP, globeMonetizationLoop);
    soundEffectsMap.current.set(GLOBE_TRANSITION_STATES, globeTransitionStates);
    soundEffectsMap.current.set(KNOB_CLICK, knobClick);
    soundEffectsMap.current.set(KNOB_TURNING, knobTurning);
    soundEffectsMap.current.set(LOGO_ROLLOVER_1, logoRollover1);
    soundEffectsMap.current.set(PAGE_TRANSITION_1, pageTransition1);
    soundEffectsMap.current.set(PAGE_TRANSITION_3, pageTransition3);
    soundEffectsMap.current.set(PAGE_TRANSITION_4, pageTransition4);
    soundEffectsMap.current.set(SITE_AMBIENCE_LOOP, siteAmbienceLoop);
    soundEffectsMap.current.set(SITE_INTRO, siteIntro);
    soundEffectsMap.current.set(SOUND_OFF_1, soundOff1);
    soundEffectsMap.current.set(SOUND_ON_1, soundOn1);
    soundEffectsMap.current.set(SWOOSH_TRANSITION, swooshTransition);

    sounds.current = [
      clickDrop,
      click,
      ctaClick1,
      ctaClick2,
      ctaClick3,
      drop,
      globeAnalyticsLoop,
      globeDistributionLoop,
      globeMonetizationLoop,
      globeTransitionStates,
      knobClick,
      knobTurning,
      logoRollover1,
      pageTransition1,
      pageTransition3,
      pageTransition4,
      siteAmbienceLoop,
      siteIntro,
      soundOff1,
      soundOn1,
      swooshTransition,
    ]
      .map(([audioEl]) => audioEl)
      .filter(Boolean);
  }, [
    clickDrop,
    click,
    ctaClick1,
    ctaClick2,
    ctaClick3,
    drop,
    globeAnalyticsLoop,
    globeDistributionLoop,
    globeMonetizationLoop,
    globeTransitionStates,
    knobClick,
    knobTurning,
    logoRollover1,
    pageTransition1,
    pageTransition3,
    pageTransition4,
    siteAmbienceLoop,
    siteIntro,
    soundOff1,
    soundOn1,
    swooshTransition,
    // The hooks return the same arrays when their sounds load later, so
    // without this, `sounds` would stay the empty list from before.
    preload,
  ]);

  const play = React.useCallback(
    async (src: SoundEffect): Promise<void> => {
      // Do not play the sound if we're in a background tab.
      if (document.hidden) {
        return Promise.resolve();
      }

      const activeAudio = soundEffectsMap.current.get(src);
      if (!activeAudio || activeAudio[0] === null) {
        return Promise.resolve();
      }
      const [audio, loaded] = activeAudio;

      const playLock = playLockMapRef.current.get(audio);
      if (playLock) {
        return Promise.resolve();
      }

      const startPlay = (): Promise<void> => {
        if (muted) {
          // Browsers require a user-gesture event (e.g., click) to be fired before calling `.play()`;
          // otherwise, a DOM exception `NotAllowedError` will be thrown.
          // Tapping on the global mute button in the nav allows us to safely play future sounds.
          return Promise.resolve();
        }

        const promise = audio.play();

        const isPromise = typeof promise === 'object' && promise !== null;
        if (!isPromise) {
          return Promise.resolve();
        }

        const lock = () => playLockMapRef.current.set(audio, true);
        const unlock = () => playLockMapRef.current.set(audio, false);

        lock();

        const onError = (err: DOMException): void => {
          if (err.name === 'NotAllowedError') {
            // Re-throw NotAllowedError so calling code can handle autoplay restrictions
            unlock();
            throw err;
          } else {
            console.warn(`[${err.name}]`, err);
            unlock();
          }
        };

        return promise.then(() => {
          unlock();
        }, onError);
      };

      audio.currentTime = 0;
      audio.muted = muted;

      return new Promise<void>(resolve => {
        audio.oncanplaythrough = () => {
          // Always resolve to avoid unhandled rejections
          startPlay().then(resolve).catch(resolve);
        };

        if (!loaded) {
          audio.load();
        }

        if (audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
          startPlay().then(resolve).catch(resolve);
        }
      });
    },
    [muted],
  );

  return {sounds: sounds.current, play};
};
