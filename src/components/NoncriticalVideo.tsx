import {useCSS} from '@/hooks/useCSS';
import {useIsBot} from './UserAgentContext';
import {StyleObject} from 'styletron-react';
import * as React from 'react';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';

export enum MimeType {
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
}

export enum Codec {
  AV1 = 'av01.0.00M.10.0.111.01.01.01.0',
  H264 = 'avc1.4D0033',
  H265 = 'hvc1.1.6.L120.90', // (aka HEVC) For Safari on iOS.
  VP9 = 'vp09.00.40.08.01.01.01.01.00',
}

type Source = {
  src: string;
  mimeType: MimeType;
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
  sources: Source[];
  style?: StyleObject;
  width: number;
}) => {
  const css = useCSS();

  const videoRef = React.useRef<HTMLVideoElement>(null);
  useIntersectionVisibility(
    videoRef,
    React.useCallback(intersecting => {
      if (intersecting) {
        videoRef.current?.play();
      } else {
        videoRef.current?.pause();
      }
    }, []),
  );

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
        autoPlay
        loop
        // For iOS, opt in to inline video playback so the video can autoplay without entering full-screen mode.
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="metadata"
        height={height}
        width={width}
        poster={poster}
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
