/**
 * Emit one static HTML file per public route, so crawlers that do not execute
 * JavaScript still receive correct per-page metadata.
 *
 * Why this exists (docs/AUDIT.md §6.1): Facebook, WhatsApp, X and LinkedIn do
 * not run JavaScript. They read the raw HTML. With a single index.html serving
 * every route, every shared link previewed identically regardless of the page.
 *
 * How it works: vite build emits one dist/index.html. For each route we write a
 * copy whose <!-- Primary Meta Tags --> … twitter:image block is replaced with
 * that route's tags. Script tags, asset links and the app shell are untouched,
 * so the browser experience is byte-for-byte the same SPA — only the <head>
 * differs. No React is rendered in Node, so nothing written for the browser
 * runs at build time.
 *
 * Run after `vite build`; see the "build" script in package.json.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import {
  loadRouteMeta,
  PROJECT_ROOT,
  escapeAttr,
  escapeText,
} from './lib/loadRouteMeta.mjs';
import { fetchPublicRows, hasCredentials } from './lib/supabaseFetch.mjs';

const DIST = resolve(PROJECT_ROOT, 'dist');

/** Matches the meta block in index.html, from the comment to twitter:image. */
const META_BLOCK =
  /<!-- Primary Meta Tags -->[\s\S]*?<meta property="twitter:image"[^>]*>/;

function buildMetaBlock(meta, ctx) {
  const { SITE_NAME, TWITTER_HANDLE, DEFAULT_OG_IMAGE, canonicalUrl } = ctx;
  const image = meta.ogImage ?? DEFAULT_OG_IMAGE;
  const url = canonicalUrl(meta.path);

  const t = escapeAttr(meta.title);
  const d = escapeAttr(meta.description);

  return `<!-- Primary Meta Tags -->
    <title>${escapeText(meta.title)}</title>
    <meta name="title" content="${t}">
    <meta name="description" content="${d}">
    <meta name="author" content="${escapeAttr(SITE_NAME)}">
    <meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}">
    <link rel="canonical" href="${escapeAttr(url)}">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escapeAttr(SITE_NAME)}">
    <meta property="og:url" content="${escapeAttr(url)}">
    <meta property="og:title" content="${t}">
    <meta property="og:description" content="${d}">
    <meta property="og:image" content="${escapeAttr(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_KE">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:site" content="${escapeAttr(TWITTER_HANDLE)}">
    <meta property="twitter:url" content="${escapeAttr(url)}">
    <meta property="twitter:title" content="${t}">
    <meta property="twitter:description" content="${d}">
    <meta property="twitter:image" content="${escapeAttr(image)}">`;
}

/**
 * Dynamic routes, included only when real Supabase credentials are present.
 * Absent credentials are normal (local dev, CI) and simply mean these pages
 * fall through to the SPA catch-all, exactly as they do today.
 */
async function dynamicRoutes(ctx) {
  if (!hasCredentials) return [];
  const routes = [];

  const programs = await fetchPublicRows(
    'programs',
    'slug,name,description',
    '&status=eq.published',
  );
  for (const p of programs) {
    if (!p.slug) continue;
    routes.push({
      path: `/programs/${p.slug}`,
      title: `${p.name} — ${ctx.SITE_NAME}`,
      description:
        (p.description ?? '').slice(0, 300) ||
        `${p.name}, a programme of ${ctx.SITE_NAME} in Ganze, Kilifi County.`,
    });
  }

  return routes;
}

async function main() {
  const ctx = await loadRouteMeta();
  const { STATIC_ROUTES } = ctx;

  const indexPath = join(DIST, 'index.html');
  let shell;
  try {
    shell = await readFile(indexPath, 'utf8');
  } catch {
    console.error('[static-meta] dist/index.html not found — run vite build first');
    process.exit(1);
  }

  if (!META_BLOCK.test(shell)) {
    console.error(
      '[static-meta] could not locate the meta block in dist/index.html.\n' +
        '              index.html must keep its "<!-- Primary Meta Tags -->" comment\n' +
        '              and a twitter:image tag closing the block.',
    );
    process.exit(1);
  }

  const routes = [...STATIC_ROUTES, ...(await dynamicRoutes(ctx))];
  let written = 0;

  for (const meta of routes) {
    // '/' is already dist/index.html; rewrite it in place with proper tags.
    const html = shell.replace(META_BLOCK, buildMetaBlock(meta, ctx));

    if (meta.path === '/') {
      await writeFile(indexPath, html, 'utf8');
    } else {
      const dir = join(DIST, meta.path.replace(/^\//, ''));
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), html, 'utf8');
    }
    written += 1;
  }

  console.log(
    `[static-meta] wrote ${written} route documents ` +
      `(${STATIC_ROUTES.length} static, ${routes.length - STATIC_ROUTES.length} dynamic` +
      `${hasCredentials ? '' : ', no Supabase credentials — dynamic routes skipped'})`,
  );
}

main().catch((err) => {
  console.error('[static-meta] failed:', err);
  process.exit(1);
});
