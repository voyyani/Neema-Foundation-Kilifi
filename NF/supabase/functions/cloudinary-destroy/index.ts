/**
 * cloudinary-destroy — removes an asset from Cloudinary after its row is gone.
 *
 * Roadmap 3.11: deleting an image must delete the Cloudinary asset *and* the
 * row. Destroy calls need the API secret, which never reaches the browser, so
 * this function signs the request server-side.
 *
 * POST { public_id: string, resource_type?: 'image' | 'video' }
 * Auth: any active admin role that may manage media (see MEDIA_ROLES).
 * Env:  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * Idempotent: Cloudinary answers `{ result: 'not found' }` for an already
 * deleted asset and we report that as success — the goal is "gone", not
 * "gone by us".
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor } from '../_shared/security.ts';

const MEDIA_ROLES = ['super_admin', 'owner', 'admin', 'content_manager', 'events_manager'];

interface DestroyBody {
  public_id?: string;
  resource_type?: 'image' | 'video';
}

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  const cors = corsHeadersFor(req.headers.get('origin'));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // ── Auth: the caller must be an active admin with a media role ──────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Missing Bearer token.' }, 401);

  const caller = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await caller.auth.getUser();
  if (authError || !user) return json({ error: 'Invalid or expired session.' }, 401);

  const svc = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: profile } = await svc.from('profiles').select('role, is_active').eq('id', user.id).single();
  if (!profile || !profile.is_active || !MEDIA_ROLES.includes(profile.role)) {
    return json({ error: 'Forbidden.' }, 403);
  }

  // ── Input ────────────────────────────────────────────────────────────────
  const body = (await req.json().catch(() => null)) as DestroyBody | null;
  const publicId = body?.public_id?.trim();
  const resourceType = body?.resource_type === 'video' ? 'video' : 'image';
  if (!publicId || publicId.length > 500 || /[<>"'\s]/.test(publicId)) {
    return json({ error: 'public_id is required.' }, 400);
  }

  // ── Signed destroy ───────────────────────────────────────────────────────
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[cloudinary-destroy] Cloudinary credentials not configured');
    return json({ error: 'Cloudinary is not configured on the server.' }, 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signs the sorted parameter string (excluding api_key) + secret.
  const toSign = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1Hex(toSign);

  const form = new FormData();
  form.set('public_id', publicId);
  form.set('invalidate', 'true');
  form.set('timestamp', String(timestamp));
  form.set('api_key', apiKey);
  form.set('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: 'POST',
    body: form,
  });
  const result = (await res.json().catch(() => ({}))) as { result?: string; error?: { message?: string } };

  if (!res.ok) {
    console.error('[cloudinary-destroy] failed', res.status, result);
    return json({ error: result.error?.message ?? `Cloudinary responded ${res.status}` }, 502);
  }

  const gone = result.result === 'ok' || result.result === 'not found';
  if (!gone) return json({ error: `Cloudinary result: ${result.result ?? 'unknown'}` }, 502);

  return json({ ok: true, result: result.result, public_id: publicId, actor: user.id });
});
