import {Codec, MimeType, NoncriticalVideo} from './NoncriticalVideo';
import {useCSS} from '@/hooks/useCSS';

export const VIDEO_WIDTH = 1060;
export const VIDEO_HEIGHT = 1440;

export type VideoSource = {
  src: string;
  mimeType: MimeType;
  codec: Codec;
};

export enum PersonaSlug {
  BEGINNER = 'beginner',
  ADVANCED = 'advanced',
  ORGANIZATIONS = 'organizations',
}

export type Persona = {
  slug: PersonaSlug;
  name: 'Beginner' | 'Power User' | 'Corporate';
  color: string;
  url: string;
  image: string;
  videos: VideoSource[];
};

type PersonaItems = {
  [key: string]: Persona;
};

export const PERSONAS: PersonaItems = {
  beginner: {
    slug: PersonaSlug.BEGINNER,
    name: 'Beginner',
    color: 'var(--color-orchid)',
    url: '/learn/podcasting-for-beginners',
    image: '/images/art/user-beginner.png',
    videos: [
      {
        // Smallest
        src: '/videos/user-beginner.vp9.webm',
        mimeType: MimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-beginner.vp9.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.VP9,
      },
      {
        // Necessary for iOS playback
        src: '/videos/user-beginner.hevc.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-beginner.av1.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.AV1,
      },
    ],
  },
  advanced: {
    slug: PersonaSlug.ADVANCED,
    name: 'Power User',
    color: 'var(--color-lime)',
    url: '/learn/podcasting-for-power-users',
    image: '/images/art/user-advanced.png',
    videos: [
      {
        src: '/videos/user-advanced.vp9.webm',
        mimeType: MimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-advanced.vp9.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-advanced.hevc.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-advanced.av1.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.AV1,
      },
    ],
  },
  organizations: {
    slug: PersonaSlug.ORGANIZATIONS,
    name: 'Corporate',
    color: 'var(--color-sky)',
    url: '/learn/corporate-podcasting',
    image: '/images/art/user-organizations.png',
    videos: [
      {
        src: '/videos/user-organizations.vp9.webm',
        mimeType: MimeType.WEBM,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-organizations.vp9.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.VP9,
      },
      {
        src: '/videos/user-organizations.hevc.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.H265,
      },
      {
        src: '/videos/user-organizations.av1.mp4',
        mimeType: MimeType.MP4,
        codec: Codec.AV1,
      },
    ],
  },
};

export const CustomerPersonaVideo = ({
  slug,
  isActive = false,
  zIndex = 0,
}: {
  slug: PersonaSlug;
  isActive?: boolean;
  zIndex?: number;
}) => {
  const css = useCSS();
  const persona = PERSONAS[slug];
  return (
    <div
      className={css({
        // Load the video conditionally once the panel's scroll threshold is reached.
        // This wrapper allows the video to fade in so the entrance feels smoother.
        backgroundColor: `${persona.color}`,
        borderRadius: 'inherit',
        bottom: 0,
        left: 0,
        opacity: isActive ? 1 : 0,
        position: 'absolute',
        right: 0,
        top: 0,
        transition: isActive
          ? 'opacity 0.3s ease-in-out'
          : 'opacity 0.1s ease-in-out',
        zIndex,
      })}
    >
      <NoncriticalVideo
        sources={persona.videos}
        height={VIDEO_HEIGHT}
        width={VIDEO_WIDTH}
        poster={persona.image}
        style={{
          backgroundColor: `${persona.color}`,
          borderRadius: 'inherit',
          height: '100%',
          left: 0,
          objectFit: 'cover',
          position: 'absolute',
          right: 0,
          top: 0,
          width: '100%',
          zIndex,
        }}
      />
    </div>
  );
};
