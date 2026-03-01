/**
 * check-maintenance-schedule — Supabase Edge Function
 * Neema Foundation Kilifi — Phase 4: Scheduling & Automation
 *
 * Triggered every minute via pg_cron (or manual invoke).
 * Responsibilities:
 *   1. Scan `maintenance_schedules` for windows that should be active NOW
 *   2. Auto-activate matching `maintenance_rules` (set is_active = true)
 *   3. Auto-deactivate rules whose schedule window has ended
 *   4. Handle recurring schedules by computing next occurrence
 *   5. Send pre-maintenance email notifications (30 min before start)
 *
 * Required Supabase Secrets:
 *   SUPABASE_URL              — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   RESEND_API_KEY            — for email notifications (optional)
 *   NOTIFICATION_TO_EMAIL     — admin email for notifications (optional)
 *
 * Deploy:
 *   npx supabase functions deploy check-maintenance-schedule
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface MaintenanceSchedule {
  id: string;
  rule_id: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  recurrence: RecurrenceConfig | null;
  is_active: boolean;
}

interface RecurrenceConfig {
  type: 'daily' | 'weekly' | 'monthly';
  day?: string;
  day_of_month?: number;
  start_time: string;      // HH:MM
  duration_hours: number;
}

interface MaintenanceRule {
  id: string;
  title: string;
  target_key: string;
  scope: string;
  severity: string;
  is_active: boolean;
}

interface ScheduleAction {
  schedule_id: string;
  rule_id: string;
  rule_title: string;
  action: 'activate' | 'deactivate';
  reason: string;
}

interface NotificationTarget {
  rule_id: string;
  rule_title: string;
  target_key: string;
  starts_at: string;
  minutes_until: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Get current time in a specific timezone */
function nowInTimezone(timezone: string): Date {
  const now = new Date();
  // Convert to target timezone by using Intl formatting then parsing back
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  // We use the raw UTC now for comparison — schedules store in TIMESTAMPTZ
  return now;
}

/** Check if a recurring schedule is currently within its active window */
function isRecurrenceActive(
  recurrence: RecurrenceConfig,
  timezone: string,
  now: Date = new Date()
): { isActive: boolean; windowStart: Date | null; windowEnd: Date | null } {
  // Get current time parts in the target timezone
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    day: '2-digit',
  }).formatToParts(now);

  const weekday = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() ?? '';
  const hourStr = parts.find(p => p.type === 'hour')?.value ?? '00';
  const minuteStr = parts.find(p => p.type === 'minute')?.value ?? '00';
  const dayOfMonth = parseInt(parts.find(p => p.type === 'day')?.value ?? '1', 10);

  const currentHour = parseInt(hourStr, 10);
  const currentMinute = parseInt(minuteStr, 10);
  const currentMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = (recurrence.start_time || '02:00').split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = startMinutes + (recurrence.duration_hours * 60);

  let shouldBeActive = false;

  switch (recurrence.type) {
    case 'daily':
      shouldBeActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
      break;

    case 'weekly': {
      const targetDay = (recurrence.day || 'sunday').toLowerCase();
      if (weekday === targetDay) {
        shouldBeActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
      // Handle windows that span midnight
      if (endMinutes > 24 * 60) {
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetIdx = daysOfWeek.indexOf(targetDay);
        const nextDayIdx = (targetIdx + 1) % 7;
        const nextDay = daysOfWeek[nextDayIdx];
        if (weekday === nextDay) {
          const overflowEnd = endMinutes - 24 * 60;
          shouldBeActive = currentMinutes < overflowEnd;
        }
      }
      break;
    }

    case 'monthly': {
      const targetDay = recurrence.day_of_month ?? 1;
      if (dayOfMonth === targetDay) {
        shouldBeActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
      // Handle midnight overflow
      if (endMinutes > 24 * 60 && dayOfMonth === targetDay + 1) {
        const overflowEnd = endMinutes - 24 * 60;
        shouldBeActive = currentMinutes < overflowEnd;
      }
      break;
    }
  }

  return { isActive: shouldBeActive, windowStart: null, windowEnd: null };
}

/** Compute the next recurrence occurrence for notification purposes */
function getNextRecurrenceStart(
  recurrence: RecurrenceConfig,
  timezone: string,
  now: Date = new Date()
): Date | null {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() ?? '';
  const [startHour, startMinute] = (recurrence.start_time || '02:00').split(':').map(Number);

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  if (recurrence.type === 'weekly') {
    const targetDay = (recurrence.day || 'sunday').toLowerCase();
    const currentIdx = daysOfWeek.indexOf(weekday);
    const targetIdx = daysOfWeek.indexOf(targetDay);
    let daysUntil = targetIdx - currentIdx;
    if (daysUntil <= 0) daysUntil += 7;

    const next = new Date(now);
    next.setDate(next.getDate() + daysUntil);
    next.setHours(startHour, startMinute, 0, 0);
    return next;
  }

  return null;
}

/** Send email notification via Resend */
async function sendNotificationEmail(
  targets: NotificationTarget[]
): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const toEmail = Deno.env.get('NOTIFICATION_TO_EMAIL');

  if (!apiKey || !toEmail) {
    console.log('[check-maintenance-schedule] Email notifications skipped — missing RESEND_API_KEY or NOTIFICATION_TO_EMAIL');
    return;
  }

  const from = Deno.env.get('EMAIL_FROM') ?? 'Neema Foundation <onboarding@resend.dev>';

  for (const target of targets) {
    const startTime = new Date(target.starts_at).toLocaleString('en-GB', {
      timeZone: 'Africa/Nairobi',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #B01C2E, #8A1624); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">⏰ Scheduled Maintenance Alert</h1>
        </div>
        <div style="background: #FFFFFF; padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: 600; color: #92400E;">
              🔔 Maintenance starting in ${target.minutes_until} minutes
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 120px;">Rule:</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${target.rule_title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Target:</td>
              <td style="padding: 8px 0; font-size: 14px;"><code style="background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">${target.target_key}</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Starts at:</td>
              <td style="padding: 8px 0; font-size: 14px;">${startTime} (EAT)</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
              This is an automated notification from the Neema Foundation maintenance system.
              To manage maintenance schedules, visit the admin panel.
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [toEmail],
          subject: `⏰ Maintenance Alert: "${target.rule_title}" starts in ${target.minutes_until} min`,
          html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[check-maintenance-schedule] Failed to send notification email: ${res.status} ${body}`);
      } else {
        console.log(`[check-maintenance-schedule] Notification email sent for rule "${target.rule_title}"`);
      }
    } catch (err) {
      console.error('[check-maintenance-schedule] Email send error:', err);
    }
  }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  const actions: ScheduleAction[] = [];
  const notifications: NotificationTarget[] = [];
  const errors: string[] = [];

  try {
    // Create service-role client (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const now = new Date();

    // ── 1. Fetch all active schedules with their rules ─────────────────────

    const { data: schedules, error: fetchError } = await supabase
      .from('maintenance_schedules')
      .select(`
        id,
        rule_id,
        starts_at,
        ends_at,
        timezone,
        recurrence,
        is_active,
        maintenance_rules!inner (
          id,
          title,
          target_key,
          scope,
          severity,
          is_active
        )
      `)
      .eq('is_active', true);

    if (fetchError) {
      console.error('[check-maintenance-schedule] Failed to fetch schedules:', fetchError);
      return json({ error: 'Failed to fetch schedules', details: fetchError.message }, 500);
    }

    if (!schedules || schedules.length === 0) {
      return json({
        message: 'No active schedules found',
        actions: [],
        duration_ms: Date.now() - startTime,
      });
    }

    console.log(`[check-maintenance-schedule] Processing ${schedules.length} active schedule(s)`);

    // ── 2. Process each schedule ───────────────────────────────────────────

    for (const schedule of schedules) {
      const rule = (schedule as any).maintenance_rules as MaintenanceRule;
      if (!rule) continue;

      const startsAt = new Date(schedule.starts_at);
      const endsAt = schedule.ends_at ? new Date(schedule.ends_at) : null;
      const timezone = schedule.timezone || 'Africa/Nairobi';

      // ── 2a. Check fixed-window schedules (non-recurring) ─────────────────

      if (!schedule.recurrence) {
        const isWithinWindow = now >= startsAt && (!endsAt || now < endsAt);
        const isPastWindow = endsAt && now >= endsAt;

        if (isWithinWindow && !rule.is_active) {
          // Auto-ACTIVATE: we're inside the window but rule is off
          const { error: updateErr } = await supabase
            .from('maintenance_rules')
            .update({ is_active: true, updated_by: null })
            .eq('id', rule.id);

          if (updateErr) {
            errors.push(`Failed to activate rule "${rule.title}": ${updateErr.message}`);
          } else {
            actions.push({
              schedule_id: schedule.id,
              rule_id: rule.id,
              rule_title: rule.title,
              action: 'activate',
              reason: `Fixed window started at ${startsAt.toISOString()}`,
            });

            // Log audit entry
            await supabase.from('maintenance_audit_log').insert({
              rule_id: rule.id,
              action: 'activated',
              actor_id: null,
              changes: {
                trigger: 'scheduled_auto_activation',
                schedule_id: schedule.id,
                starts_at: schedule.starts_at,
                ends_at: schedule.ends_at,
              },
            });
          }
        } else if (isPastWindow && rule.is_active) {
          // Auto-DEACTIVATE: window has ended but rule is still on
          const { error: updateErr } = await supabase
            .from('maintenance_rules')
            .update({ is_active: false, updated_by: null })
            .eq('id', rule.id);

          if (updateErr) {
            errors.push(`Failed to deactivate rule "${rule.title}": ${updateErr.message}`);
          } else {
            actions.push({
              schedule_id: schedule.id,
              rule_id: rule.id,
              rule_title: rule.title,
              action: 'deactivate',
              reason: `Fixed window ended at ${endsAt!.toISOString()}`,
            });

            // Mark schedule as done (non-recurring)
            await supabase
              .from('maintenance_schedules')
              .update({ is_active: false })
              .eq('id', schedule.id);

            // Log audit entry
            await supabase.from('maintenance_audit_log').insert({
              rule_id: rule.id,
              action: 'deactivated',
              actor_id: null,
              changes: {
                trigger: 'scheduled_auto_deactivation',
                schedule_id: schedule.id,
                ends_at: schedule.ends_at,
              },
            });
          }
        }

        // ── Pre-maintenance notification (30 min before start) ────────────
        if (!rule.is_active && !isPastWindow) {
          const msUntilStart = startsAt.getTime() - now.getTime();
          const minutesUntil = Math.floor(msUntilStart / 60000);

          // Notify at ~30 minutes and ~5 minutes before
          if ((minutesUntil >= 28 && minutesUntil <= 32) || (minutesUntil >= 3 && minutesUntil <= 7)) {
            notifications.push({
              rule_id: rule.id,
              rule_title: rule.title,
              target_key: rule.target_key,
              starts_at: schedule.starts_at,
              minutes_until: minutesUntil,
            });
          }
        }

      } else {
        // ── 2b. Check recurring schedules ──────────────────────────────────

        const recurrence = schedule.recurrence as RecurrenceConfig;
        const { isActive: shouldBeActive } = isRecurrenceActive(recurrence, timezone, now);

        if (shouldBeActive && !rule.is_active) {
          // Auto-ACTIVATE recurring window
          const { error: updateErr } = await supabase
            .from('maintenance_rules')
            .update({ is_active: true, updated_by: null })
            .eq('id', rule.id);

          if (updateErr) {
            errors.push(`Failed to activate recurring rule "${rule.title}": ${updateErr.message}`);
          } else {
            actions.push({
              schedule_id: schedule.id,
              rule_id: rule.id,
              rule_title: rule.title,
              action: 'activate',
              reason: `Recurring ${recurrence.type} window active (${recurrence.start_time} for ${recurrence.duration_hours}h)`,
            });

            await supabase.from('maintenance_audit_log').insert({
              rule_id: rule.id,
              action: 'activated',
              actor_id: null,
              changes: {
                trigger: 'recurring_auto_activation',
                schedule_id: schedule.id,
                recurrence,
              },
            });
          }
        } else if (!shouldBeActive && rule.is_active) {
          // Check if this rule was auto-activated by a schedule
          // (Don't deactivate manually-activated rules)
          const { data: lastAudit } = await supabase
            .from('maintenance_audit_log')
            .select('changes')
            .eq('rule_id', rule.id)
            .eq('action', 'activated')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const wasAutoActivated = lastAudit?.changes &&
            typeof lastAudit.changes === 'object' &&
            ('trigger' in (lastAudit.changes as Record<string, unknown>)) &&
            ((lastAudit.changes as Record<string, unknown>).trigger as string)?.includes('auto_activation');

          if (wasAutoActivated) {
            // Auto-DEACTIVATE recurring window
            const { error: updateErr } = await supabase
              .from('maintenance_rules')
              .update({ is_active: false, updated_by: null })
              .eq('id', rule.id);

            if (updateErr) {
              errors.push(`Failed to deactivate recurring rule "${rule.title}": ${updateErr.message}`);
            } else {
              actions.push({
                schedule_id: schedule.id,
                rule_id: rule.id,
                rule_title: rule.title,
                action: 'deactivate',
                reason: `Recurring ${recurrence.type} window ended`,
              });

              await supabase.from('maintenance_audit_log').insert({
                rule_id: rule.id,
                action: 'deactivated',
                actor_id: null,
                changes: {
                  trigger: 'recurring_auto_deactivation',
                  schedule_id: schedule.id,
                  recurrence,
                },
              });
            }
          }
        }
      }
    }

    // ── 3. Send notification emails ────────────────────────────────────────

    if (notifications.length > 0) {
      await sendNotificationEmail(notifications);
    }

    // ── 4. Return summary ──────────────────────────────────────────────────

    const result = {
      processed: schedules.length,
      actions,
      notifications_sent: notifications.length,
      errors,
      duration_ms: Date.now() - startTime,
      timestamp: now.toISOString(),
    };

    console.log('[check-maintenance-schedule] Complete:', JSON.stringify(result));
    return json(result);

  } catch (err) {
    console.error('[check-maintenance-schedule] Unexpected error:', err);
    return json({
      error: 'Internal error',
      message: (err as Error).message,
      duration_ms: Date.now() - startTime,
    }, 500);
  }
});
