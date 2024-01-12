/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';

export type AsyncDrawable = [HTMLImageElement | HTMLVideoElement, boolean];

export const useAsyncImage = (src: string): [HTMLImageElement, boolean] => {
  if (typeof Image === 'undefined') {
    return [null as any, false];
  }
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
  return [image.current, loaded];
};

export const AV1_MIME = 'video/mp4; codecs=av01.0.05M.08';

export const useAsyncVideo = (
  tracks: {
    [mimeType: string]: string;
  },
  doLoad: boolean,
  autoplay: boolean = false
): [HTMLVideoElement, boolean] => {
  const video = React.useRef<HTMLVideoElement>();
  React.useEffect(() => {
    return () => {
      if (!video.current) return;
      video.current!.pause();
      video.current!.remove();
    };
  }, []);
  if (typeof Image === 'undefined') {
    return [null as any, false];
  }
  const [loaded, setLoaded] = React.useState(false);
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
    vid.oncanplaythrough = () => {
      setLoaded(true);
    };
    vid.load();
    vid.style.position = 'fixed';
    vid.style.pointerEvents = 'none';
    vid.style.top = '0';
    vid.style.opacity = '0';
    vid.style.height = '1px';
    vid.style.width = '1px';
    document.body.appendChild(vid);
  }
  return [video.current, loaded];
};

export function preferDrawable(a: AsyncDrawable, b: AsyncDrawable) {
  return a[1] ? a : b;
}
