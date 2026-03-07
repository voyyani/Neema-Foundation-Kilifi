/**
 * NewRulePage — Create a new maintenance rule
 *
 * Full-page form using the RuleForm component with step-by-step wizard.
 * Accessible at /admin/maintenance/new
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { RuleForm } from '../../components/maintenance';
import {
  useCreateMaintenanceRule,
  useCreateMaintenanceSchedule,
} from '../../hooks/useMaintenanceRules';
import type {
  CreateMaintenanceRuleInput,
  UpdateMaintenanceRuleInput,
} from '../../types/maintenance';
import type { ScheduleData } from '../../components/maintenance/ScheduleEditor';

/** Convert a datetime-local string to a UTC ISO string.
 *  datetime-local values are stored/displayed as UTC (consistent with how
 *  they are read back: new Date(s.starts_at).toISOString().slice(0,16)). */
function toUtcIso(datetimeLocal: string): string {
  return new Date(datetimeLocal + ':00Z').toISOString();
}

// =============================================================================
// Component
// =============================================================================

function NewRulePageContent() {
  const navigate = useNavigate();
  const { track } = useOnboardingTracker();
  const createMutation = useCreateMaintenanceRule();
  const scheduleMutation = useCreateMaintenanceSchedule();

  const handleSubmit = useCallback(
    (
      data: CreateMaintenanceRuleInput | (UpdateMaintenanceRuleInput & { id: string }),
      options: { activate: boolean; schedule: ScheduleData }
    ) => {
      // is_active is already correctly computed by RuleForm:
      //   true  → activate=true AND mode='immediate' (manual toggle ON)
      //   false → mode='scheduled'  (cron/Edge Function handles activation)
      // Do NOT override is_active here.
      const input = data as CreateMaintenanceRuleInput;

      createMutation.mutate(input, {
        onSuccess: (rule) => {
          track('maintenance.rule_created');

          const { schedule } = options;
          if (schedule.mode === 'scheduled' && schedule.startsAt) {
            // Save the schedule row so the cron job can auto-activate the rule
            scheduleMutation.mutate(
              {
                rule_id: rule.id,
                starts_at: toUtcIso(schedule.startsAt),
                ends_at: schedule.endsAt ? toUtcIso(schedule.endsAt) : null,
                timezone: schedule.timezone,
                recurrence: schedule.recurrence,
              },
              { onSettled: () => navigate('/admin/maintenance') },
            );
          } else {
            navigate('/admin/maintenance');
          }
        },
      });
    },
    [createMutation, scheduleMutation, navigate, track],
  );

  const handleCancel = useCallback(() => {
    navigate('/admin/maintenance');
  }, [navigate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/maintenance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B01C2E]/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-[#B01C2E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Maintenance Rule</h1>
            <p className="text-sm text-gray-500">
              Define a new maintenance rule with scope, severity, and scheduling
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
      >
        <RuleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending}
        />
      </motion.div>
    </div>
  );
}

export default function NewRulePage() {
  return (
    <ProtectedRoute requiredPermission="manage_site_maintenance">
      <NewRulePageContent />
    </ProtectedRoute>
  );
}
