/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';

export const useAsyncImage = (src: string): [HTMLImageElement, boolean] => {
  if (typeof Image === 'undefined') {
    return [null, false];
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

export const useAsyncVideo = (tracks: {
  [mimeType: string]: string;
}): [HTMLVideoElement, boolean] => {
  if (typeof Image === 'undefined') {
    return [null, false];
  }
  const video = React.useRef<HTMLVideoElement>();
  const [loaded, setLoaded] = React.useState(false);
  if (!video.current) {
    const vid = document.createElement('video');
    video.current = vid;
    Object.keys(tracks).forEach(mimeType => {
      const source = document.createElement('source');
      source.src = tracks[mimeType];
      source.type = mimeType;
      vid.appendChild(source);
    });
    vid.onloadeddata = () => {
      setLoaded(true);
    };
  }
  return [video.current, loaded];
};
