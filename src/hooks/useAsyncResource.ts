/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';

export type AsyncDrawable = [HTMLImageElement | HTMLVideoElement, boolean];

export const useAsyncImage = (src: string): [HTMLImageElement, boolean] => {
  if (typeof Image === 'undefined') {
    return [null as any, false];
  }
  const returnValue = React.useRef<[any, any]>([null, false]);
  const image = React.useRef<HTMLImageElement>();
  const [loaded, setLoaded] = React.useState(false);
  if (!image.current) {
    const img = new Image();
    img.src = src;
    image.current = img;
    img.onload = () => {
      setLoaded(true);
    };
  }
  React.useEffect(() => {
    let unloaded = false;
    if (!image.current) return;
    image.current!.onload = () => {
      if (unloaded) return;
      setLoaded(true);
    };
    return () => {
      unloaded = true;
    };
  });
  returnValue.current[0] = image.current;
  returnValue.current[1] = loaded;
  return returnValue.current;
};

export const AV1_MIME = 'video/mp4; codecs=av01.0.00M.10.0.111.01.01.01.0';

export const useAsyncVideo = (
  tracks: {
    [mimeType: string]: string;
  },
  doLoad: boolean,
  autoplay: boolean = false,
): [HTMLVideoElement, boolean] => {
  const returnValue = React.useRef<[any, any]>([null, false]);
  const video = React.useRef<HTMLVideoElement>();
  React.useEffect(() => {
    console.log('Loading');
    return () => {
      console.log('Unloading');
      if (!video.current) return;
      video.current!.pause();
      video.current!.remove();
    };
  }, []);
  if (typeof Image === 'undefined') {
    return [null as any, false];
  }
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let unloaded = false;
    if (!video.current) return;
    video.current!.onload = () => {
      if (unloaded) return;
      setLoaded(true);
    };
    return () => {
      unloaded = true;
    };
  });
  if (!doLoad) {
    return [null as any, false];
  }
  if (!video.current) {
    const vid = document.createElement('video');
    video.current = vid;
    Object.keys(tracks)
      .sort(
        // Sort by length descending
        (a, b) => b.length - a.length,
      )
      .forEach(mimeType => {
        const source = document.createElement('source');
        source.src = tracks[mimeType];
        source.type = mimeType;
        vid.appendChild(source);
      });
    vid.loop = autoplay;
    vid.controls = false;
    vid.autoplay = autoplay;
    vid.muted = true;
    vid.playsInline = true;
    vid.oncanplaythrough = () => {
      setLoaded(true);
    };
    vid.load();
    if (vid.readyState >= 3) {
      setLoaded(true);
    }
    vid.style.position = 'fixed';
    vid.style.pointerEvents = 'none';
    vid.style.top = '0';
    vid.style.opacity = '0';
    vid.style.height = '1px';
    vid.style.width = '1px';
    document.body.appendChild(vid);
  }
  returnValue.current[0] = video.current;
  returnValue.current[1] = loaded;
  return returnValue.current;
};

export enum AudioMimeType {
  AAC = 'audio/aac',
  MP3 = 'audio/mpeg',
  OPUS = 'audio/ogg',
}

export const useAsyncAudio = (
  tracks: {
    [mimeType: string]: string;
  },
  doLoad: boolean,
  autoplay: boolean = false,
): [HTMLAudioElement, boolean] => {
  const returnValue = React.useRef<[any, any]>([null, false]);
  const audio = React.useRef<HTMLAudioElement>();
  React.useEffect(() => {
    return () => {
      if (!audio.current) return;
      audio.current!.pause();
      audio.current!.remove();
    };
  }, []);
  if (typeof Audio === 'undefined') {
    return [null as any, false];
  }
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let unloaded = false;
    if (!audio.current) return;
    audio.current!.onload = () => {
      if (unloaded) return;
      setLoaded(true);
    };
    return () => {
      unloaded = true;
    };
  });
  if (!doLoad) {
    return [null as any, false];
  }
  if (!audio.current) {
    const aud = document.createElement('audio');
    audio.current = aud;
    Object.keys(tracks)
      .sort((a, b) => b.length - a.length)
      .forEach(mimeType => {
        const track = tracks[mimeType];
        if (!aud.canPlayType(mimeType)) {
          return;
        }
        const source = document.createElement('source');
        source.src = track;
        source.type = mimeType;
        aud.appendChild(source);
      });
    aud.loop = autoplay;
    aud.controls = false;
    aud.autoplay = autoplay;
    aud.muted = true;
    aud.oncanplaythrough = () => {
      setLoaded(true);
    };
    aud.load();
    if (aud.readyState >= 3) {
      setLoaded(true);
    }
    aud.style.position = 'fixed';
    aud.style.pointerEvents = 'none';
    aud.style.top = '0';
    aud.style.opacity = '0';
    aud.style.height = '1px';
    aud.style.width = '1px';
    document.body.appendChild(aud);
  }
  returnValue.current[0] = audio.current;
  returnValue.current[1] = loaded;
  return returnValue.current;
};

export function preferDrawable(a: AsyncDrawable, b: AsyncDrawable) {
  return a[1] ? a : b;
}
