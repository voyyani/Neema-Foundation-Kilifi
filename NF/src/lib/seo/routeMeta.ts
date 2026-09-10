/**
 * Single source of truth for public-route SEO metadata.
 *
 * Read by three consumers:
 *   1. <Seo> at runtime (react-helmet-async)
 *   2. scripts/generate-static-meta.mjs at build time (crawlers without JS)
 *   3. scripts/generate-sitemap.mjs at build time
 *
 * Keep this file free of React and browser APIs — Node imports it directly
 * during the build.
 */

export const SITE_ORIGIN = 'https://neemafoundationkilifi.org';
export const SITE_NAME = 'Neema Foundation Kilifi';
export const TWITTER_HANDLE = '@NeemaFoundation';

/**
 * Padded to the 1200x630 declared in og:image:width/height. The source asset
 * is a square logo; without c_pad, social platforms crop it awkwardly.
 */
export const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_1200,h_630,c_pad,b_white/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png';

export interface RouteMeta {
  /** Path with a leading slash and no trailing slash (except '/'). */
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  /** Excluded from the sitemap and marked noindex. */
  noindex?: boolean;
  /** Sitemap hints. */
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export const STATIC_ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Neema Foundation Kilifi — Transforming the Ganze Community',
    description:
      'We work alongside the Ganze community in Kilifi County, Kenya, on education, healthcare and sustainable development. See our programmes, volunteer, or give today.',
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    path: '/programs',
    title: 'Our Programmes — Neema Foundation Kilifi',
    description:
      'Education, healthcare, water and livelihood programmes serving families across Ganze, Kilifi County. Explore the work and the people behind it.',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '/donate',
    title: 'Donate — Neema Foundation Kilifi',
    description:
      'Your gift funds school fees, clean water and medical care in Ganze, Kilifi County. Give by M-Pesa, bank transfer or card.',
    changefreq: 'monthly',
    priority: 0.9,
  },
  {
    path: '/volunteer',
    title: 'Volunteer With Us — Neema Foundation Kilifi',
    description:
      'Give your time and skills to the Ganze community. Teaching, medical, construction and administrative roles for local and international volunteers.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/partner',
    title: 'Partner With Us — Neema Foundation Kilifi',
    description:
      'Corporate, institutional and community partnerships that extend our reach in Kilifi County. Explore how your organisation can work with us.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/sponsorship',
    title: 'Sponsor a Child — Neema Foundation Kilifi',
    description:
      'Sponsor a child in Ganze and cover school fees, uniforms, books and meals. Follow their progress through the year.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/media',
    title: 'Media & Stories — Neema Foundation Kilifi',
    description:
      'Photographs, event albums and stories from our programmes across Ganze, Kilifi County.',
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    path: '/board',
    title: 'Our Board — Neema Foundation Kilifi',
    description:
      'The trustees and leadership guiding Neema Foundation Kilifi, and the governance behind our work.',
    changefreq: 'yearly',
    priority: 0.5,
  },
  {
    path: '/bank-details',
    title: 'Bank & M-Pesa Details — Neema Foundation Kilifi',
    description:
      'Official bank account and M-Pesa paybill details for giving to Neema Foundation Kilifi.',
    changefreq: 'yearly',
    priority: 0.6,
  },
  {
    path: '/legacy-giving',
    title: 'Legacy Giving — Neema Foundation Kilifi',
    description:
      'Leave a lasting gift to the Ganze community. How to include Neema Foundation Kilifi in your will or estate plans.',
    changefreq: 'yearly',
    priority: 0.5,
  },
  {
    path: '/maintenance',
    title: 'Scheduled Maintenance — Neema Foundation Kilifi',
    description:
      'This part of the site is temporarily unavailable while we carry out planned maintenance.',
    noindex: true,
  },
];

/** Look up metadata for a fixed route. Dynamic routes supply their own. */
export function getRouteMeta(path: string): RouteMeta | undefined {
  const normalised =
    path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return STATIC_ROUTES.find((r) => r.path === normalised);
}

/** Absolute canonical URL for a path. */
export function canonicalUrl(path: string): string {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}
