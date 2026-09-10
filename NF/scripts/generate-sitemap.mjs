/**
 * Generate dist/sitemap.xml from the route metadata source of truth.
 *
 * Static routes are always included. Programme, album and event-story URLs are
 * appended when real Supabase credentials are present (as on Vercel); without
 * them the sitemap still ships, covering every fixed page. See docs/AUDIT.md §6.2.
 *
 * Run after `vite build`; see the "build" script in package.json.
 */

import { writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { loadRouteMeta, PROJECT_ROOT, escapeText } from './lib/loadRouteMeta.mjs';
import { fetchPublicRows, hasCredentials } from './lib/supabaseFetch.mjs';

const DIST = resolve(PROJECT_ROOT, 'dist');

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = [`    <loc>${escapeText(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod.slice(0, 10)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority !== undefined) {
    parts.push(`    <priority>${priority.toFixed(1)}</priority>`);
  }
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

async function dynamicEntries(ctx) {
  if (!hasCredentials) return [];
  const { SITE_ORIGIN } = ctx;
  const entries = [];

  const programs = await fetchPublicRows(
    'programs',
    'slug,updated_at',
    '&status=eq.published',
  );
  for (const p of programs) {
    if (!p.slug) continue;
    entries.push({
      loc: `${SITE_ORIGIN}/programs/${p.slug}`,
      lastmod: p.updated_at,
      changefreq: 'monthly',
      priority: 0.8,
    });
  }

  const albums = await fetchPublicRows('media_albums', 'slug,updated_at');
  for (const a of albums) {
    if (!a.slug) continue;
    entries.push({
      loc: `${SITE_ORIGIN}/media/albums/${a.slug}`,
      lastmod: a.updated_at,
      changefreq: 'monthly',
      priority: 0.6,
    });
  }

  const events = await fetchPublicRows(
    'events',
    'slug,updated_at',
    '&status=eq.published',
  );
  for (const e of events) {
    if (!e.slug) continue;
    entries.push({
      loc: `${SITE_ORIGIN}/media/events/${e.slug}`,
      lastmod: e.updated_at,
      changefreq: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}

async function main() {
  const ctx = await loadRouteMeta();
  const { STATIC_ROUTES, canonicalUrl } = ctx;
  const today = new Date().toISOString();

  const staticEntries = STATIC_ROUTES.filter((r) => !r.noindex).map((r) => ({
    loc: canonicalUrl(r.path),
    lastmod: today,
    changefreq: r.changefreq,
    priority: r.priority,
  }));

  const entries = [...staticEntries, ...(await dynamicEntries(ctx))];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map(urlEntry).join('\n') +
    `\n</urlset>\n`;

  await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8');

  console.log(
    `[sitemap] wrote ${entries.length} URLs ` +
      `(${staticEntries.length} static, ${entries.length - staticEntries.length} dynamic` +
      `${hasCredentials ? '' : ', no Supabase credentials — dynamic routes skipped'})`,
  );
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
