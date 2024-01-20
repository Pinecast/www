import * as React from 'react';

const MIME_TYPES = {
  vorbis: 'audio/ogg; codecs="vorbis"',
  opus: 'audio/ogg; codecs="opus"',
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
};

type AudioCodec = 'vorbis' | 'opus' | 'mp3' | 'aac';

export type AudioFiles = Record<AudioCodec, string>;

const parseTimeRanges = (ranges: TimeRanges) => {
  const result: {start: number; end: number}[] = [];
  for (let i = 0; i < ranges.length; i++) {
    result.push({
      start: ranges.start(i),
      end: ranges.end(i),
    });

    return result;
  }
};

const useSetState = <T extends object>(
  initialState: T = {} as T,
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
  const [state, set] = React.useState<T>(initialState);
  const setState = React.useCallback((patch: object) => {
    set(prevState =>
      Object.assign(
        {},
        prevState,
        patch instanceof Function ? patch(prevState) : patch,
      ),
    );
  }, []);

  return [state, setState];
};

interface HTMLMediaProps
  extends React.AudioHTMLAttributes<any>,
    React.VideoHTMLAttributes<any> {
  src?: string;

  sources: AudioFiles | undefined;

}

interface HTMLMediaState {
  buffered: any[];
  duration: number;
  paused: boolean;
  muted: boolean;
  time: number;
  volume: number;
  playing: boolean;
}

interface HTMLMediaControls {
  play: () => Promise<void> | void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  volume: (volume: number) => void;
  seek: (time: number) => void;
}

type MediaPropsWithRef<T> = HTMLMediaProps & {
  ref?: React.MutableRefObject<T | null>;
};

// Adapted from and improved upon from https://github.com/streamich/react-use/blob/master/src/factory/createHTMLMediaHook.ts
function createHTMLMediaHook<T extends HTMLAudioElement | HTMLVideoElement>(
  tag: 'audio' | 'video',
) {
  return (elOrProps: HTMLMediaProps | React.ReactElement<HTMLMediaProps>) => {
    let element: React.ReactElement<MediaPropsWithRef<T>> | undefined;
    let props: MediaPropsWithRef<T>;

    if (React.isValidElement(elOrProps)) {
      element = elOrProps;
      props = element.props;
    } else {
      props = elOrProps;
    }

    const [state, setState] = useSetState<HTMLMediaState>({
      buffered: [],
      time: 0,
      duration: 0,
      paused: true,
      muted: false,
      volume: 1,
      playing: false,
    });
    const ref = React.useRef<T | null>(null);

    const wrapEvent = (
      userEvent: React.ReactEventHandler<any> | undefined,
      proxyEvent: (arg0: any) => void | undefined,
    ) => {
      return (event: any) => {
        try {
          proxyEvent?.(event);
        } finally {
          userEvent?.(event);
        }
      };
    };

    const onPlay = React.useCallback(
      () => setState({paused: false}),
      [setState],
    );
    const onPlaying = React.useCallback(
      () => setState({playing: true}),
      [setState],
    );
    const onWaiting = React.useCallback(
      () => setState({playing: false}),
      [setState],
    );
    const onPause = React.useCallback(
      () => setState({paused: true, playing: false}),
      [setState],
    );
    const onVolumeChange = React.useCallback(() => {
      const el = ref.current;
      if (!el) {
        return;
      }
      setState({
        muted: el.muted,
        volume: el.volume,
      });
    }, [setState]);
    const onDurationChange = React.useCallback(() => {
      const el = ref.current;
      if (!el) {
        return;
      }
      const {duration, buffered} = el;
      setState({
        duration,
        buffered: parseTimeRanges(buffered),
      });
    }, [setState]);
    const onTimeUpdate = React.useCallback(() => {
      const el = ref.current;
      if (!el) {
        return;
      }
      setState({time: el.currentTime});
    }, [setState]);
    const onProgress = React.useCallback(() => {
      const el = ref.current;
      if (!el) {
        return;
      }
      setState({buffered: parseTimeRanges(el.buffered)});
    }, [setState]);

    const elementAttrs = React.useMemo(() => {
      return {
        controls: false,
        ...props,
        ref,
        onPlay: wrapEvent(props.onPlay, onPlay),
        onPlaying: wrapEvent(props.onPlaying, onPlaying),
        onWaiting: wrapEvent(props.onWaiting, onWaiting),
        onPause: wrapEvent(props.onPause, onPause),
        onVolumeChange: wrapEvent(props.onVolumeChange, onVolumeChange),
        onDurationChange: wrapEvent(props.onDurationChange, onDurationChange),
        onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
        onProgress: wrapEvent(props.onProgress, onProgress),
      };
    }, [
      onDurationChange,
      onPause,
      onPlay,
      onPlaying,
      onProgress,
      onTimeUpdate,
      onVolumeChange,
      onWaiting,
      props,
    ]);

    if (element) {
      element = React.cloneElement(element, elementAttrs);
    } else {
      element = React.createElement(tag, elementAttrs as any);
    }

    // Some browsers return `Promise` on `.play()` and may throw errors
    // if one tries to execute another `.play()` or `.pause()` while that
    // promise is resolving. So we prevent that with this lock.
    // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
    let lockPlayRef = React.useRef<boolean>(false);

    const controls: HTMLMediaControls = React.useMemo(() => {
      return {
        play: () => {
          const el = ref.current;
          if (!el || lockPlayRef.current) {
            return undefined;
          }
          const {sources: audioFiles} = props;
          if (audioFiles) {
            if (audioFiles.vorbis && el.canPlayType(MIME_TYPES.vorbis)) {
              el.src = audioFiles.vorbis;
            } else if (audioFiles.opus && el.canPlayType(MIME_TYPES.opus)) {
              el.src = audioFiles.opus;
            } else if (audioFiles.mp3 && el.canPlayType(MIME_TYPES.mp3)) {
              el.src = audioFiles.mp3;
            } else if (audioFiles.aac && el.canPlayType(MIME_TYPES.aac)) {
              el.src = audioFiles.aac;
            }
          }
          const promise = el.play();
          const isPromise = typeof promise === 'object';
          if (!isPromise) {
            return promise;
          }
          lockPlayRef.current = true;
          const resetLock = () => {
            lockPlayRef.current = false;
          };
          promise.then(resetLock, resetLock);
        },
        pause: () => {
          const el = ref.current;
          if (el && !lockPlayRef.current) {
            return el.pause();
          }
        },
        seek: (time: number) => {
          const el = ref.current;
          if (!el || state.duration === undefined) {
            return;
          }
          time = Math.min(state.duration, Math.max(0, time));
          el.currentTime = time;
        },
        volume: (volume: number) => {
          const el = ref.current;
          if (!el) {
            return;
          }
          volume = Math.min(1, Math.max(0, volume));
          el.volume = volume;
          setState({volume});
        },
        mute: () => {
          const el = ref.current;
          if (!el) {
            return;
          }
          el.muted = true;
        },
        unmute: () => {
          const el = ref.current;
          if (!el) {
            return;
          }
          el.muted = false;
        },
      };
    }, [props, setState, state.duration]);

    React.useEffect(() => {
      const el = ref.current!;
      if (
        !el &&
        process.env.NODE_ENV === 'development' &&
        (tag === 'audio' || tag === 'video')
      ) {
        const hookName = tag === 'audio' ? 'useAudio' : 'useVideo';
        console.error(
          `${hookName}() ref to <${tag}> element is empty at mount. It seem you have not rendered the ${tag} element, which it returns as the first argument:\n\nconst [${tag}] = ${hookName}(…)\n`,
        );
      }
      if (!el) {
        return;
      }
      const {volume, muted, paused} = el;
      setState({
        volume,
        muted,
        paused,
      });
      // If autoplay was requested, play now.
      if (props.autoPlay && paused) {
        controls.play();
      }
    }, [controls, props.autoPlay, props.src, setState]);

    return {element, state, controls, ref};
  };
}

export const useSound = createHTMLMediaHook<HTMLAudioElement>('audio');
