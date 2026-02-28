/**
 * send-notification — Supabase Edge Function
 * Neema Foundation Kilifi
 *
 * Handles all public form submissions:
 *   - type: 'contact'      → saves to `submissions`, emails admin
 *   - type: 'partnership'  → saves to `submissions`, emails admin
 *   - type: 'volunteer'    → saves to `volunteer_applications`,
 *                            emails admin + confirmation to applicant
 *
 * Required Supabase Secrets (Settings → Edge Functions → Secrets):
 *   RESEND_API_KEY          — from resend.com
 *   NOTIFICATION_TO_EMAIL   — e.g. neemafoundationkilifi@gmail.com
 *
 * Deploy:
 *   npx supabase functions deploy send-notification
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

function timestamp(): string {
  return new Date().toLocaleString('en-GB', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

// ─── Resend Email Sender ──────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('[send-notification] RESEND_API_KEY not set — skipping email send');
    return;
  }

  // EMAIL_FROM must be a domain verified in your Resend account.
  // For testing without domain verification, use: onboarding@resend.dev
  // For production, verify neemafoundationkilifi.org in Resend and set:
  //   EMAIL_FROM = Neema Foundation <notifications@neemafoundationkilifi.org>
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
    const err = await res.text();
    console.error('[send-notification] Resend error:', err);
    // Non-fatal — we already saved to DB; email failure shouldn't break the UX
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseEmailWrapper(content: string): string {
  // Inline SVG logo — circular NF badge, renders in Gmail/Apple Mail/Outlook web
  const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Neema Foundation Kilifi">
    <!-- Outer ring -->
    <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
    <!-- Mid fill -->
    <circle cx="32" cy="32" r="26" fill="rgba(255,255,255,0.10)"/>
    <!-- Inner ring -->
    <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>
    <!-- NF letters -->
    <text x="32" y="38" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="19" font-weight="700" fill="#ffffff" letter-spacing="2">NF</text>
  </svg>`.replace(/\n\s*/g, '');

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

        <!-- ── HEADER ─────────────────────────────────────────── -->
        <tr>
          <td style="background:#8B1420;background:linear-gradient(135deg,#700F1A 0%,#9E1826 45%,#B01C2E 100%);padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <!-- Top accent stripe -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.22) 50%,rgba(255,255,255,0.08) 100%);"></td>
              </tr>

              <!-- Logo + name row -->
              <tr>
                <td style="padding:28px 36px 24px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <!-- SVG badge -->
                      <td style="vertical-align:middle;padding-right:18px;">${svgLogo}</td>
                      <!-- Name + location -->
                      <td style="vertical-align:middle;">
                        <p style="margin:0;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:0.5px;line-height:1.2;">Neema Foundation Kilifi</p>
                        <p style="margin:5px 0 0;color:rgba(255,255,255,0.60);font-size:11px;text-transform:uppercase;letter-spacing:2.5px;font-weight:500;">Transforming Communities · Kenya</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider with dot ornament -->
              <tr>
                <td style="padding:0 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-top:1px solid rgba(255,255,255,0.15);"></td>
                      <td style="width:24px;text-align:center;padding:0 8px;">
                        <span style="color:rgba(255,255,255,0.30);font-size:16px;line-height:0;">&#9670;</span>
                      </td>
                      <td style="border-top:1px solid rgba(255,255,255,0.15);"></td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Tagline bar -->
              <tr>
                <td style="padding:12px 36px 22px;">
                  <p style="margin:0;color:rgba(255,255,255,0.45);font-size:10.5px;text-transform:uppercase;letter-spacing:3px;font-weight:500;">
                    Healthcare &nbsp;·&nbsp; Education &nbsp;·&nbsp; Empowerment
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- ── BODY ───────────────────────────────────────────── -->
        <tr>
          <td style="padding:40px 36px 32px;">
            ${content}
          </td>
        </tr>

        <!-- ── FOOTER ─────────────────────────────────────────── -->
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
                    Automated notification — do not reply to this email directly.<br/>
                    Use the reply button above to respond to the sender.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── BOTTOM ACCENT ──────────────────────────────────── -->
        <tr>
          <td style="height:5px;background:linear-gradient(90deg,#700F1A,#B01C2E,#700F1A);border-radius:0 0 16px 16px;"></td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function fieldRow(label: string, value: string): string {
  if (!value?.trim()) return '';
  return `<tr>
    <td style="padding:6px 0;vertical-align:top;">
      <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${label}</span>
    </td>
    <td style="padding:6px 0 6px 16px;vertical-align:top;">
      <span style="color:#111827;font-size:14px;">${value.replace(/\n/g, '<br/>')}</span>
    </td>
  </tr>`;
}

// ── Contact email ─────────────────────────────────────────────────────────────

function contactAdminEmail(data: ContactPayload): string {
  const content = `
    <h2 style="margin:0 0 4px;color:#111827;font-size:22px;font-weight:700;">New Contact Message</h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:13px;">Received ${timestamp()}</p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('From', data.name)}
        ${fieldRow('Email', `<a href="mailto:${data.email}" style="color:#B01C2E;">${data.email}</a>`)}
        ${data.phone ? fieldRow('Phone', data.phone) : ''}
        ${fieldRow('Subject', data.subject ?? 'General')}
      </table>
    </div>

    <h3 style="margin:0 0 10px;color:#374151;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Message</h3>
    <div style="background:#fef2f2;border-left:4px solid #B01C2E;padding:16px 20px;border-radius:0 8px 8px 0;color:#1f2937;font-size:14px;line-height:1.7;">
      ${data.message.replace(/\n/g, '<br/>')}
    </div>

    <p style="margin:24px 0 0;">
      <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject ?? 'Your message')}"
         style="display:inline-block;background:#B01C2E;color:#fff;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">
        Reply to ${data.name}
      </a>
    </p>
  `;
  return baseEmailWrapper(content);
}

// ── Partnership email ─────────────────────────────────────────────────────────

function partnershipAdminEmail(data: PartnershipPayload): string {
  const typeLabel: Record<string, string> = {
    corporate: 'Corporate Partnership',
    ngo: 'NGO / Foundation',
    church: 'Church / Faith Group',
    individual: 'Individual Partner',
    other: 'Other',
  };
  const content = `
    <h2 style="margin:0 0 4px;color:#111827;font-size:22px;font-weight:700;">New Partnership Inquiry</h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:13px;">Received ${timestamp()}</p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('Contact', data.name)}
        ${fieldRow('Email', `<a href="mailto:${data.email}" style="color:#B01C2E;">${data.email}</a>`)}
        ${data.organization ? fieldRow('Organisation', data.organization) : ''}
        ${fieldRow('Partnership Type', typeLabel[data.partnershipType ?? 'other'] ?? data.partnershipType ?? 'Not specified')}
      </table>
    </div>

    <h3 style="margin:0 0 10px;color:#374151;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Their Message</h3>
    <div style="background:#fef2f2;border-left:4px solid #B01C2E;padding:16px 20px;border-radius:0 8px 8px 0;color:#1f2937;font-size:14px;line-height:1.7;">
      ${data.message.replace(/\n/g, '<br/>')}
    </div>

    <p style="margin:24px 0 0;">
      <a href="mailto:${data.email}?subject=Re: Your Partnership Inquiry — Neema Foundation"
         style="display:inline-block;background:#B01C2E;color:#fff;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">
        Reply to ${data.name}
      </a>
    </p>
  `;
  return baseEmailWrapper(content);
}

// ── Volunteer — admin email ───────────────────────────────────────────────────

function volunteerAdminEmail(data: VolunteerPayload): string {
  const roles = (data.rolePreferences ?? []).join(', ') || 'Not specified';
  const content = `
    <h2 style="margin:0 0 4px;color:#111827;font-size:22px;font-weight:700;">New Volunteer Application</h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:13px;">Received ${timestamp()}</p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('Applicant', data.name)}
        ${fieldRow('Email', `<a href="mailto:${data.email}" style="color:#B01C2E;">${data.email}</a>`)}
        ${data.phone ? fieldRow('Phone', data.phone) : ''}
        ${data.location ? fieldRow('Location', data.location) : ''}
        ${fieldRow('Availability', data.availability ?? 'Not specified')}
        ${fieldRow('Roles Interested In', roles)}
        ${data.cvUrl ? fieldRow('CV / Resume', `<a href="${data.cvUrl}" style="color:#B01C2E;">View CV</a>`) : ''}
      </table>
    </div>

    ${data.experience ? `
    <h3 style="margin:0 0 10px;color:#374151;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Experience & Skills</h3>
    <div style="background:#f9fafb;border-left:4px solid #6b7280;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;color:#1f2937;font-size:14px;line-height:1.7;">
      ${data.experience.replace(/\n/g, '<br/>')}
    </div>
    ` : ''}

    ${data.motivation ? `
    <h3 style="margin:0 0 10px;color:#374151;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Motivation</h3>
    <div style="background:#fef2f2;border-left:4px solid #B01C2E;padding:16px 20px;border-radius:0 8px 8px 0;color:#1f2937;font-size:14px;line-height:1.7;">
      ${data.motivation.replace(/\n/g, '<br/>')}
    </div>
    ` : ''}

    <p style="margin:24px 0 0;">
      <a href="mailto:${data.email}?subject=Re: Your Volunteer Application — Neema Foundation"
         style="display:inline-block;background:#B01C2E;color:#fff;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">
        Reply to ${data.name}
      </a>
    </p>
  `;
  return baseEmailWrapper(content);
}

// ── Volunteer — applicant confirmation ───────────────────────────────────────

function volunteerConfirmationEmail(data: VolunteerPayload): string {
  const content = `
    <h2 style="margin:0 0 4px;color:#111827;font-size:22px;font-weight:700;">Application Received!</h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:13px;">Thank you for applying — ${timestamp()}</p>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${data.name}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Thank you for applying to volunteer with <strong>Neema Foundation Kilifi</strong>.
      We are so grateful for your willingness to serve the Ganze community.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Our team will review your application and get back to you within <strong>5–7 business days</strong>.
    </p>

    <div style="background:#fef2f2;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#B01C2E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What happens next?</p>
      <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
        <li>Our volunteer coordinator reviews your application</li>
        <li>You may receive a follow-up call or email for a brief interview</li>
        <li>Once confirmed, you'll receive your volunteer welcome pack</li>
      </ol>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
      In the meantime, feel free to explore our work at
      <a href="https://neemafoundationkilifi.org" style="color:#B01C2E;">neemafoundationkilifi.org</a>.
    </p>

    <p style="color:#374151;font-size:14px;margin:0;">
      Warmly,<br/>
      <strong>The Neema Foundation Team</strong><br/>
      <span style="color:#9ca3af;">Ganze, Kilifi County, Kenya</span>
    </p>
  `;
  return baseEmailWrapper(content);
}

// ─── Type definitions ─────────────────────────────────────────────────────────

interface ContactPayload {
  type: 'contact';
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

interface PartnershipPayload {
  type: 'partnership';
  name: string;
  email: string;
  organization?: string;
  partnershipType?: string;
  message: string;
}

interface VolunteerPayload {
  type: 'volunteer';
  name: string;
  email: string;
  phone?: string;
  location?: string;
  experience?: string;
  availability?: string;
  rolePreferences?: string[];
  motivation?: string;
  cvUrl?: string;
}

type Payload = ContactPayload | PartnershipPayload | VolunteerPayload;

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // ── Basic validation ────────────────────────────────────────────────────────
  if (!payload.type || !payload.name?.trim() || !payload.email?.trim()) {
    return json({ error: 'type, name and email are required' }, 400);
  }

  const validTypes = ['contact', 'partnership', 'volunteer'];
  if (!validTypes.includes(payload.type)) {
    return json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, 400);
  }

  const toEmail =
    Deno.env.get('NOTIFICATION_TO_EMAIL') ?? 'neemafoundationkilifi@gmail.com';

  // ── Supabase client (service role for DB writes) ────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    let recordId: string | null = null;

    // ── Save to DB ────────────────────────────────────────────────────────────

    if (payload.type === 'contact') {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          type: 'contact',
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          phone: payload.phone?.trim() ?? null,
          subject: payload.subject?.trim() ?? null,
          message: payload.message.trim(),
          status: 'new',
        })
        .select('id')
        .single();
      if (error) throw error;
      recordId = data?.id ?? null;

      await sendEmail({
        to: toEmail,
        subject: `[NF] New Contact Message — ${payload.subject || 'General'} from ${payload.name}`,
        html: contactAdminEmail(payload),
        replyTo: payload.email,
      });
    }

    if (payload.type === 'partnership') {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          type: 'partnership',
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          subject: payload.partnershipType ?? null,
          message: payload.message.trim(),
          metadata: {
            organization: payload.organization ?? null,
            partnershipType: payload.partnershipType ?? null,
          },
          status: 'new',
        })
        .select('id')
        .single();
      if (error) throw error;
      recordId = data?.id ?? null;

      await sendEmail({
        to: toEmail,
        subject: `[NF] Partnership Inquiry — ${payload.partnershipType ?? 'General'} from ${payload.organization || payload.name}`,
        html: partnershipAdminEmail(payload),
        replyTo: payload.email,
      });
    }

    if (payload.type === 'volunteer') {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .insert({
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          phone: payload.phone?.trim() ?? null,
          location: payload.location?.trim() ?? null,
          experience: payload.experience?.trim() ?? null,
          availability: payload.availability?.trim() ?? null,
          role_preferences: payload.rolePreferences ?? [],
          motivation: payload.motivation?.trim() ?? null,
          cv_url: payload.cvUrl?.trim() ?? null,
          status: 'new',
        })
        .select('id')
        .single();
      if (error) throw error;
      recordId = data?.id ?? null;

      // Email admin
      await sendEmail({
        to: toEmail,
        subject: `[NF] New Volunteer Application — ${payload.name} (${(payload.rolePreferences ?? []).join(', ') || 'unspecified roles'})`,
        html: volunteerAdminEmail(payload),
        replyTo: payload.email,
      });

      // Email applicant confirmation
      await sendEmail({
        to: payload.email,
        subject: `We received your application — Neema Foundation Kilifi`,
        html: volunteerConfirmationEmail(payload),
      });
    }

    return json({ success: true, id: recordId });
  } catch (err: unknown) {
    console.error('[send-notification] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return json({ error: message }, 500);
  }
});
