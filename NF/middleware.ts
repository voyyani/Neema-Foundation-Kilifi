/**
 * Vercel Edge Middleware — SEO-friendly 503 + Retry-After for maintenance pages
 *
 * Phase 7.1: When the site or a specific page is under full_block maintenance,
 * search engines receive a proper 503 Service Unavailable with Retry-After header,
 * preventing de-indexing during planned downtime.
 *
 * How it works:
 *   1. On each request, fetches active maintenance rules from Supabase (cached 30s at edge)
 *   2. If a global full_block rule is active → 503 for all public routes
 *   3. If a page-level full_block rule matches the path → 503 for that path
 *   4. Otherwise, passes through to the SPA normally
 *
 * The client-side React app still handles the visual maintenance UI; this middleware
 * ensures crawlers get the correct HTTP status code.
 */

// Vercel Edge Middleware — standard Web API (no next/server needed for non-Next.js projects)
// Pass-through is achieved by returning undefined; blocking by returning a Response.

// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Default Retry-After in seconds (1 hour) */
const DEFAULT_RETRY_AFTER = 3600;

/** How long to cache maintenance rules at the edge (seconds) */
const CACHE_TTL = 30;

/** Routes that should never be blocked (admin, API, assets, etc.) */
const BYPASS_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/api(\/|$)/,
  /^\/_next(\/|$)/,
  /^\/_vercel(\/|$)/,
  /^\/favicon\.ico$/,
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|webp|avif)$/,
];

/** Map page keys from maintenance_rules.target_key to URL path patterns */
const PAGE_KEY_TO_ROUTE: Record<string, RegExp> = {
  landing: /^\/$/,
  donate: /^\/donate$/,
  bank_details: /^\/bank-details$/,
  legacy_giving: /^\/legacy-giving$/,
  volunteer: /^\/volunteer$/,
  partnership: /^\/partner$/,
  sponsorship: /^\/sponsorship$/,
  board: /^\/board$/,
  programs: /^\/programs$/,
  program_detail: /^\/programs\/[^/]+$/,
  media: /^\/media$/,
  media_event: /^\/media\/events\/[^/]+$/,
  media_album: /^\/media\/albums\/[^/]+$/,
  media_program: /^\/media\/programs\/[^/]+$/,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaintenanceRule {
  id: string;
  scope: string;
  target_key: string;
  severity: string;
  title: string;
  message: string | null;
  estimated_end: string | null;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let cachedRules: MaintenanceRule[] | null = null;
let cacheTimestamp = 0;

async function getActiveRules(): Promise<MaintenanceRule[]> {
  const now = Date.now();
  if (cachedRules && now - cacheTimestamp < CACHE_TTL * 1000) {
    return cachedRules;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/active_maintenance_rules?select=id,scope,target_key,severity,title,message,estimated_end&order=priority.desc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`[maintenance-middleware] Supabase responded ${res.status}`);
      return cachedRules ?? [];
    }

    const data: MaintenanceRule[] = await res.json();
    cachedRules = data;
    cacheTimestamp = now;
    return data;
  } catch (err) {
    console.error('[maintenance-middleware] Failed to fetch rules:', err);
    // Fail open — don't block the site if we can't reach the DB
    return cachedRules ?? [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeRetryAfter(estimatedEnd: string | null): number {
  if (!estimatedEnd) return DEFAULT_RETRY_AFTER;
  const diffSec = Math.ceil((new Date(estimatedEnd).getTime() - Date.now()) / 1000);
  // Clamp: at least 60s, at most 86400s (24h)
  return Math.max(60, Math.min(diffSec, 86400));
}

function isPath(pathname: string, pattern: RegExp): boolean {
  return pattern.test(pathname);
}

function generateMaintenanceHTML(rule: MaintenanceRule): string {
  const title = rule.title || 'Under Maintenance';
  const message = rule.message || 'We are currently performing scheduled maintenance. Please check back shortly.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${title} — Neema Foundation</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
         background:linear-gradient(135deg,#fff 0%,#fef2f2 100%);
         min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
    .container{text-align:center;max-width:480px}
    .icon{width:64px;height:64px;margin:0 auto 1.5rem;background:#fef2f2;border-radius:16px;
          display:flex;align-items:center;justify-content:center;border:1px solid #fecaca}
    .icon svg{width:32px;height:32px;color:#991b1b}
    h1{font-size:1.5rem;font-weight:700;color:#111827;margin-bottom:0.75rem}
    p{font-size:0.938rem;color:#6b7280;line-height:1.6;margin-bottom:1.5rem}
    .cta{display:inline-flex;align-items:center;gap:0.5rem;background:#B01C2E;color:#fff;
         padding:0.75rem 1.5rem;border-radius:12px;text-decoration:none;font-weight:600;font-size:0.875rem}
    .cta:hover{background:#8A1624}
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="mailto:info@neemafoundationkilifi.org" class="cta">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
      </svg>
      Contact Support
    </a>
  </div>
</body>
</html>`;
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export default async function middleware(request: Request): Promise<Response | undefined> {
  const { pathname } = new URL(request.url);

  // Skip bypass patterns (admin, assets, etc.)
  if (BYPASS_PATTERNS.some((p) => p.test(pathname))) {
    return; // pass through to static file serving
  }

  // Only intercept bot/crawler requests with 503
  // Regular browser requests get the SPA (which handles its own maintenance UI)
  const userAgent = (request.headers.get('user-agent') ?? '').toLowerCase();
  const isBot =
    /bot|crawl|spider|slurp|baiduspider|yandex|duckduck|facebot|ia_archiver|semrush|ahref|mj12bot|dotbot|petalbot|gptbot|claudebot|anthropic|bytespider/i.test(
      userAgent,
    ) ||
    // Also serve 503 for curl / wget / programmatic clients that send Accept: text/html
    /^(curl|wget|python-requests|node-fetch|axios)/i.test(userAgent);

  // For regular browser users, let the SPA handle everything
  if (!isBot) {
    return; // pass through to static file serving
  }

  // Fetch active rules
  const rules = await getActiveRules();
  if (rules.length === 0) {
    return; // pass through
  }

  // Check for global full_block
  const globalBlock = rules.find(
    (r) => r.scope === 'global' && r.severity === 'full_block',
  );
  if (globalBlock) {
    const retryAfter = computeRetryAfter(globalBlock.estimated_end);
    return new Response(generateMaintenanceHTML(globalBlock), {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': String(retryAfter),
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // Check for page-level full_block
  for (const rule of rules) {
    if (rule.scope !== 'page' || rule.severity !== 'full_block') continue;
    const routePattern = PAGE_KEY_TO_ROUTE[rule.target_key];
    if (routePattern && isPath(pathname, routePattern)) {
      const retryAfter = computeRetryAfter(rule.estimated_end);
      return new Response(generateMaintenanceHTML(rule), {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': String(retryAfter),
          'X-Robots-Tag': 'noindex',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  }

  // No maintenance match — pass through
  return; // let Vercel serve the static file normally
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|map)).*)',
  ],
};
