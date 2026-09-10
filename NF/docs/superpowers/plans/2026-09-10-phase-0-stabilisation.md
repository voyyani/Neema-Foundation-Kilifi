# Phase 0 — Stabilisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a green production build, close the unauthenticated abuse surface on the public edge functions, and put CI in place so neither can regress.

**Architecture:** Six independent tasks against the existing codebase. Task 1 repairs the TypeScript build by hand-writing the Supabase table types that drifted out of sync — no database credentials required, because the DDL already exists in `migrations/*.sql`. Tasks 3–4 harden the three `verify_jwt = false` edge functions in place, sanitising at the request boundary rather than rewriting 200 lines of email templates. Task 5 adds GitHub Actions to enforce the result.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Supabase (Postgres + Deno Edge Functions), Vercel, GitHub Actions.

**Spec:** [`docs/ROADMAP.md`](../../ROADMAP.md) §Phase 0, grounded in [`docs/AUDIT.md`](../../AUDIT.md) §3, §4, §5.3.

## Global Constraints

- **No tests are written in this phase.** User instruction, overrides the skill's TDD default. Test coverage is Phase 6.3 work. Steps verify via `tsc`, `vite build` and `grep` instead.
- **No feature branch.** Work is committed on a single line of history that `main` fast-forwards onto at the end. User instruction.
- **Do not push.** Commits stay local; the user pushes.
- Commit after each task, ending the message with:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`
- **Never invent secret values.** `.env.local` gets real non-secret values and a clearly-marked placeholder for the anon key.
- Edge functions run on **Deno**, not Node. No `process.env`; remote imports only.
- Every change must keep `npx tsc -b` and `npx vite build` passing.
- **Fail open on infrastructure that is not provisioned yet** (rate-limit table, Turnstile secret, cron secret) so that deploying this work cannot take the live site down before the operator steps are done.
- Supabase project ref: `sflwsxrihvzpbrcwhknl` · URL: `https://sflwsxrihvzpbrcwhknl.supabase.co`

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `src/lib/supabase/types.ts` | Generated DB types — add drifted tables/columns | Modify |
| `src/admin/pages/events/EventDetailPage.tsx` | Fix `.title` → `.name` | Modify |
| `src/admin/components/content/RichTextEditor.tsx` | TipTap v3 `setContent` signature | Modify |
| `src/admin/components/maintenance/RuleForm.tsx` | Remove unreachable `'preview'` branch | Modify |
| `src/__tests__/setup.tsx` | React 19 `JSX` namespace | Modify |
| `vite.config.ts` | Vite 7 `server.https` typing | Modify |
| `.env.local` | Local runtime config (git-ignored) | Create |
| `supabase/functions/_shared/security.ts` | Escaping, origin allowlist, rate limit, Turnstile, field caps | Create |
| `supabase/functions/send-notification/index.ts` | Apply guards to the public form endpoint | Modify |
| `supabase/functions/check-maintenance-schedule/index.ts` | Require `CRON_SECRET` | Modify |
| `supabase/functions/maintenance-notify/index.ts` | Require `CRON_SECRET` | Modify |
| `supabase/migrations/20260910120000_add_rate_limits.sql` | Rate-limit counter table + RPC | Create |
| `src/components/volunteer/ApplicationModal.tsx` | Honeypot field | Modify |
| `src/components/Contact.tsx` | Honeypot field | Modify |
| `src/pages/Partnership.tsx` | Honeypot field | Modify |
| `.github/workflows/ci.yml` | Enforce typecheck, lint ceiling, build, bundle budget | Create |
| `package.json` | Remove dead deps, move CLI to devDependencies | Modify |
| `README.md` | Remove false Three.js claim | Modify |

---

### Task 1: Repair the TypeScript build

**Files:**
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/admin/pages/events/EventDetailPage.tsx:23`
- Modify: `src/admin/components/content/RichTextEditor.tsx:98`
- Modify: `src/admin/components/maintenance/RuleForm.tsx:531`
- Modify: `src/__tests__/setup.tsx:28`
- Modify: `vite.config.ts:17`

**Interfaces:**
- Consumes: nothing.
- Produces: a compiling codebase — `npx tsc -b` exits 0. Every later task depends on this.

**Why hand-write the types:** `npx supabase gen types` needs an authenticated CLI session. The exact DDL is already in the repo at `migrations/add-maintenance-system.sql:105-116`, `migrations/add-onboarding-tracking.sql:10` and `migrations/add-welcome-dismissed.sql:13`. Transcribing it is deterministic and needs no credentials.

- [ ] **Step 1: Add the three drifted `profiles` columns**

In `src/lib/supabase/types.ts`, inside `profiles`, add to **all three** of `Row`, `Insert` and `Update`.

Add to `Row`, after `organization: string | null`:
```ts
          tours_completed: string[] | null
          onboarding_completed_at: string | null
          welcome_dismissed_at: string | null
```

Add to `Insert` and to `Update`, after `organization?: string | null`:
```ts
          tours_completed?: string[] | null
          onboarding_completed_at?: string | null
          welcome_dismissed_at?: string | null
```

- [ ] **Step 2: Add the `maintenance_status_updates` table**

Transcribed from `migrations/add-maintenance-system.sql:105-116`. Add as a new entry in `Tables`, after `partners`:

```ts
      maintenance_status_updates: {
        Row: {
          id: string
          rule_id: string
          title: string
          body: string | null
          progress_pct: number | null
          status_type: string | null
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          rule_id: string
          title: string
          body?: string | null
          progress_pct?: number | null
          status_type?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          rule_id?: string
          title?: string
          body?: string | null
          progress_pct?: number | null
          status_type?: string | null
          created_by?: string | null
          created_at?: string | null
        }
      }
```

- [ ] **Step 3: Fix `EventDetailPage.tsx:23`**

The `Event` interface (`src/admin/types/events.ts:8`) declares `name`, not `title`.

```ts
  // Inject event title into breadcrumb trail (Phase 3 — BUG-08)
  useBreadcrumbEntity(event?.name);
```

- [ ] **Step 4: Fix `RichTextEditor.tsx:98`**

TipTap v3 replaced the boolean `emitUpdate` argument with an options object.

```ts
    editor.commands.setContent(trimmed || '', { emitUpdate: false });
```

- [ ] **Step 5: Remove the unreachable `'preview'` branch in `RuleForm.tsx:531`**

`step` is typed `"message" | "scope" | "schedule" | "severity" | "access"`. `'preview'` is not a member, so `step === 'preview'` is always `false` and `step !== 'preview'` is always `true`; the expression reduces to its last conjunct. Behaviour-preserving.

```tsx
          {currentStepIndex === STEPS.length - 1 ? (
```

- [ ] **Step 6: Fix the `JSX` namespace in `src/__tests__/setup.tsx:28`**

React 19 removed the global `JSX` namespace; it now lives under `React.JSX`.

```tsx
            const Tag = prop as keyof React.JSX.IntrinsicElements;
```

- [ ] **Step 7: Fix `vite.config.ts:17`**

Vite 7 types `server.https` as an options object, not a boolean. `{}` keeps `@vitejs/plugin-basic-ssl` generating a self-signed cert exactly as before.

```ts
    https: {},
```

- [ ] **Step 8: Verify**

Run: `npx tsc -b`
Expected: exits 0, no output.

Run: `npm run build`
Expected: completes with `✓ built in …`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/supabase/types.ts src/admin/pages/events/EventDetailPage.tsx \
        src/admin/components/content/RichTextEditor.tsx \
        src/admin/components/maintenance/RuleForm.tsx \
        src/__tests__/setup.tsx vite.config.ts
git commit -m "fix: repair broken production build (18 TypeScript errors)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Local environment configuration

**Files:**
- Create: `.env.local`

**Interfaces:**
- Consumes: nothing.
- Produces: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for `src/lib/supabase/client.ts:4-5`, which throws at module load if either is missing.

- [ ] **Step 1: Create `.env.local`**

The URL derives from `supabase/.temp/project-ref` and is not a secret. The anon key **must not be invented** — it is left as a marked placeholder.

```bash
cat > .env.local <<'EOF'
# Neema Foundation Kilifi — local development environment
# This file is git-ignored. Never commit it.

# ── Supabase ─────────────────────────────────────────────────────────────
# Project ref: sflwsxrihvzpbrcwhknl (from supabase/.temp/project-ref)
VITE_SUPABASE_URL=https://sflwsxrihvzpbrcwhknl.supabase.co

# REQUIRED — replace PASTE_ANON_KEY_HERE with your anon/publishable key.
# Get it from either:
#   https://supabase.com/dashboard/project/sflwsxrihvzpbrcwhknl/settings/api
#   npx supabase login && npx supabase projects api-keys --project-ref sflwsxrihvzpbrcwhknl
# The anon key is safe in a browser bundle — RLS is what protects your data.
# Never put the service_role key in any VITE_ variable.
VITE_SUPABASE_ANON_KEY=PASTE_ANON_KEY_HERE

# ── Cloudinary (image uploads — see .env.example) ────────────────────────
VITE_CLOUDINARY_CLOUD_NAME=dzqdxosk2
VITE_CLOUDINARY_UPLOAD_PRESET=neema-foundation-unsigned
EOF
```

- [ ] **Step 2: Verify it is git-ignored**

Run: `git check-ignore -v .env.local`
Expected: prints a matching `.gitignore` rule. If it prints nothing, **stop** — do not continue until it is ignored.

- [ ] **Step 3: No commit**

`.env.local` is intentionally untracked. Nothing to commit.

---

### Task 3: Harden the public form endpoint

**Files:**
- Create: `supabase/functions/_shared/security.ts`
- Create: `supabase/migrations/20260910120000_add_rate_limits.sql`
- Modify: `supabase/functions/send-notification/index.ts`
- Modify: `src/components/volunteer/ApplicationModal.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/pages/Partnership.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces, exported from `supabase/functions/_shared/security.ts`:
  - `escapeHtml(value: string): string`
  - `escapeDeep<T>(value: T): T` — recursively escapes every string in an object/array, returning a clone
  - `corsHeadersFor(origin: string | null): Record<string, string>`
  - `isOriginAllowed(origin: string | null): boolean`
  - `clientIp(req: Request): string`
  - `checkRateLimit(db, identifier: string, maxPerHour: number, maxPerDay: number): Promise<boolean>` — `true` = allowed; fails **open**
  - `verifyTurnstile(token: string | undefined, ip: string): Promise<boolean>` — returns `true` when `TURNSTILE_SECRET_KEY` is unset
  - `checkFieldLimits(payload: Record<string, unknown>): string | null`
  - `FIELD_LIMITS` — the cap table

**Design note — escape at the boundary:** the email templates interpolate payload fields in ~15 places across `index.ts:227-410`. Rather than edit each, the handler builds one escaped clone (`safe`) for template rendering while the **unescaped** original still goes to the database, so stored data stays clean and only rendered HTML is escaped.

- [ ] **Step 1: Create the rate-limit migration**

```bash
cat > supabase/migrations/20260910120000_add_rate_limits.sql <<'EOF'
-- Rate limiting for public edge-function endpoints (Phase 0.2)
-- One row per (key, window_start). `key` is a hashed client identifier.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id           BIGSERIAL PRIMARY KEY,
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INT         NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limits_key_window_idx
  ON public.rate_limits (key, window_start DESC);

-- Only the service role touches this table; no public policies are granted.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomically increment the counter for a window and return the new total.
CREATE OR REPLACE FUNCTION public.bump_rate_limit(
  p_key TEXT,
  p_window_start TIMESTAMPTZ
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- Housekeeping: drop windows older than 2 days.
CREATE OR REPLACE FUNCTION public.prune_rate_limits() RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '2 days';
$$;
EOF
```

- [ ] **Step 2: Create the shared security module**

Full file content is given in the implementation; it exports exactly the interface listed above. Key properties: `escapeHtml` maps `& < > " '`; `isOriginAllowed` permits the two production hosts, localhost:5173 (http and https) and `*.vercel.app` previews; `checkRateLimit` hashes the identifier with SHA-256 before storage so raw IPs are never persisted, and returns `true` on any error.

- [ ] **Step 3: Import the guards in `send-notification`**

Add below the existing `createClient` import:

```ts
import {
  escapeDeep,
  corsHeadersFor,
  isOriginAllowed,
  clientIp,
  checkRateLimit,
  verifyTurnstile,
  checkFieldLimits,
} from '../_shared/security.ts';
```

- [ ] **Step 4: Replace the wildcard CORS block**

Replace the `const corsHeaders = { … }` block (`index.ts:24-28`) with a value the handler narrows per request:

```ts
// Default headers; the handler replaces these with origin-specific ones.
let corsHeaders: Record<string, string> = corsHeadersFor(null);
```

- [ ] **Step 5: Add origin, honeypot, validation, field-cap and Turnstile guards to the handler**

Replace from `serve(async (req: Request) => {` through the end of the `validTypes` check with the guarded version: origin allowlist → JSON parse → honeypot (`website` field; returns `200 {success:true}` so bots learn nothing) → required-field check → type check → `checkFieldLimits` → email shape → `verifyTurnstile`.

- [ ] **Step 6: Apply the rate limit after the Supabase client is constructed**

Immediately after `const supabase = createClient(…)` and before the `try {` that performs inserts:

```ts
  // ── Rate limit: 3/hour, 20/day per client ──────────────────────────────────
  const allowed = await checkRateLimit(supabase, `notify:${ip}`, 3, 20);
  if (!allowed) {
    console.warn('[send-notification] rate limited:', ip);
    return json({ error: 'Too many submissions. Please try again later.' }, 429);
  }

  // Escaped clone for email rendering only — DB writes use the raw payload.
  const safe = escapeDeep(payload);
```

- [ ] **Step 7: Route email templates through the escaped clone**

Every `*Email(payload)` call becomes `*Email(safe)`, and the three subject-line interpolations switch from `payload.*` to `safe.*`. The `.insert({ … })` calls keep using `payload`.

Verify: `grep -n "Email(payload)" supabase/functions/send-notification/index.ts`
Expected: no output.

- [ ] **Step 8: Add the honeypot field to the three public forms**

In `ApplicationModal.tsx`, `Contact.tsx` and `Partnership.tsx`: add `const [honeypot, setHoneypot] = useState('');`, render the hidden input, and add `website: honeypot,` to each `supabase.functions.invoke('send-notification', { body: { … } })` call.

```tsx
{/* Honeypot — hidden from humans, filled by bots. Do not remove. */}
<input
  type="text"
  name="website"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
/>
```

- [ ] **Step 9: Verify**

Run: `npx tsc -b && npx vite build`
Expected: both succeed.

- [ ] **Step 10: Commit**

```bash
git add supabase/functions/_shared/security.ts \
        supabase/functions/send-notification/index.ts \
        supabase/migrations/20260910120000_add_rate_limits.sql \
        src/components/volunteer/ApplicationModal.tsx \
        src/components/Contact.tsx src/pages/Partnership.tsx
git commit -m "fix(security): harden public send-notification endpoint

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Authenticate the cron and webhook endpoints

**Files:**
- Modify: `supabase/functions/check-maintenance-schedule/index.ts:299`
- Modify: `supabase/functions/maintenance-notify/index.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: nothing — deliberately self-contained, with no shared import, so each function stays independently deployable.
- Produces: both functions reject requests without a matching `X-Cron-Secret` header.

Both run with `verify_jwt = false` (`supabase/config.toml:26-32`) and neither authenticates its caller today. `check-maintenance-schedule` mutates maintenance state with the service-role key.

**Fail-open note:** the check is skipped when `CRON_SECRET` is unset, so deploying ahead of the operator step cannot break the scheduler.

- [ ] **Step 1: Add the guard to `check-maintenance-schedule`**

Insert immediately after `serve(async (req: Request) => {`:

```ts
  // ── Caller authentication (Phase 0.3 — docs/AUDIT.md §4.2) ────────────────
  // Skipped when CRON_SECRET is unset so this deploys safely ahead of ops.
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
    console.warn('[check-maintenance-schedule] rejected unauthenticated call');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
```

- [ ] **Step 2: Add the same guard to `maintenance-notify`**, changing only the log prefix.

- [ ] **Step 3: Document the operator steps in `.env.example`**

```bash
cat >> .env.example <<'EOF'

### Edge Function Secrets — Phase 0 hardening
# Required by check-maintenance-schedule and maintenance-notify. Until this is
# set the functions accept any caller (fail-open by design so deploys are safe).
#   supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"
# The pg_cron job and the maintenance_status_updates webhook must both send it
# as the header:  X-Cron-Secret: <value>
#
# Optional — enables captcha on public forms once the widget is added:
#   supabase secrets set TURNSTILE_SECRET_KEY=<from dash.cloudflare.com>
EOF
```

- [ ] **Step 4: Verify**

Run: `grep -c "x-cron-secret" supabase/functions/check-maintenance-schedule/index.ts supabase/functions/maintenance-notify/index.ts`
Expected: `1` for each file.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/check-maintenance-schedule/index.ts \
        supabase/functions/maintenance-notify/index.ts .env.example
git commit -m "fix(security): require shared secret on cron edge functions

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Continuous integration

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: a green `npx tsc -b` from Task 1.
- Produces: a CI gate. Typecheck, build and bundle budget block a merge; lint is capped at today's count and ratcheted down over time.

Lint currently reports 254 errors. Blocking on all of them immediately would stop all work, so the workflow pins a **ceiling** that can only be lowered.

- [ ] **Step 1: Create the workflow**

Jobs run with `working-directory: NF`, because the git repository root is `Neema-Foundation-Kilifi/`, one level above the app. Steps: checkout → setup-node 22 with npm cache → `npm ci` → `npx tsc -b` (blocking) → lint against `LINT_MAX=254` → `npx vite build` with placeholder `VITE_` env vars → entry-chunk size check against `MAX_ENTRY_KB=1100`.

- [ ] **Step 2: Verify the YAML parses**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: enforce typecheck, lint ceiling, build and bundle budget

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Dependency hygiene

**Files:**
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a smaller dependency tree and a README that matches reality.

`three` and `@types/three` have **zero imports** anywhere in `src/` (audit §5.3). The `supabase` CLI sits in `dependencies` rather than `devDependencies`. `@types/dompurify` is deprecated — DOMPurify v3 ships its own types.

- [ ] **Step 1: Remove dead dependencies and relocate the CLI**

```bash
npm uninstall three @types/three @types/dompurify
npm uninstall supabase
npm install --save-dev supabase
```

- [ ] **Step 2: Confirm nothing referenced them**

Run: `grep -rn "from 'three'\|from \"three\"\|@types/dompurify" src/ || echo "clean"`
Expected: `clean`

- [ ] **Step 3: Correct the README**

Remove the Three.js badge, the "Animated hero (Three.js)" feature bullet, and the "Three.js 0.180" tech-stack line.

- [ ] **Step 4: Verify**

Run: `npx tsc -b && npx vite build`
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json README.md
git commit -m "chore: drop unused three/dompurify types, move supabase CLI to devDeps

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Operator Follow-Up (not code — the user must do these)

These cannot be done from the repository, and every guard above is designed to fail open until they are:

1. **Paste the Supabase anon key** into `.env.local` (Task 2). The app cannot start locally without it.
2. **Apply the rate-limit migration:** `npx supabase db push`. Until then rate limiting fails open and has no effect.
3. **Set the cron secret:** `supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"`, then add the `X-Cron-Secret` header to the `pg_cron` job and the maintenance webhook. Until then the guard is inert.
4. **Redeploy the edge functions:** `supabase functions deploy send-notification check-maintenance-schedule maintenance-notify`.
5. **Optional — enable captcha:** create a Turnstile site, `supabase secrets set TURNSTILE_SECRET_KEY=…`, then add the widget to the three public forms and pass `turnstileToken` in the request body.

---

## Self-Review

**1. Spec coverage** — every Phase 0 item in `docs/ROADMAP.md` maps to a task:

| Roadmap item | Task |
|---|---|
| 0.1 Fix the build | Task 1 |
| 0.2 Close the spam endpoint | Task 3 |
| 0.3 Authenticate cron endpoints | Task 4 |
| 0.4 Set up CI | Task 5 |
| 0.5 Dependency hygiene | Task 6 |
| `.env` setup (user request) | Task 2 |

Roadmap 0.5 also lists "commit the untracked `docs/` files" — already done; the `*.md` gitignore rule is already removed.

**2. Placeholder scan** — no TBD/TODO. `PASTE_ANON_KEY_HERE` is an intentional, clearly-labelled placeholder for a secret that must not be invented, not a plan gap.

**3. Type consistency** — `escapeDeep`, `corsHeadersFor`, `isOriginAllowed`, `clientIp`, `checkRateLimit`, `verifyTurnstile`, `checkFieldLimits` are defined in Task 3 Step 2 and imported under exactly those names in Step 3. `bump_rate_limit(p_key, p_window_start)` in the migration matches the `db.rpc('bump_rate_limit', { p_key, p_window_start })` call site. The honeypot field is `website` in both the client markup and the server check. Task 4 shares no imports with Task 3, by design.

**Deviations from skill defaults, per explicit user instruction:** no tests (steps verify via `tsc`/`vite build`/`grep`), and no feature branch.
