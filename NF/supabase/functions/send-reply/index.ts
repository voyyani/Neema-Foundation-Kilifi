/**
 * send-reply — Supabase Edge Function
 * Neema Foundation Kilifi
 *
 * Enables admins to reply to contact/partnership submissions and volunteer
 * applications directly from the admin panel. Sends branded HTML emails via
 * Resend and records every reply in the `submission_replies` table.
 *
 * Features:
 *   • Manual replies with custom message
 *   • Quick-reply template support
 *   • Volunteer status-change emails (accepted / rejected / waitlisted)
 *   • Auto-status update: submission moves to 'responded' on reply
 *   • Full NF branding via baseEmailWrapper()
 *   • Quoted original message context in reply emails
 *
 * Security:
 *   • JWT-verified (verify_jwt = true in config.toml)
 *   • Caller must have role: content_manager | admin | owner | super_admin
 *   • Input length limits enforced
 *   • All user content HTML-escaped before template injection
 *
 * Required Supabase Secrets:
 *   RESEND_API_KEY  — from resend.com
 *   EMAIL_FROM      — e.g. Neema Foundation <hello@neemafoundationkilifi.org>
 *
 * Deploy:
 *   npx supabase functions deploy send-reply
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Constants ───────────────────────────────────────────────────────────────

const ALLOWED_ROLES = ['content_manager', 'admin', 'owner', 'super_admin'];
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SUBJECT_LENGTH = 200;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ─── In-memory rate limiter ──────────────────────────────────────────────────
// Tracks send counts per admin user. Entries expire after RATE_LIMIT_WINDOW_MS.
// This is per-isolate — Deno Deploy isolates restart periodically, so it's a
// best-effort guard rather than a persistent store.

interface RateEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateEntry>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // Window expired or first request — start new window
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000); // every 10 minutes

// ─── CORS ────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** HTML-escape user content to prevent XSS in email clients. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert newlines to <br/> for HTML rendering (after escaping). */
function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br/>');
}

/** Format a date in Nairobi timezone. */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-GB', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

/** Extract first name from a full name string. */
function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] || fullName;
}

// ─── Resend Email Sender ─────────────────────────────────────────────────────

interface SendEmailOpts {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  resendEmailId?: string;
  error?: string;
}

async function sendEmail(opts: SendEmailOpts): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.error('[send-reply] RESEND_API_KEY not set');
    return { success: false, error: 'Email service not configured' };
  }

  const from = Deno.env.get('EMAIL_FROM') ?? 'Neema Foundation <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[send-reply] Resend error:', errText);
    return { success: false, error: `Email delivery failed: ${res.status}` };
  }

  const resData = await res.json();
  return { success: true, resendEmailId: resData.id };
}

// ─── Email Templates ─────────────────────────────────────────────────────────

function baseEmailWrapper(content: string): string {
  const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Neema Foundation Kilifi"><circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/><circle cx="32" cy="32" r="26" fill="rgba(255,255,255,0.10)"/><circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/><text x="32" y="38" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="19" font-weight="700" fill="#ffffff" letter-spacing="2">NF</text></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neema Foundation Kilifi</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:36px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:#8B1420;background:linear-gradient(135deg,#700F1A 0%,#9E1826 45%,#B01C2E 100%);padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:4px;background:linear-gradient(90deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.22) 50%,rgba(255,255,255,0.08) 100%);"></td></tr>
              <tr>
                <td style="padding:28px 36px 24px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:18px;">${svgLogo}</td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:0.5px;line-height:1.2;">Neema Foundation Kilifi</p>
                        <p style="margin:5px 0 0;color:rgba(255,255,255,0.60);font-size:11px;text-transform:uppercase;letter-spacing:2.5px;font-weight:500;">Transforming Communities · Kenya</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-top:1px solid rgba(255,255,255,0.15);"></td>
                      <td style="width:24px;text-align:center;padding:0 8px;"><span style="color:rgba(255,255,255,0.30);font-size:16px;line-height:0;">&#9670;</span></td>
                      <td style="border-top:1px solid rgba(255,255,255,0.15);"></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 36px 22px;">
                  <p style="margin:0;color:rgba(255,255,255,0.45);font-size:10.5px;text-transform:uppercase;letter-spacing:3px;font-weight:500;">Healthcare &nbsp;·&nbsp; Education &nbsp;·&nbsp; Empowerment</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 36px 32px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f9fafb;padding:20px 36px;border-top:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:10px;">
                  <a href="https://neemafoundationkilifi.org" style="color:#B01C2E;font-size:11px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">neemafoundationkilifi.org</a>
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <span style="color:#9ca3af;font-size:11px;">Ganze, Kilifi County, Kenya</span>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <p style="margin:0;color:#c4c9d0;font-size:10.5px;line-height:1.6;">
                    This is a personal reply from the Neema Foundation team.<br/>
                    You may respond directly to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BOTTOM ACCENT -->
        <tr>
          <td style="height:5px;background:linear-gradient(90deg,#700F1A,#B01C2E,#700F1A);border-radius:0 0 16px 16px;"></td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Reply email template ────────────────────────────────────────────────────

interface ReplyTemplateData {
  recipientName: string;
  adminMessage: string;
  adminName: string;
  adminRole: string;
  originalMessage: string;
  originalDate: string;
}

function replyEmailTemplate(data: ReplyTemplateData): string {
  const content = `
    <div style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
      ${nl2br(data.adminMessage)}
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;">
      Warmly,<br/>
      <strong>${escapeHtml(data.adminName)}</strong><br/>
      <span style="color:#9ca3af;font-size:13px;">${escapeHtml(data.adminRole)} · Neema Foundation Kilifi</span>
    </p>

    <div style="border-left:3px solid #e5e7eb;padding-left:16px;margin-top:32px;color:#6b7280;">
      <p style="font-size:12px;margin:0 0 8px;font-weight:600;">
        On ${escapeHtml(data.originalDate)}, ${escapeHtml(data.recipientName)} wrote:
      </p>
      <div style="font-size:13px;line-height:1.6;">
        ${nl2br(data.originalMessage)}
      </div>
    </div>
  `;
  return baseEmailWrapper(content);
}

// ── Volunteer status-change templates ───────────────────────────────────────

interface StatusEmailData {
  recipientName: string;
  adminName: string;
  adminRole: string;
  customMessage?: string;
  roles?: string[];
}

function volunteerAcceptedTemplate(data: StatusEmailData): string {
  const rolesText = data.roles?.length
    ? data.roles.join(', ')
    : 'community outreach';

  const content = `
    <div style="background:#ecfdf5;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:24px;">🎉</p>
      <p style="margin:8px 0 0;color:#047857;font-size:16px;font-weight:700;">Application Accepted!</p>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${escapeHtml(firstName(data.recipientName))}</strong>,
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Wonderful news! Your application to volunteer with <strong>Neema Foundation Kilifi</strong>
      has been accepted. We're thrilled to have you join our team.
    </p>

    ${data.customMessage ? `
    <div style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
      ${nl2br(data.customMessage)}
    </div>` : ''}

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;color:#B01C2E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What happens next?</p>
      <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
        <li>Our volunteer coordinator will contact you within <strong>5 business days</strong></li>
        <li>You'll receive your volunteer welcome pack and orientation schedule</li>
        <li>We'll match you with activities based on your interests: <strong>${escapeHtml(rolesText)}</strong></li>
      </ol>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      We can't wait to start making an impact together.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;">
      Warmly,<br/>
      <strong>${escapeHtml(data.adminName)}</strong><br/>
      <span style="color:#9ca3af;font-size:13px;">${escapeHtml(data.adminRole)} · Neema Foundation Kilifi</span>
    </p>
  `;
  return baseEmailWrapper(content);
}

function volunteerRejectedTemplate(data: StatusEmailData): string {
  const content = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${escapeHtml(firstName(data.recipientName))}</strong>,
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Thank you for your interest in volunteering with <strong>Neema Foundation Kilifi</strong>
      and for taking the time to apply. We truly appreciate your willingness to serve.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      After careful review, we're unable to offer a volunteer placement at this time.
      This does not reflect on your abilities — our current capacity and needs sometimes
      mean we can't accommodate every applicant.
    </p>

    ${data.customMessage ? `
    <div style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
      ${nl2br(data.customMessage)}
    </div>` : ''}

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        We encourage you to apply again in the future. You can also support our mission by:
      </p>
      <ul style="margin:8px 0 0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
        <li>Following our work at <a href="https://neemafoundationkilifi.org" style="color:#B01C2E;">neemafoundationkilifi.org</a></li>
        <li>Sharing our programmes with your network</li>
        <li>Re-applying when new opportunities arise</li>
      </ul>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Thank you for your heart for Ganze and the Kilifi community.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;">
      With appreciation,<br/>
      <strong>${escapeHtml(data.adminName)}</strong><br/>
      <span style="color:#9ca3af;font-size:13px;">${escapeHtml(data.adminRole)} · Neema Foundation Kilifi</span>
    </p>
  `;
  return baseEmailWrapper(content);
}

function volunteerWaitlistedTemplate(data: StatusEmailData): string {
  const content = `
    <div style="background:#fffbeb;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:24px;">⏳</p>
      <p style="margin:8px 0 0;color:#B45309;font-size:16px;font-weight:700;">You're on the Waitlist</p>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${escapeHtml(firstName(data.recipientName))}</strong>,
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Thank you for applying to volunteer with <strong>Neema Foundation Kilifi</strong>.
      We've reviewed your application and we're impressed with your experience and motivation.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      We've placed you on our <strong>waitlist</strong> for upcoming volunteer opportunities.
      As soon as a suitable placement becomes available, we'll reach out to you directly.
    </p>

    ${data.customMessage ? `
    <div style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
      ${nl2br(data.customMessage)}
    </div>` : ''}

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#B01C2E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What to expect</p>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
        <li>We typically fill waitlist positions within <strong>2–4 weeks</strong></li>
        <li>You'll receive an email the moment a spot opens up</li>
        <li>No action needed — your application stays active</li>
      </ul>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      We value your patience and your desire to serve the Ganze community.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;">
      Warmly,<br/>
      <strong>${escapeHtml(data.adminName)}</strong><br/>
      <span style="color:#9ca3af;font-size:13px;">${escapeHtml(data.adminRole)} · Neema Foundation Kilifi</span>
    </p>
  `;
  return baseEmailWrapper(content);
}

// ─── Type Definitions ────────────────────────────────────────────────────────

interface ReplyPayload {
  type: 'submission' | 'volunteer';
  targetId: string;
  message: string;
  subject?: string;
  replyType: 'manual' | 'status_change' | 'quick_reply';
  templateKey?: string;
}

interface SubmissionRow {
  id: string;
  type: string;
  name: string;
  email: string;
  subject: string | null;
  message: string | null;
  status: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface VolunteerRow {
  id: string;
  name: string;
  email: string;
  status: string;
  role_preferences: string[];
  motivation: string | null;
  experience: string | null;
  created_at: string;
}

interface CallerProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

// ─── Role label mapping ─────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Administrator',
  owner: 'Director',
  admin: 'Administrator',
  content_manager: 'Content Manager',
  events_manager: 'Events Manager',
  editor: 'Team Member',
  viewer: 'Team Member',
};

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Parse and validate payload ──────────────────────────────────────

  let payload: ReplyPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Type validation
  if (!payload.type || !['submission', 'volunteer'].includes(payload.type)) {
    return json({ error: 'type must be "submission" or "volunteer"' }, 400);
  }

  // Target ID validation
  if (!payload.targetId?.trim()) {
    return json({ error: 'targetId is required' }, 400);
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(payload.targetId)) {
    return json({ error: 'targetId must be a valid UUID' }, 400);
  }

  // Message validation
  if (!payload.message?.trim()) {
    return json({ error: 'message is required' }, 400);
  }
  if (payload.message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `message must be under ${MAX_MESSAGE_LENGTH} characters` }, 400);
  }

  // Subject validation
  if (payload.subject && payload.subject.length > MAX_SUBJECT_LENGTH) {
    return json({ error: `subject must be under ${MAX_SUBJECT_LENGTH} characters` }, 400);
  }

  // Reply type validation
  const validReplyTypes = ['manual', 'status_change', 'quick_reply'];
  if (!payload.replyType || !validReplyTypes.includes(payload.replyType)) {
    return json({ error: `replyType must be one of: ${validReplyTypes.join(', ')}` }, 400);
  }

  // ── 2. Authenticate and authorize caller ───────────────────────────────

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  const callerToken = authHeader.replace('Bearer ', '');

  // Verify JWT and get caller identity
  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${callerToken}` } } },
  );

  const { data: { user: callerUser }, error: authError } = await callerClient.auth.getUser();
  if (authError || !callerUser) {
    return json({ error: 'Unauthorized — invalid session' }, 401);
  }

  // Fetch caller's profile for role check and reply metadata
  const { data: callerProfile, error: profileError } = await callerClient
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', callerUser.id)
    .single();

  if (profileError || !callerProfile) {
    return json({ error: 'Could not verify caller permissions' }, 403);
  }

  if (!ALLOWED_ROLES.includes(callerProfile.role)) {
    return json(
      { error: `Forbidden — requires one of: ${ALLOWED_ROLES.join(', ')}. Your role: ${callerProfile.role}` },
      403,
    );
  }

  // ── 2b. Rate limit check ───────────────────────────────────────────────

  const rateCheck = checkRateLimit(callerProfile.id);
  if (!rateCheck.allowed) {
    const retryAfterSec = Math.ceil((rateCheck.retryAfterMs ?? 3600000) / 1000);
    return json(
      { error: `Rate limit exceeded — max ${RATE_LIMIT_MAX} replies per hour. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.` },
      429,
    );
  }

  // ── 3. Service-role client for DB operations ───────────────────────────

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    let recipientName: string;
    let recipientEmail: string;
    let originalMessage: string;
    let originalDate: string;
    let autoSubject: string;

    // ── 4. Fetch target record ─────────────────────────────────────────

    if (payload.type === 'submission') {
      const { data: submission, error: fetchError } = await serviceClient
        .from('submissions')
        .select('id, type, name, email, subject, message, status, created_at, metadata')
        .eq('id', payload.targetId)
        .single();

      if (fetchError || !submission) {
        return json({ error: 'Submission not found' }, 404);
      }

      const sub = submission as SubmissionRow;
      recipientName = sub.name;
      recipientEmail = sub.email;
      originalMessage = sub.message || '(No message provided)';
      originalDate = formatDate(sub.created_at);
      autoSubject = `Re: ${sub.subject || 'Your Message'} — Neema Foundation`;
    } else {
      // volunteer
      const { data: application, error: fetchError } = await serviceClient
        .from('volunteer_applications')
        .select('id, name, email, status, role_preferences, motivation, experience, created_at')
        .eq('id', payload.targetId)
        .single();

      if (fetchError || !application) {
        return json({ error: 'Volunteer application not found' }, 404);
      }

      const app = application as VolunteerRow;
      recipientName = app.name;
      recipientEmail = app.email;
      originalMessage = app.motivation || app.experience || '(Volunteer application)';
      originalDate = formatDate(app.created_at);
      autoSubject = `Re: Your Volunteer Application — Neema Foundation`;
    }

    const finalSubject = payload.subject?.trim() || autoSubject;
    const adminName = callerProfile.full_name || 'Neema Foundation Team';
    const adminRole = ROLE_LABELS[callerProfile.role] || 'Team Member';

    // ── 5. Build email HTML ────────────────────────────────────────────

    let emailHtml: string;

    if (payload.replyType === 'status_change' && payload.type === 'volunteer') {
      // Use volunteer status-change templates
      const statusData: StatusEmailData = {
        recipientName,
        adminName,
        adminRole,
        customMessage: payload.message.trim(),
      };

      // Determine which template based on templateKey
      if (payload.templateKey === 'volunteer_accepted') {
        // Re-fetch roles for the acceptance template
        const { data: appData } = await serviceClient
          .from('volunteer_applications')
          .select('role_preferences')
          .eq('id', payload.targetId)
          .single();
        statusData.roles = (appData as VolunteerRow | null)?.role_preferences;
        emailHtml = volunteerAcceptedTemplate(statusData);
      } else if (payload.templateKey === 'volunteer_rejected') {
        emailHtml = volunteerRejectedTemplate(statusData);
      } else if (payload.templateKey === 'volunteer_waitlisted') {
        emailHtml = volunteerWaitlistedTemplate(statusData);
      } else {
        // Fallback to standard reply template for unknown status changes
        emailHtml = replyEmailTemplate({
          recipientName,
          adminMessage: payload.message.trim(),
          adminName,
          adminRole,
          originalMessage,
          originalDate,
        });
      }
    } else {
      // Manual reply or quick reply — use the standard reply template
      emailHtml = replyEmailTemplate({
        recipientName,
        adminMessage: payload.message.trim(),
        adminName,
        adminRole,
        originalMessage,
        originalDate,
      });
    }

    // ── 6. Send via Resend ─────────────────────────────────────────────

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: finalSubject,
      html: emailHtml,
      replyTo: callerProfile.email, // Replies go to the admin's real email
    });

    if (!emailResult.success) {
      return json({ error: emailResult.error || 'Failed to send email' }, 502);
    }

    // ── 7. Save reply to submission_replies ────────────────────────────

    const replyRecord = {
      submission_id: payload.type === 'submission' ? payload.targetId : null,
      volunteer_app_id: payload.type === 'volunteer' ? payload.targetId : null,
      subject: finalSubject,
      message: payload.message.trim(),
      sent_by: callerProfile.id,
      sent_by_name: adminName,
      sent_by_email: callerProfile.email,
      resend_email_id: emailResult.resendEmailId || null,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      reply_type: payload.replyType,
      template_used: payload.templateKey || null,
    };

    const { data: reply, error: insertError } = await serviceClient
      .from('submission_replies')
      .insert(replyRecord)
      .select('id')
      .single();

    if (insertError) {
      // Email was sent but DB write failed — log but still report success
      // since the recipient already received the email
      console.error('[send-reply] Failed to save reply record:', insertError.message);
    }

    // ── 8. Auto-update status to 'responded' ──────────────────────────

    const now = new Date().toISOString();

    if (payload.type === 'submission') {
      const { error: statusError } = await serviceClient
        .from('submissions')
        .update({ status: 'responded', responded_at: now, updated_at: now })
        .eq('id', payload.targetId);

      if (statusError) {
        console.error('[send-reply] Failed to update submission status:', statusError.message);
      }
    } else {
      // For volunteer apps, update responded_at (status is managed separately)
      const { error: statusError } = await serviceClient
        .from('volunteer_applications')
        .update({ responded_at: now, updated_at: now })
        .eq('id', payload.targetId);

      if (statusError) {
        console.error('[send-reply] Failed to update volunteer app responded_at:', statusError.message);
      }
    }

    // ── 9. Audit log ────────────────────────────────────────────────

    try {
      await serviceClient.from('audit_log').insert({
        user_id: callerProfile.id,
        action: 'email_reply_sent',
        entity_type: payload.type === 'submission' ? 'submission' : 'volunteer_application',
        entity_id: payload.targetId,
        changes: {
          reply_id: reply?.id ?? null,
          reply_type: payload.replyType,
          template_used: payload.templateKey ?? null,
          resend_email_id: emailResult.resendEmailId ?? null,
        },
      });
    } catch {
      // Audit logging is best-effort — never block the reply flow
      console.error('[send-reply] Failed to write audit log entry');
    }

    // ── 10. Return success ────────────────────────────────────────────

    // Log reply ID and target only — never log message content or emails
    console.log(`[send-reply] Reply ${reply?.id ?? 'unknown'} sent for ${payload.type}/${payload.targetId}`);

    return json({
      success: true,
      replyId: reply?.id ?? null,
      resendEmailId: emailResult.resendEmailId ?? null,
    });

  } catch (err: unknown) {
    console.error('[send-reply] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return json({ error: message }, 500);
  }
});
