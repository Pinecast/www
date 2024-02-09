import Image from 'next/image';
import {useCSS} from '@/hooks/useCSS';
import {MIN_TABLET_MEDIA_QUERY, TABLET_BREAKPOINT} from '@/constants';

export enum ImageMimeType {
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export type ImageSource = {
  src: string;
  mimeType: ImageMimeType;
};

export enum PersonaSlug {
  BEGINNER = 'beginner',
  ADVANCED = 'advanced',
  ORGANIZATIONS = 'organizations',
}

type ResponsiveImages = [ImageSource, ImageSource];

export type Persona = {
  slug: PersonaSlug;
  name: string;
  color: string;
  url: string;
  images: ResponsiveImages;
  animatedImages: ResponsiveImages;
};

type PersonaItems = {
  [key: string]: Persona;
};

// The sRGB colors of the video backgrounds don't exactly match the brand colors.
const VIDEO_COLORS = {
  orchid: '#ebb0ff',
  lime: '#a7ff74',
  sky: '#b6edfb',
};

const PICTURE_QUERY_SMALL = `(max-width: ${TABLET_BREAKPOINT}px)`;
const PICTURE_QUERY_WIDE = `(min-width: ${TABLET_BREAKPOINT + 1}px)`;

export const PERSONAS: PersonaItems = {
  beginner: {
    slug: PersonaSlug.BEGINNER,
    name: 'Beginner',
    color: VIDEO_COLORS.orchid,
    url: '/learn/podcasting-for-beginners',
    images: [
      {
        src: '/images/art/user-beginner.small.png',
        mimeType: ImageMimeType.PNG,
      },
      {src: '/images/art/user-beginner.png', mimeType: ImageMimeType.PNG},
    ],
    animatedImages: [
      {
        src: '/images/art/user-beginner.small.webp',
        mimeType: ImageMimeType.WEBP,
      },
      {
        src: '/images/art/user-beginner.webp',
        mimeType: ImageMimeType.WEBP,
      },
    ],
  },
  advanced: {
    slug: PersonaSlug.ADVANCED,
    name: 'Power User',
    color: VIDEO_COLORS.lime,
    url: '/learn/podcasting-for-power-users',
    images: [
      {
        src: '/images/art/user-advanced.small.png',
        mimeType: ImageMimeType.PNG,
      },
      {src: '/images/art/user-advanced.png', mimeType: ImageMimeType.PNG},
    ],
    animatedImages: [
      {
        src: '/images/art/user-advanced.small.webp',
        mimeType: ImageMimeType.WEBP,
      },

      {src: '/images/art/user-advanced.webp', mimeType: ImageMimeType.WEBP},
    ],
  },
  organizations: {
    slug: PersonaSlug.ORGANIZATIONS,
    name: 'Corporate',
    color: VIDEO_COLORS.sky,
    url: '/learn/corporate-podcasting',
    images: [
      {
        src: '/images/art/user-organizations.small.png',
        mimeType: ImageMimeType.PNG,
      },
      {src: '/images/art/user-organizations.png', mimeType: ImageMimeType.PNG},
    ],
    animatedImages: [
      {
        src: '/images/art/user-organizations.small.webp',
        mimeType: ImageMimeType.WEBP,
      },
      {
        src: '/images/art/user-organizations.webp',
        mimeType: ImageMimeType.WEBP,
      },
    ],
  },
};

export const CustomerPersonaAnimation = ({
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
        backgroundColor: `${persona.color}`,
        borderRadius: 'inherit',
        bottom: 0,
        left: 0,
        opacity: isActive ? 1 : 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        top: 0,
        transition: isActive
          ? 'opacity 0.2s ease-in-out'
          : 'opacity 0.1s ease-in-out',
        zIndex,
      })}
    >
      <picture
        className={css({
          borderRadius: 'inherit',
          [MIN_TABLET_MEDIA_QUERY]: {display: 'none'},
        })}
      >
        <source
          srcSet={persona.animatedImages[0].src}
          type={persona.animatedImages[0].mimeType}
          media={PICTURE_QUERY_SMALL}
        />
        <source
          srcSet={persona.images[0].src}
          type={persona.images[0].mimeType}
          media={PICTURE_QUERY_SMALL}
        />
        <Image
          src={persona.images[0].src}
          alt={persona.name}
          width={200}
          height={100}
          loading="lazy"
          className={css({
            backgroundColor: `${persona.color}`,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          })}
        />
      </picture>

      <picture
        className={css({
          borderRadius: 'inherit',
          display: 'none',
          [MIN_TABLET_MEDIA_QUERY]: {
            display: 'block',
          },
        })}
      >
        <source
          srcSet={persona.animatedImages[1].src}
          type="image/webp"
          media={PICTURE_QUERY_WIDE}
        />
        <source
          srcSet={persona.images[1].src}
          type="image/png"
          media={PICTURE_QUERY_WIDE}
        />
        <Image
          src={persona.images[1].src}
          alt={persona.name}
          // This is the image's intrinsic size, not the rendered size,
          // used to cover the parent with the correct aspect ratio.
          width={1060}
          height={1440}
          loading="lazy"
          className={css({
            backgroundColor: `${persona.color}`,
            bottom: 0,
            height: '100%',
            left: 0,
            objectFit: 'cover',
            position: 'absolute',
            right: 0,
            top: 0,
            width: '100%',
          })}
        />
      </picture>
    </div>
  );
};
