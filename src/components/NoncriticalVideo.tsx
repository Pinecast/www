import {useCSS} from '@/hooks/useCSS';
import {useIsBot} from './UserAgentContext';
import {StyleObject} from 'styletron-react';
import * as React from 'react';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';

export const NoncriticalVideo = ({
  av1Source,
  defaultSource,
  height,
  style,
  width,
}: {
  av1Source?: string;
  defaultSource: string;
  height: number;
  width: number;
  style?: StyleObject;
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
        disablePictureInPicture
        disableRemotePlayback
        height={height}
        width={width}
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
        {av1Source && <source src={av1Source} type="video/mp4; codecs=av01" />}
        <source src={defaultSource} />
      </video>
    </div>
  );
};
