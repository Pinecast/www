import {useCSS} from '@/hooks/useCSS';
import {useIsBot} from './UserAgentContext';
import {StyleObject} from 'styletron-react';
import * as React from 'react';
import {useIntersectionVisibility} from '@/hooks/useIntersectionVisibility';
import {AV1_MIME} from '@/hooks/useAsyncResource';

export const NoncriticalVideo = ({
  av1Source,
  defaultSource,
  height,
  poster,
  style,
  width,
}: {
  av1Source?: string;
  defaultSource: string;
  height: number;
  poster?: string;
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
        {av1Source && <source src={av1Source} type={AV1_MIME} />}
        <source src={defaultSource} />
      </video>
    </div>
  );
};
