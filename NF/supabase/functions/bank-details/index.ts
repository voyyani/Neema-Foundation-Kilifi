// =============================================================================
// Supabase Edge Function: bank-details
// Neema Foundation Admin Portal
// =============================================================================
//
// The single secure API layer for all bank detail CRUD operations.
//
// Responsibilities:
//   • JWT authentication + role-based authorisation (super_admin / owner / admin)
//   • AES-256-GCM encryption of sensitive fields before DB writes
//   • Masked-only response (plaintext never reaches the browser)
//   • Atomic audit log writes via service-role client
//   • IP address capture for audit trail
//
// Routes:
//   GET    /bank-details               → list all records (admin, masked)
//   GET    /bank-details/:id           → single record   (admin, masked)
//   POST   /bank-details               → create record
//   PATCH  /bank-details/:id            → update record
//   PATCH  /bank-details/:id/toggle     → toggle is_public
//   PATCH  /bank-details/reorder        → bulk sort_order update
//   DELETE /bank-details/:id            → hard delete (owner / super_admin only)
//
// Environment variables (all auto-injected except BANK_DETAILS_ENCRYPTION_KEY):
//   SUPABASE_URL                 — project URL
//   SUPABASE_ANON_KEY            — public anon key (JWT verification)
//   SUPABASE_SERVICE_ROLE_KEY    — service role key (DB writes, audit)
//   BANK_DETAILS_ENCRYPTION_KEY  — 64-char hex string (32 bytes → AES-256)
//
// Generate key:  openssl rand -hex 32
// Set secret:    supabase secrets set BANK_DETAILS_ENCRYPTION_KEY=<hex>
// =============================================================================

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// Types
// =============================================================================

type UserRole = 'super_admin' | 'owner' | 'admin' | 'events_manager' | 'content_manager' | 'viewer';
type PaymentMethodType = 'bank_transfer' | 'mpesa_paybill' | 'mpesa_till' | 'paypal' | 'stripe';
type BankDetailStatus  = 'active' | 'inactive' | 'archived';
type AuditAction       = 'created' | 'updated' | 'deleted' | 'visibility_toggled' | 'view_sensitive';

interface ActorContext {
  id: string;
  email: string;
  role: UserRole;
}

interface RequestContext {
  actor: ActorContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svc: ReturnType<typeof createClient>;
  ip: string | null;
}

interface BankDetailRow {
  id: string;
  method_type: PaymentMethodType;
  label: string;
  bank_name: string | null;
  account_name: string | null;
  account_number_enc: string | null;
  account_number_mask: string | null;
  swift_code_enc: string | null;
  swift_code_mask: string | null;
  iban_enc: string | null;
  iban_mask: string | null;
  paybill_number: string | null;
  till_number: string | null;
  paypal_email: string | null;
  instructions: string | null;
  is_public: boolean;
  sort_order: number;
  status: BankDetailStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface CreateBody {
  method_type: PaymentMethodType;
  label: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;   // plaintext — never stored; encrypted + masked
  swift_code?: string;       // plaintext — never stored; encrypted + masked
  iban?: string;             // plaintext — never stored; encrypted + masked
  paybill_number?: string;
  till_number?: string;
  paypal_email?: string;
  instructions?: string;
  is_public?: boolean;
  sort_order?: number;
  status?: BankDetailStatus;
}

type UpdateBody = Partial<CreateBody>;

interface ReorderItem {
  id: string;
  sort_order: number;
}

// =============================================================================
// Constants
// =============================================================================

const ALLOWED_ROLES: UserRole[]        = ['super_admin', 'owner', 'admin'];
const DELETE_ROLES:  UserRole[]        = ['super_admin', 'owner'];
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

// =============================================================================
// AES-256-GCM Encryption  (Deno Web Crypto API)
// =============================================================================
// Key format: 64-char hex string → 32 bytes → AES-256
// Ciphertext format: base64( iv[12 bytes] || ciphertext )
// A fresh random IV is generated for every encrypt call.

let _cryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (_cryptoKey) return _cryptoKey;

  const hexKey = Deno.env.get('BANK_DETAILS_ENCRYPTION_KEY');
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      'BANK_DETAILS_ENCRYPTION_KEY must be a 64-character hex string. ' +
      'Generate with: openssl rand -hex 32'
    );
  }

  // Convert hex → Uint8Array
  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = parseInt(hexKey.slice(i * 2, i * 2 + 2), 16);
  }

  _cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,   // not extractable
    ['encrypt', 'decrypt'],
  );

  return _cryptoKey;
}

async function encrypt(plaintext: string): Promise<string> {
  const key  = await getCryptoKey();
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );

  // Concatenate iv + ciphertext
  const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

async function decrypt(b64: string): Promise<string> {
  const key      = await getCryptoKey();
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv       = combined.slice(0, 12);
  const cipher   = combined.slice(12);

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher,
  );

  return new TextDecoder().decode(plainBuf);
}

/** Produce a masked display string: "****1234" */
function mask(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length <= 4)  return '****';
  return '****' + trimmed.slice(-4);
}

// =============================================================================
// HTTP Helpers
// =============================================================================

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function unauthorized(msg = 'Unauthorized'):  Response { return json({ error: msg }, 401); }
function forbidden(msg   = 'Forbidden'):      Response { return json({ error: msg }, 403); }
function notFound(msg    = 'Not found'):      Response { return json({ error: msg }, 404); }
function badRequest(msg  = 'Bad request'):    Response { return json({ error: msg }, 400); }

/** Extract best-effort client IP from common proxy headers */
function getClientIp(req: Request): string | null {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    null
  );
}

// =============================================================================
// Auth Middleware
// =============================================================================

async function authenticate(req: Request): Promise<RequestContext | Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return unauthorized('Missing Bearer token.');

  // Verify caller's JWT against the anon client
  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await callerClient.auth.getUser();
  if (authError || !user) return unauthorized('Invalid or expired session.');

  // Create privileged service client for all actual DB operations
  const svc = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Fetch role from profiles (service role bypasses RLS for this check)
  const { data: profile, error: profileError } = await svc
    .from('profiles')
    .select('role, is_active, email, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return forbidden('Could not verify permissions.');
  if (!profile.is_active)       return forbidden('Account is deactivated.');
  if (!ALLOWED_ROLES.includes(profile.role)) {
    return forbidden(`Role '${profile.role}' does not have access to bank details.`);
  }

  return {
    actor: { id: user.id, email: profile.email ?? user.email ?? '', role: profile.role },
    svc,
    ip: getClientIp(req),
  };
}

// =============================================================================
// Audit Helper
// =============================================================================

async function writeAudit(
  ctx: RequestContext,
  bankDetailId: string | null,
  action: AuditAction,
  diff: Record<string, { before: unknown; after: unknown }> = {},
): Promise<void> {
  const { error } = await ctx.svc.from('bank_detail_audit').insert({
    bank_detail_id: bankDetailId,
    action,
    actor_id:    ctx.actor.id,
    actor_email: ctx.actor.email,
    actor_role:  ctx.actor.role,
    diff,
    ip_address:  ctx.ip,
  });

  // Audit failures are non-fatal — log but don't break the response
  if (error) console.error('[audit] write failed:', error.message);
}

// =============================================================================
// Sensitive Field Helpers
// =============================================================================

/**
 * Build the encrypted + masked DB columns from a plaintext form value.
 * Returns { enc, mask } for a given field.  If value is absent, returns nulls
 * so an existing encrypted value is NOT accidentally overwritten.
 */
async function encryptField(
  value: string | undefined | null,
): Promise<{ enc: string | null; msk: string | null }> {
  if (!value?.trim()) return { enc: null, msk: null };
  const enc = await encrypt(value.trim());
  const msk = mask(value.trim());
  return { enc, msk };
}

/**
 * Strip all _enc columns from a row before returning to client.
 * Clients always receive the masked variants only.
 */
function stripEncrypted(row: BankDetailRow) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { account_number_enc, swift_code_enc, iban_enc, ...safe } = row;
  return safe;
}

/**
 * Build a safe diff for audit logging.
 * Never puts plaintext sensitive values into the diff — uses masked variants.
 */
function buildDiff(
  before: Partial<BankDetailRow>,
  after:  Partial<BankDetailRow>,
): Record<string, { before: unknown; after: unknown }> {
  const sensitiveEnc = new Set(['account_number_enc', 'swift_code_enc', 'iban_enc']);
  const diff: Record<string, { before: unknown; after: unknown }> = {};

  for (const key of Object.keys(after) as Array<keyof BankDetailRow>) {
    if (sensitiveEnc.has(key)) continue; // skip raw ciphertext in diffs
    if (before[key] !== after[key]) {
      diff[key] = { before: before[key] ?? null, after: after[key] ?? null };
    }
  }

  return diff;
}

// =============================================================================
// Route Handlers
// =============================================================================

// ── LIST ──────────────────────────────────────────────────────────────────────

async function handleList(ctx: RequestContext): Promise<Response> {
  const { data, error } = await ctx.svc
    .from('bank_details')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return json({ error: error.message }, 500);

  return json({
    data: (data as BankDetailRow[]).map(stripEncrypted),
    total: data?.length ?? 0,
  });
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────

async function handleGet(ctx: RequestContext, id: string): Promise<Response> {
  const { data, error } = await ctx.svc
    .from('bank_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return notFound(`Bank detail '${id}' not found.`);
  if (error) return json({ error: error.message }, 500);

  return json({ data: stripEncrypted(data as BankDetailRow) });
}

// ── CREATE ────────────────────────────────────────────────────────────────────

async function handleCreate(ctx: RequestContext, body: CreateBody): Promise<Response> {
  // Validate required fields
  if (!body.method_type) return badRequest('method_type is required.');
  if (!body.label?.trim()) return badRequest('label is required.');

  const validMethods: PaymentMethodType[] = ['bank_transfer','mpesa_paybill','mpesa_till','paypal','stripe'];
  if (!validMethods.includes(body.method_type)) {
    return badRequest(`Invalid method_type: ${body.method_type}`);
  }

  // Encrypt sensitive fields
  const [acctField, swiftField, ibanField] = await Promise.all([
    encryptField(body.account_number),
    encryptField(body.swift_code),
    encryptField(body.iban),
  ]);

  const insert: Partial<BankDetailRow> = {
    method_type:          body.method_type,
    label:                body.label.trim(),
    bank_name:            body.bank_name?.trim()        ?? null,
    account_name:         body.account_name?.trim()     ?? null,
    account_number_enc:   acctField.enc,
    account_number_mask:  acctField.msk,
    swift_code_enc:       swiftField.enc,
    swift_code_mask:      swiftField.msk,
    iban_enc:             ibanField.enc,
    iban_mask:            ibanField.msk,
    paybill_number:       body.paybill_number?.trim()   ?? null,
    till_number:          body.till_number?.trim()       ?? null,
    paypal_email:         body.paypal_email?.trim()     ?? null,
    instructions:         body.instructions?.trim()     ?? null,
    is_public:            body.is_public  ?? true,
    sort_order:           body.sort_order ?? 0,
    status:               body.status     ?? 'active',
    created_by:           ctx.actor.id,
    updated_by:           ctx.actor.id,
  };

  const { data, error } = await ctx.svc
    .from('bank_details')
    .insert(insert)
    .select('*')
    .single();

  if (error) return json({ error: error.message }, 500);

  const created = data as BankDetailRow;

  await writeAudit(ctx, created.id, 'created', {
    method_type: { before: null, after: created.method_type },
    label:       { before: null, after: created.label },
    is_public:   { before: null, after: created.is_public },
    status:      { before: null, after: created.status },
  });

  return json({ data: stripEncrypted(created), message: 'Payment method created.' }, 201);
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

async function handleUpdate(ctx: RequestContext, id: string, body: UpdateBody): Promise<Response> {
  // Fetch current row first (need it for diff + conditional encryption update)
  const { data: existing, error: fetchError } = await ctx.svc
    .from('bank_details')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError?.code === 'PGRST116') return notFound(`Bank detail '${id}' not found.`);
  if (fetchError) return json({ error: fetchError.message }, 500);

  const cur = existing as BankDetailRow;

  // Build the update object — only include fields that are present in the body
  const update: Partial<BankDetailRow> = { updated_by: ctx.actor.id };

  if (body.method_type   !== undefined) update.method_type   = body.method_type;
  if (body.label         !== undefined) update.label         = body.label.trim();
  if (body.bank_name     !== undefined) update.bank_name     = body.bank_name?.trim()    ?? null;
  if (body.account_name  !== undefined) update.account_name  = body.account_name?.trim() ?? null;
  if (body.paybill_number !== undefined) update.paybill_number = body.paybill_number?.trim() ?? null;
  if (body.till_number   !== undefined) update.till_number   = body.till_number?.trim()  ?? null;
  if (body.paypal_email  !== undefined) update.paypal_email  = body.paypal_email?.trim() ?? null;
  if (body.instructions  !== undefined) update.instructions  = body.instructions?.trim() ?? null;
  if (body.is_public     !== undefined) update.is_public     = body.is_public;
  if (body.sort_order    !== undefined) update.sort_order    = body.sort_order;
  if (body.status        !== undefined) update.status        = body.status;

  // Re-encrypt sensitive fields only if new plaintext was provided
  if (body.account_number !== undefined) {
    const f = await encryptField(body.account_number);
    update.account_number_enc   = f.enc;
    update.account_number_mask  = f.msk;
  }
  if (body.swift_code !== undefined) {
    const f = await encryptField(body.swift_code);
    update.swift_code_enc   = f.enc;
    update.swift_code_mask  = f.msk;
  }
  if (body.iban !== undefined) {
    const f = await encryptField(body.iban);
    update.iban_enc   = f.enc;
    update.iban_mask  = f.msk;
  }

  const { data, error } = await ctx.svc
    .from('bank_details')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json({ error: error.message }, 500);

  const updated = data as BankDetailRow;
  const diff = buildDiff(cur, updated);

  if (Object.keys(diff).length > 0) {
    await writeAudit(ctx, id, 'updated', diff);
  }

  return json({ data: stripEncrypted(updated), message: 'Payment method updated.' });
}

// ── TOGGLE VISIBILITY ─────────────────────────────────────────────────────────

async function handleToggle(ctx: RequestContext, id: string): Promise<Response> {
  // Fetch current value
  const { data: existing, error: fetchError } = await ctx.svc
    .from('bank_details')
    .select('id, is_public, label')
    .eq('id', id)
    .single();

  if (fetchError?.code === 'PGRST116') return notFound(`Bank detail '${id}' not found.`);
  if (fetchError) return json({ error: fetchError.message }, 500);

  const prev = existing as { id: string; is_public: boolean; label: string };
  const next = !prev.is_public;

  const { data, error } = await ctx.svc
    .from('bank_details')
    .update({ is_public: next, updated_by: ctx.actor.id })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json({ error: error.message }, 500);

  await writeAudit(ctx, id, 'visibility_toggled', {
    is_public: { before: prev.is_public, after: next },
  });

  return json({
    data: stripEncrypted(data as BankDetailRow),
    message: `'${prev.label}' is now ${next ? 'visible' : 'hidden'} on the public site.`,
  });
}

// ── REORDER ───────────────────────────────────────────────────────────────────

async function handleReorder(ctx: RequestContext, body: ReorderItem[]): Promise<Response> {
  if (!Array.isArray(body) || body.length === 0) {
    return badRequest('Body must be a non-empty array of { id, sort_order }.');
  }

  for (const item of body) {
    if (typeof item.id !== 'string' || typeof item.sort_order !== 'number') {
      return badRequest('Each item must have string id and number sort_order.');
    }
  }

  // Execute all updates in parallel
  const updates = await Promise.all(
    body.map(({ id, sort_order }) =>
      ctx.svc
        .from('bank_details')
        .update({ sort_order, updated_by: ctx.actor.id })
        .eq('id', id)
    ),
  );

  const failed = updates.filter(r => r.error);
  if (failed.length > 0) {
    console.error('[reorder] partial failure:', failed.map(r => r.error?.message));
    return json({ error: 'One or more reorder updates failed.', count: failed.length }, 500);
  }

  // Write single audit entry for the whole reorder operation
  const orderDiff: Record<string, { before: unknown; after: unknown }> = {};
  for (const item of body) {
    orderDiff[item.id] = { before: '(previous)', after: item.sort_order };
  }
  await writeAudit(ctx, null, 'updated', { reorder: { before: null, after: orderDiff } });

  return json({ message: `Reordered ${body.length} record(s).` });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

async function handleDelete(ctx: RequestContext, id: string): Promise<Response> {
  // Hard delete is restricted to owner / super_admin
  if (!DELETE_ROLES.includes(ctx.actor.role)) {
    return forbidden('Only owner or super_admin can permanently delete payment methods.');
  }

  // Fetch for audit before deletion
  const { data: existing, error: fetchError } = await ctx.svc
    .from('bank_details')
    .select('id, label, method_type, status')
    .eq('id', id)
    .single();

  if (fetchError?.code === 'PGRST116') return notFound(`Bank detail '${id}' not found.`);
  if (fetchError) return json({ error: fetchError.message }, 500);

  const { error } = await ctx.svc
    .from('bank_details')
    .delete()
    .eq('id', id);

  if (error) return json({ error: error.message }, 500);

  const row = existing as { id: string; label: string; method_type: string; status: string };

  // Audit row is written AFTER deletion.
  // bank_detail_id FK is ON DELETE SET NULL, so the audit row survives.
  await writeAudit(ctx, id, 'deleted', {
    label:       { before: row.label,       after: null },
    method_type: { before: row.method_type, after: null },
    status:      { before: row.status,      after: null },
  });

  return json({ message: `Payment method '${row.label}' permanently deleted.` });
}

// =============================================================================
// Router
// =============================================================================

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  // Authenticate + authorise for every non-OPTIONS request
  const ctxOrResponse = await authenticate(req);
  if (ctxOrResponse instanceof Response) return ctxOrResponse;
  const ctx = ctxOrResponse;

  // Parse path segments after /bank-details
  // Supabase may route as /functions/v1/bank-details OR just /bank-details
  // so we strip both possible prefixes to get the trailing segments only.
  const url       = new URL(req.url);
  const rawPath   = url.pathname;
  // Strip the function prefix so we work with just the trailing segments
  const stripped  = rawPath.replace(/^(\/functions\/v1)?\/bank-details\/?/, '');
  const parts     = stripped.split('/').filter(Boolean); // e.g. [] | ['uuid'] | ['uuid','toggle'] | ['reorder']

  const method = req.method;

  try {
    // GET /bank-details
    if (method === 'GET' && parts.length === 0) {
      return await handleList(ctx);
    }

    // GET /bank-details/:id
    if (method === 'GET' && parts.length === 1) {
      return await handleGet(ctx, parts[0]);
    }

    // POST /bank-details
    if (method === 'POST' && parts.length === 0) {
      const body = await req.json().catch(() => null);
      if (!body) return badRequest('Request body must be valid JSON.');
      return await handleCreate(ctx, body as CreateBody);
    }

    // PATCH /bank-details/reorder   (must be checked before /:id)
    if (method === 'PATCH' && parts[0] === 'reorder' && parts.length === 1) {
      const body = await req.json().catch(() => null);
      if (!body) return badRequest('Request body must be valid JSON.');
      return await handleReorder(ctx, body as ReorderItem[]);
    }

    // PATCH /bank-details/:id/toggle
    if (method === 'PATCH' && parts.length === 2 && parts[1] === 'toggle') {
      return await handleToggle(ctx, parts[0]);
    }

    // PATCH /bank-details/:id
    if (method === 'PATCH' && parts.length === 1) {
      const body = await req.json().catch(() => null);
      if (!body) return badRequest('Request body must be valid JSON.');
      return await handleUpdate(ctx, parts[0], body as UpdateBody);
    }

    // DELETE /bank-details/:id
    if (method === 'DELETE' && parts.length === 1) {
      return await handleDelete(ctx, parts[0]);
    }

    return json({ error: `Route not found: ${method} /${parts.join('/')}` }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[bank-details] unhandled error:', message);
    return json({ error: 'Internal server error.' }, 500);
  }
});
