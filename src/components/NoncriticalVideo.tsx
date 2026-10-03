import {useCSS} from '@/hooks/useCSS';
import {useIsBot} from './UserAgentContext';
import {StyleObject} from 'styletron-react';
import * as React from 'react';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';
import {useAfterCritical} from '@/hooks/useLoadOrder';
import {isMotionPaused, useMotion} from '@/hooks/useMotion';

export enum VideoMimeType {
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
}

export enum Codec {
  AV1 = 'av01.0.00M.10.0.111.01.01.01.0',
  H264 = 'avc1.4D0033',
  H265 = 'hvc1.1.6.L120.90', // (aka HEVC) For Safari on iOS.
  VP9 = 'vp09.00.40.08.01.01.01.01.00',
}

export type VideoSource = {
  src: string;
  mimeType: VideoMimeType;
  codec: Codec;
};

export const NoncriticalVideo = ({
  height,
  poster,
  sources,
  style,
  width,
}: {
  height: number;
  poster?: string;
  sources: Array<VideoSource>;
  style?: StyleObject;
  width: number;
}) => {
  const css = useCSS();

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const visibleRef = React.useRef(false);
  const {paused} = useMotion();
  // These videos are far from the top of the page. Until the stills of the
  // home hero are in (on the other pages, from the first render), the video
  // asks for nothing: its poster and its first bytes would share the bandwidth
  // with the stills, which the user sees first. So, the static page has
  // neither.
  const afterCritical = useAfterCritical();

  // The video loops while it is on screen, unless the "Pause animations"
  // toggle is on. Then it stops on the frame it shows.
  const update = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    // Not `paused`: in the first render in the browser, it is still the value
    // of the static export.
    if (visibleRef.current && !isMotionPaused()) {
      const playPromise = video.play();
      playPromise?.catch?.((err: DOMException) => {
        if (err.name === 'NotAllowedError') {
          console.warn('[Video] Autoplay blocked by browser:', err.message);
        } else if (err.name !== 'AbortError') {
          // Ignore `AbortError`, which happens when video is paused before fully loaded
          console.warn('[Video] Playback error:', err);
        }
      });
    } else {
      video.pause();
    }
  }, []);
  useIntersectionVisibility(
    videoRef,
    React.useCallback(
      intersecting => {
        visibleRef.current = intersecting;
        update();
      },
      [update],
    ),
  );
  React.useEffect(update, [paused, update]);

  const isBot = useIsBot();
  if (isBot) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      className={css({
        overflow: 'hidden',
        // position: 'relative',
        height: `${height}px`,
        ...style,
      })}
    >
      <video
        ref={videoRef}
        muted
        // No `autoPlay`: it would start before React knows whether the
        // animations are paused. The effect above plays it.
        loop
        // For iOS, opt in to inline video playback so the video can autoplay without entering full-screen mode.
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload={afterCritical ? 'metadata' : 'none'}
        height={height}
        width={width}
        poster={afterCritical ? poster : undefined}
        className={css({
          // position: 'absolute',
          // minHeight: '100%',
          // minWidth: '100%',
          objectFit: 'cover',
          width: '100%',
          height: '100%',

          // top: '50%',
          // left: '50%',
          // transform: 'translate(-50%, -50%)',
        })}
      >
        {sources.map(({src, mimeType, codec}) => (
          <source key={src} src={src} type={`${mimeType}; codecs="${codec}"`} />
        ))}
      </video>
    </div>
  );
};
