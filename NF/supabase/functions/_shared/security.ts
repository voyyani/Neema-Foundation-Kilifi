/**
 * Shared request guards for public Supabase Edge Functions.
 * Phase 0.2 — see docs/AUDIT.md §4.1
 *
 * Every guard here FAILS OPEN when its backing infrastructure is absent
 * (rate-limit table not migrated, Turnstile secret not set), so that adding
 * this module cannot take the live site down before the operator steps in
 * docs/superpowers/plans/2026-09-10-phase-0-stabilisation.md are done.
 */

// ─── HTML escaping ────────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape a single string for safe interpolation into an HTML email body. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
}

/**
 * Recursively escape every string inside a value. Objects and arrays are
 * cloned, so the caller's original — which is what gets written to the
 * database — is left untouched.
 */
export function escapeDeep<T>(value: T): T {
  if (typeof value === 'string') return escapeHtml(value) as unknown as T;
  if (Array.isArray(value)) return value.map(escapeDeep) as unknown as T;
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = escapeDeep(v);
    }
    return out as T;
  }
  return value;
}

// ─── Origin allowlist ─────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'https://neemafoundationkilifi.org',
  'https://www.neemafoundationkilifi.org',
  'http://localhost:5173',
  'https://localhost:5173',
];

/** Vercel preview deployments, e.g. https://nf-abc123-voyyani.vercel.app */
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

export function isOriginAllowed(origin: string | null): boolean {
  // Non-browser clients (curl, server-to-server) send no Origin header at all.
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN.test(origin);
}

/** CORS headers that echo the caller's origin only when it is allowed. */
export function corsHeadersFor(origin: string | null): Record<string, string> {
  const allow = origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

// ─── Client identity ──────────────────────────────────────────────────────────

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
}

/** SHA-256 hex digest — a hash is stored, never a raw IP address. */
async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

/** Minimal structural shape of the Supabase client's `rpc` method. */
type RpcResult = { data: unknown; error: unknown };
type Db = {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<RpcResult>;
};

/**
 * Hourly + daily counters. Returns true when the request is allowed.
 * Fails OPEN if the rate_limits table/function has not been migrated yet.
 */
export async function checkRateLimit(
  db: Db,
  identifier: string,
  maxPerHour: number,
  maxPerDay: number,
): Promise<boolean> {
  try {
    const keyHash = await sha256(identifier);
    const now = new Date();

    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const [hourRes, dayRes] = await Promise.all([
      db.rpc('bump_rate_limit', {
        p_key: `h:${keyHash}`,
        p_window_start: hourStart.toISOString(),
      }),
      db.rpc('bump_rate_limit', {
        p_key: `d:${keyHash}`,
        p_window_start: dayStart.toISOString(),
      }),
    ]);

    if (hourRes.error || dayRes.error) {
      console.warn('[security] rate limit unavailable, failing open');
      return true;
    }

    return Number(hourRes.data) <= maxPerHour && Number(dayRes.data) <= maxPerDay;
  } catch (err) {
    console.warn('[security] rate limit threw, failing open:', err);
    return true;
  }
}

// ─── Cloudflare Turnstile ─────────────────────────────────────────────────────

/**
 * Verify a Turnstile token. Returns true (skipping verification) when
 * TURNSTILE_SECRET_KEY is not configured, so this can ship before the widget
 * is added to the front end.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) return true;
  if (!token) return false;

  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (ip !== 'unknown') body.append('remoteip', ip);

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[security] Turnstile verification failed:', err);
    return false;
  }
}

// ─── Field limits ─────────────────────────────────────────────────────────────

export const FIELD_LIMITS = {
  name: 200,
  email: 320,
  phone: 50,
  location: 200,
  subject: 300,
  organization: 300,
  availability: 100,
  message: 5000,
  motivation: 5000,
  experience: 5000,
  cvUrl: 2000,
} as const;

/** Returns an error string when any known field exceeds its cap, else null. */
export function checkFieldLimits(
  payload: Record<string, unknown>,
): string | null {
  for (const [field, max] of Object.entries(FIELD_LIMITS)) {
    const v = payload[field];
    if (typeof v === 'string' && v.length > max) {
      return `Field "${field}" exceeds the maximum length of ${max} characters.`;
    }
  }
  return null;
}
