import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  TWITTER_HANDLE,
  DEFAULT_OG_IMAGE,
  canonicalUrl,
  type RouteMeta,
} from './routeMeta';

type SeoProps =
  | { meta: RouteMeta }
  | {
      title: string;
      description: string;
      path: string;
      ogImage?: string;
      noindex?: boolean;
    };

/**
 * Renders the full per-page tag set: title, description, canonical, Open Graph
 * and Twitter card. Static routes pass `meta` from routeMeta.ts; dynamic routes
 * (programme, album, event story) pass the fields directly.
 *
 * Mirrors the tag set already used in ProgramDetailPage so the whole site is
 * consistent. `prioritizeSeoTags` keeps these ahead of any other Helmet output.
 */
const Seo: React.FC<SeoProps> = (props) => {
  const meta: RouteMeta = 'meta' in props ? props.meta : props;
  const image = meta.ogImage ?? DEFAULT_OG_IMAGE;
  const url = canonicalUrl(meta.path);

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_KE" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />

      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default Seo;
