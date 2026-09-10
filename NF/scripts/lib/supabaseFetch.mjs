/**
 * Minimal Supabase REST reader for build-time scripts.
 *
 * Returns [] when credentials are absent instead of throwing, so local and CI
 * builds succeed without secrets (.github/workflows/ci.yml builds with
 * placeholder values). On Vercel, where VITE_SUPABASE_* are real, dynamic
 * routes are picked up automatically with no extra configuration.
 */

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

/** A placeholder URL means CI, not a real project. */
const isPlaceholder =
  SUPABASE_URL.includes('placeholder') || SUPABASE_KEY.includes('placeholder');

export const hasCredentials = Boolean(
  SUPABASE_URL && SUPABASE_KEY && !isPlaceholder,
);

/**
 * Fetch rows from a public table via PostgREST.
 *
 * @param {string} table  table or view name
 * @param {string} select comma-separated column list
 * @param {string} filter extra querystring, e.g. '&status=eq.published'
 * @returns {Promise<Array<Record<string, unknown>>>} rows, or [] on any failure
 */
export async function fetchPublicRows(table, select, filter = '') {
  if (!hasCredentials) return [];

  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}${filter}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn(
        `[build] ${table}: HTTP ${res.status} — skipping its dynamic routes`,
      );
      return [];
    }

    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.warn(
      `[build] ${table}: ${err.message} — skipping its dynamic routes`,
    );
    return [];
  }
}
