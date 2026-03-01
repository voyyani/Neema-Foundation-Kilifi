/**
 * maintenance-notify — Supabase Edge Function
 * Neema Foundation Kilifi
 *
 * Sends push/email notifications when maintenance status updates are posted.
 * Triggered by a database webhook on INSERT into maintenance_status_updates.
 *
 * Notification channels:
 *  1. Email via Resend — admin team notification
 *  2. (Future) Browser push via Web Push API
 *  3. (Future) Slack/Discord webhook
 *
 * Required Supabase Secrets:
 *   RESEND_API_KEY          — from resend.com
 *   NOTIFICATION_TO_EMAIL   — admin email (e.g. neemafoundationkilifi@gmail.com)
 *   SUPABASE_URL            — auto-injected
 *   SUPABASE_ANON_KEY       — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — for reading rule details
 *   SITE_URL                — public site URL (e.g. https://neemafoundationkilifi.org)
 *
 * Deploy:
 *   npx supabase functions deploy maintenance-notify
 *
 * Database webhook trigger (run once in SQL editor):
 *   SELECT supabase_functions.http_request(
 *     'INSERT',
 *     'maintenance_status_updates',
 *     'https://<project-ref>.supabase.co/functions/v1/maintenance-notify',
 *     '{}',
 *     '5000'
 *   );
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

// ─── Status type styling for email ───────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { emoji: string; color: string; bgColor: string; label: string }
> = {
  info: {
    emoji: 'ℹ️',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    label: 'Information',
  },
  success: {
    emoji: '✅',
    color: '#047857',
    bgColor: '#ECFDF5',
    label: 'Success',
  },
  warning: {
    emoji: '⚠️',
    color: '#B45309',
    bgColor: '#FFFBEB',
    label: 'Warning',
  },
  error: {
    emoji: '🚨',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    label: 'Error',
  },
};

// ─── Resend email sender ─────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn(
      '[maintenance-notify] RESEND_API_KEY not set — skipping email',
    );
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const toAddresses = Array.isArray(opts.to) ? opts.to : [opts.to];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Neema Foundation <notifications@neemafoundationkilifi.org>',
        to: toAddresses,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[maintenance-notify] Resend error:', res.status, errorBody);
      return { success: false, error: `Resend ${res.status}: ${errorBody}` };
    }

    const result = await res.json();
    console.log('[maintenance-notify] Email sent:', result.id);
    return { success: true };
  } catch (err) {
    console.error('[maintenance-notify] Email send failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ─── Build notification email HTML ───────────────────────────────────────────

function buildStatusUpdateEmail(opts: {
  ruleTitle: string;
  ruleTarget: string;
  ruleSeverity: string;
  updateTitle: string;
  updateBody: string | null;
  progressPct: number | null;
  statusType: string;
  createdAt: string;
  siteUrl: string;
  adminUrl: string;
}): string {
  const style = STATUS_STYLES[opts.statusType] ?? STATUS_STYLES.info;
  const progressBar =
    opts.progressPct !== null
      ? `
    <div style="margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-size: 12px; color: #6B7280;">Progress</span>
        <span style="font-size: 12px; font-weight: 700; color: #111827;">${opts.progressPct}%</span>
      </div>
      <div style="background: #E5E7EB; border-radius: 999px; height: 8px; overflow: hidden;">
        <div style="
          background: linear-gradient(90deg, ${style.color}, ${style.color}CC);
          width: ${opts.progressPct}%;
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s;
        "></div>
      </div>
    </div>`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance Status Update</title>
</head>
<body style="margin: 0; padding: 0; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 580px; margin: 0 auto; padding: 24px 16px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="
        display: inline-block;
        background: #B01C2E;
        color: white;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
      ">
        🔧 MAINTENANCE UPDATE
      </div>
    </div>

    <!-- Main card -->
    <div style="
      background: white;
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    ">
      <!-- Status banner -->
      <div style="
        background: ${style.bgColor};
        border-bottom: 1px solid ${style.color}22;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
      ">
        <span style="font-size: 24px;">${style.emoji}</span>
        <div>
          <div style="font-size: 14px; font-weight: 700; color: ${style.color};">
            ${opts.updateTitle}
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">
            ${style.label} · ${timestamp()}
          </div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        ${
          opts.updateBody
            ? `<p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
                ${opts.updateBody}
              </p>`
            : ''
        }

        <!-- Rule info -->
        <div style="
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px;
        ">
          <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Maintenance Rule
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #111827;">
            ${opts.ruleTitle}
          </div>
          <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">
            Target: <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${opts.ruleTarget}</code>
            · Severity: <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${opts.ruleSeverity}</code>
          </div>
        </div>

        ${progressBar}
      </div>

      <!-- Actions -->
      <div style="
        padding: 16px 24px;
        border-top: 1px solid #F3F4F6;
        display: flex;
        gap: 12px;
      ">
        <a href="${opts.adminUrl}" style="
          display: inline-block;
          background: #B01C2E;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        ">
          View in Admin →
        </a>
        <a href="${opts.siteUrl}" style="
          display: inline-block;
          background: #F3F4F6;
          color: #374151;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        ">
          View Public Site
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 11px; color: #9CA3AF;">
        Neema Foundation Kilifi · Maintenance System<br>
        This is an automated notification.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = await req.json();

    // Support both direct invocation and database webhook format
    const record = payload.record ?? payload;

    const {
      rule_id,
      title: updateTitle,
      body: updateBody,
      progress_pct,
      status_type,
    } = record;

    if (!rule_id || !updateTitle) {
      return json({ error: 'Missing required fields: rule_id, title' }, 400);
    }

    console.log(
      `[maintenance-notify] Processing status update for rule ${rule_id}: "${updateTitle}"`,
    );

    // ── Fetch rule details ──────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: rule, error: ruleError } = await supabase
      .from('maintenance_rules')
      .select('id, title, target_key, severity, scope')
      .eq('id', rule_id)
      .single();

    if (ruleError || !rule) {
      console.error('[maintenance-notify] Rule not found:', ruleError);
      return json(
        { error: 'Associated maintenance rule not found' },
        404,
      );
    }

    // ── Build notification ──────────────────────────────────────────────────
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://neemafoundationkilifi.org';
    const adminUrl = `${siteUrl}/admin/maintenance/${rule_id}/edit`;
    const notifyEmail =
      Deno.env.get('NOTIFICATION_TO_EMAIL') ??
      'neemafoundationkilifi@gmail.com';

    const emailResult = await sendEmail({
      to: notifyEmail,
      subject: `${STATUS_STYLES[status_type ?? 'info']?.emoji ?? 'ℹ️'} Maintenance Update: ${updateTitle} [${rule.target_key}]`,
      html: buildStatusUpdateEmail({
        ruleTitle: rule.title,
        ruleTarget: rule.target_key,
        ruleSeverity: rule.severity,
        updateTitle,
        updateBody,
        progressPct: progress_pct,
        statusType: status_type ?? 'info',
        createdAt: new Date().toISOString(),
        siteUrl,
        adminUrl,
      }),
    });

    // ── Log notification to maintenance_audit_log ───────────────────────────
    await supabase.from('maintenance_audit_log').insert({
      rule_id,
      action: 'status_update_notified',
      changes: {
        update_title: updateTitle,
        progress_pct,
        status_type,
        email_sent: emailResult.success,
        email_error: emailResult.error ?? null,
      },
    });

    console.log(
      `[maintenance-notify] Done. Email ${emailResult.success ? 'sent' : 'failed'}.`,
    );

    return json({
      success: true,
      rule_id,
      update_title: updateTitle,
      notifications: {
        email: emailResult,
      },
    });
  } catch (err) {
    console.error('[maintenance-notify] Unhandled error:', err);
    return json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      500,
    );
  }
});
