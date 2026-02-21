// Supabase Edge Function: invite-user
// Sends an invitation email via Supabase Auth Admin API and pre-seeds the
// profile row with the desired role so it is ready the moment the user signs up.
//
// Security model:
//  - Caller must supply a valid Bearer JWT (their admin session token)
//  - The JWT is verified; the caller's profile.role must be 'super_admin' or 'admin'
//  - Everything else uses the auto-injected SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_INVOKE_ROLES = ['super_admin', 'admin'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────
    const { email, role, fullName } = await req.json();

    if (!email || !role) {
      return json({ error: 'email and role are required.' }, 400);
    }

    const validRoles = ['super_admin', 'admin', 'editor', 'viewer', 'volunteer'];
    if (!validRoles.includes(role)) {
      return json({ error: `Invalid role: ${role}` }, 400);
    }

    // ── 2. Verify caller is authenticated and is an admin ─────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header.' }, 401);
    }

    const callerToken = authHeader.replace('Bearer ', '');

    // Use an anon-key client to verify the caller's JWT
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${callerToken}` } } },
    );

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) {
      return json({ error: 'Unauthorized — invalid session.' }, 401);
    }

    // Check the caller's role in profiles
    const { data: callerProfile, error: profileError } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (profileError || !callerProfile) {
      return json({ error: 'Could not verify caller permissions.' }, 403);
    }

    if (!ALLOWED_INVOKE_ROLES.includes(callerProfile.role)) {
      return json({ error: `Forbidden — only admin/super_admin can invite users. Your role: ${callerProfile.role}` }, 403);
    }

    // ── 3. Send invitation using service-role client ───────────────────────
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName || null,
          invited_role: role,          // stored in raw_user_meta_data
        },
        redirectTo: `${Deno.env.get('SITE_URL') || ''}/admin`,
      },
    );

    if (inviteError) {
      // Surface the Supabase error cleanly
      return json({ error: inviteError.message }, 400);
    }

    const invitedUserId = inviteData.user?.id;

    // ── 4. Pre-seed the profiles row so role is set before first login ─────
    if (invitedUserId) {
      await serviceClient
        .from('profiles')
        .upsert(
          {
            id: invitedUserId,
            email,
            full_name: fullName || null,
            role,
            is_active: true,
          },
          { onConflict: 'id' },
        );
    }

    return json({
      success: true,
      message: `Invitation sent to ${email}. They will receive an email to set their password.`,
      userId: invitedUserId,
    });
  } catch (err) {
    console.error('[invite-user]', err);
    return json({ error: 'Internal server error.' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
