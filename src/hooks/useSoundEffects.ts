import * as React from 'react';
import {AudioMimeType, useAsyncAudio} from '@/hooks/useAsyncResource';

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
  sounds: HTMLAudioElement[];
  play: (src: SoundEffect) => void;
};

const {MP3} = AudioMimeType;
const PRELOAD = true;

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
  const sounds = React.useRef<HTMLAudioElement[]>([]);

  const clickDrop = useAsyncAudio(mp3(CLICK_DROP), PRELOAD);
  const click = useAsyncAudio(mp3(CLICK), PRELOAD);
  const ctaClick1 = useAsyncAudio(mp3(CTA_CLICK_1), PRELOAD);
  const ctaClick2 = useAsyncAudio(mp3(CTA_CLICK_2), PRELOAD);
  const ctaClick3 = useAsyncAudio(mp3(CTA_CLICK_3), PRELOAD);
  const drop = useAsyncAudio(mp3(DROP), PRELOAD);
  const globeAnalyticsLoop = useAsyncAudio(mp3(GLOBE_ANALYTICS_LOOP), PRELOAD);
  const globeDistributionLoop = useAsyncAudio(
    mp3(GLOBE_DISTRIBUTION_LOOP),
    PRELOAD,
  );
  const globeMonetizationLoop = useAsyncAudio(
    mp3(GLOBE_MONETIZATION_LOOP),
    PRELOAD,
  );
  const globeTransitionStates = useAsyncAudio(
    mp3(GLOBE_TRANSITION_STATES),
    PRELOAD,
  );
  const knobClick = useAsyncAudio(mp3(KNOB_CLICK), PRELOAD);
  const knobTurning = useAsyncAudio(mp3(KNOB_TURNING), PRELOAD);
  const logoRollover1 = useAsyncAudio(mp3(LOGO_ROLLOVER_1), PRELOAD);
  const pageTransition1 = useAsyncAudio(mp3(PAGE_TRANSITION_1), PRELOAD);
  const pageTransition3 = useAsyncAudio(mp3(PAGE_TRANSITION_3), PRELOAD);
  const pageTransition4 = useAsyncAudio(mp3(PAGE_TRANSITION_4), PRELOAD);
  const siteAmbienceLoop = useAsyncAudio(mp3(SITE_AMBIENCE_LOOP), PRELOAD);
  const siteIntro = useAsyncAudio(mp3(SITE_INTRO), PRELOAD);
  const soundOff1 = useAsyncAudio(mp3(SOUND_OFF_1), PRELOAD);
  const soundOn1 = useAsyncAudio(mp3(SOUND_ON_1), PRELOAD);
  const swooshTransition = useAsyncAudio(mp3(SWOOSH_TRANSITION), PRELOAD);

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
  ]);

  const play = React.useCallback(
    async (src: SoundEffect) => {
      // Do not play the sound if we're in a background tab.
      if (document.hidden) {
        return;
      }

      const activeAudio = soundEffectsMap.current.get(src);
      if (!activeAudio || activeAudio[0] === null) {
        return;
      }
      const [audio, loaded] = activeAudio;

      const playLock = playLockMapRef.current.get(audio);
      if (playLock) {
        return;
      }

      const startPlay = () => {
        if (muted) {
          // Browsers require a user-gesture event (e.g., click) to be fired before calling `.play()`;
          // otherwise, a DOM exception `NotAllowedError` will be thrown.
          // Tapping on the global mute button in the nav allows us to safely play future sounds.
          return;
        }

        const promise = audio.play();

        const isPromise = typeof promise === 'object';
        if (!isPromise) {
          return;
        }

        const lock = () => playLockMapRef.current.set(audio, true);
        const unlock = () => playLockMapRef.current.set(audio, false);

        lock();

        const onError = (err: DOMException) => {
          console.warn(`[${err.name}]`, err);
          unlock();
        };

        return promise.then(unlock, onError);
      };

      audio.currentTime = 0;
      audio.muted = muted;
      audio.oncanplaythrough = startPlay;

      if (!loaded) {
        audio.load();
      }

      if (audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
        startPlay();
      }
    },
    [muted],
  );

  return {sounds: sounds.current, play};
};
