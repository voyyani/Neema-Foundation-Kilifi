/**
 * ImageGalleryJsonLd — Structured data (JSON-LD) for image galleries
 * Neema Foundation Kilifi — Phase 6 · SEO
 *
 * Emits Schema.org ImageGallery structured data for rich search results.
 * Used on AlbumPage, ProgramGalleryPage, and EventStoryPage.
 *
 * References:
 *   - https://schema.org/ImageGallery
 *   - https://schema.org/ImageObject
 *   - https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageGalleryJsonLdProps {
  /** Gallery / album name */
  name: string;
  /** Gallery description */
  description?: string | null;
  /** Canonical URL for this gallery page */
  url: string;
  /** Date the photos were taken or album was created (ISO 8601) */
  datePublished?: string | null;
  /** array of images in the gallery */
  images: {
    url: string;
    caption?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
    dateCreated?: string | null;
    cloudinaryId?: string | null;
  }[];
  /** Organization name */
  organizationName?: string;
  /** Optional cover/thumbnail image URL for the gallery */
  thumbnailUrl?: string | null;
  /** Optional program name (for program-linked galleries) */
  programName?: string | null;
}

// ─── Cloudinary OG-size URL ──────────────────────────────────────────────────

function toOGUrl(url: string): string {
  if (!url) return '';
  const marker = '/upload/';
  const pos = url.indexOf(marker);
  if (pos !== -1) {
    return `${url.slice(0, pos + marker.length)}w_1200,h_630,c_fill,q_auto,f_auto/${url.slice(pos + marker.length)}`;
  }
  return url;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ImageGalleryJsonLd: React.FC<ImageGalleryJsonLdProps> = ({
  name,
  description,
  url,
  datePublished,
  images,
  organizationName = 'Neema Foundation Kilifi',
  thumbnailUrl,
  programName,
}) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    ...(description && { description }),
    url,
    ...(datePublished && { datePublished }),
    ...(thumbnailUrl && { thumbnailUrl: toOGUrl(thumbnailUrl) }),
    ...(programName && {
      about: {
        '@type': 'Thing',
        name: programName,
      },
    }),
    provider: {
      '@type': 'NGO',
      name: organizationName,
      url: 'https://neemafoundationkilifi.org',
      logo: 'https://neemafoundationkilifi.org/logo.png',
      sameAs: [
        'https://www.instagram.com/neemafoundation_kilifi/',
        'https://www.facebook.com/neemafoundationkilifi',
      ],
    },
    numberOfItems: images.length,
    image: images.slice(0, 20).map((img, i) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      ...(img.caption && { caption: img.caption }),
      ...(img.alt && { name: img.alt }),
      ...(img.width && img.height && {
        width: img.width,
        height: img.height,
      }),
      ...(img.dateCreated && { dateCreated: img.dateCreated }),
      position: i + 1,
      creditText: organizationName,
      copyrightNotice: `© ${new Date().getFullYear()} ${organizationName}`,
      license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
      acquireLicensePage: 'https://neemafoundationkilifi.org/contact',
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default ImageGalleryJsonLd;
