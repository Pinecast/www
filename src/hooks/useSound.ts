import * as React from 'react';

const MIME_TYPES = {
  vorbis: 'audio/ogg; codecs="vorbis"',
  opus: 'audio/ogg; codecs="opus"',
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
};

type AudioCodec = 'vorbis' | 'opus' | 'mp3' | 'aac';

export type AudioFiles = Record<AudioCodec, string>;

export function useSound(audioFiles: AudioFiles) {
  const soundTimeoutRef = React.useRef<
    undefined | ReturnType<typeof window.setTimeout>
  >();

  const audioElRef = React.useRef<HTMLAudioElement>();
  const [audio, setAudio] = React.useState<HTMLAudioElement>();
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    const audioEl = document.createElement(
      'audio',
    ) as unknown as HTMLAudioElement;
    audioEl.autoplay = true;

    if (audioFiles.vorbis && audioEl.canPlayType(MIME_TYPES.vorbis)) {
      audioEl.src = audioFiles.vorbis;
    } else if (audioFiles.opus && audioEl.canPlayType(MIME_TYPES.opus)) {
      audioEl.src = audioFiles.opus;
    } else if (audioFiles.mp3 && audioEl.canPlayType(MIME_TYPES.mp3)) {
      audioEl.src = audioFiles.mp3;
    } else if (audioFiles.aac && audioEl.canPlayType(MIME_TYPES.aac)) {
      audioEl.src = audioFiles.aac;
    }

    audioElRef.current = audioEl;
    setAudio(audioEl);
    // setIsPlaying(true);

    return () => {
      // setIsPlaying(false);
      audioEl.pause();
      audioEl.currentTime = 0;
      clearTimeout(soundTimeoutRef.current);
    };
  }, [audioFiles.vorbis, audioFiles.opus, audioFiles.mp3, audioFiles.aac]);

  const play = React.useCallback(() => {
    const audioEl = audioElRef.current;

    if (audioEl) {
      audioEl.currentTime = 0;
      clearTimeout(soundTimeoutRef.current);
      const audioPlayPromise = audioEl.play();
      const onPlayback = () => {
        setIsPlaying(true);
        soundTimeoutRef.current = setTimeout(() => setIsPlaying(false), 300);
      };
      if (typeof audioPlayPromise === 'undefined') {
        // The browser supports only the non-promise `.play()` method.
        onPlayback();
      } else {
        // The browser supports the promise `.play()` method.
        audioPlayPromise.then(onPlayback).catch(err => {
          if (err.name === 'NotAllowedError') {
            // The browser requires an initial click / keypress before playing audio.
            console.warn('User activation required to play audio!');
          } else {
            console.warn('Unknown error occurred whilst playing audio:', err);
          }
        });
      }
    }
  }, [audioElRef, setIsPlaying]);

  const pause = React.useCallback(() => {
    setIsPlaying(false);
    const audioEl = audioElRef.current;

    if (audioEl) {
      audioEl.currentTime = 0;
      clearTimeout(soundTimeoutRef.current);
      audioEl.pause();
    }
  }, [audioElRef]);

  return {
    audio,
    isPlaying,
    play,
    pause,
  };
}
