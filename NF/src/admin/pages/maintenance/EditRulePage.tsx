/**
 * EditRulePage — Edit an existing maintenance rule
 *
 * Full-page form using the RuleForm component with step-by-step wizard.
 * Pre-populated with the existing rule data.
 * Phase 5: Includes StatusUpdateForm and StatusTimeline panels.
 * Accessible at /admin/maintenance/:id/edit
 */

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil, Loader2, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { RuleForm, StatusUpdateForm, StatusTimeline } from '../../components/maintenance';
import { useBreadcrumbEntity } from '../../components/layout/BreadcrumbContext';
import {
  useMaintenanceRule,
  useUpdateMaintenanceRule,
  useReplaceMaintenanceSchedule,
} from '../../hooks/useMaintenanceRules';
import type { ScheduleData } from '../../components/maintenance/ScheduleEditor';

/** Convert a datetime-local string to a UTC ISO string (consistent with read-back). */
function toUtcIso(datetimeLocal: string): string {
  return new Date(datetimeLocal + ':00Z').toISOString();
}
import type {
  CreateMaintenanceRuleInput,
  UpdateMaintenanceRuleInput,
} from '../../types/maintenance';

// =============================================================================
// Component
// =============================================================================

function EditRulePageContent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: rule, isLoading, error } = useMaintenanceRule(id);
  const updateMutation = useUpdateMaintenanceRule();
  const scheduleMutation = useReplaceMaintenanceSchedule();
  const [showStatusPanel, setShowStatusPanel] = useState(true);

  // Inject rule title into breadcrumb trail (Phase 3 — BUG-08)
  useBreadcrumbEntity(rule?.title);

  const handleSubmit = useCallback(
    (
      data: CreateMaintenanceRuleInput | (UpdateMaintenanceRuleInput & { id: string }),
      options: { activate: boolean; schedule: ScheduleData }
    ) => {
      if (!('id' in data)) return;

      // is_active is already correctly set by RuleForm — do NOT override here.
      const input = data as UpdateMaintenanceRuleInput & { id: string };

      updateMutation.mutate(input, {
        onSuccess: () => {
          const { schedule } = options;
          // Replace existing schedules: pass null to clear (immediate mode),
          // or pass the new schedule (scheduled mode).
          scheduleMutation.mutate(
            {
              rule_id: input.id,
              schedule:
                schedule.mode === 'scheduled' && schedule.startsAt
                  ? {
                      starts_at: toUtcIso(schedule.startsAt),
                      ends_at: schedule.endsAt ? toUtcIso(schedule.endsAt) : null,
                      timezone: schedule.timezone,
                      recurrence: schedule.recurrence,
                    }
                  : null,
            },
            { onSettled: () => navigate('/admin/maintenance') },
          );
        },
      });
    },
    [updateMutation, scheduleMutation, navigate],
  );

  const handleCancel = useCallback(() => {
    navigate('/admin/maintenance');
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B01C2E] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading rule…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !rule) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Rule not found</h2>
          <p className="text-sm text-gray-500 mb-4">
            {error
              ? `Error: ${(error as Error).message}`
              : 'The maintenance rule you\'re looking for doesn\'t exist or was deleted.'}
          </p>
          <button
            onClick={() => navigate('/admin/maintenance')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                       text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            <Pencil className="h-5 w-5 text-[#B01C2E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Maintenance Rule</h1>
            <p className="text-sm text-gray-500">
              Editing: <strong>{rule.title}</strong>
              <span className="text-gray-400 ml-2">({rule.target_key})</span>
            </p>
          </div>
        </div>

        {/* Active status badge */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowStatusPanel(!showStatusPanel)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showStatusPanel
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Status Updates</span>
          </button>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              rule.is_active
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                rule.is_active ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            {rule.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 ${
            showStatusPanel ? 'lg:col-span-2' : 'lg:col-span-3'
          }`}
        >
          <RuleForm
            initialRule={rule}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
          />
        </motion.div>

        {/* Phase 5: Status Updates Panel */}
        <AnimatePresence>
          {showStatusPanel && id && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Post New Update */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Send className="h-4 w-4 text-[#B01C2E]" />
                  <h3 className="text-sm font-semibold text-gray-900">Post Status Update</h3>
                </div>
                <StatusUpdateForm
                  ruleId={id}
                  currentProgress={
                    rule?.status_updates?.[0]?.progress_pct ?? 0
                  }
                  compact
                />
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <StatusTimeline
                  updates={rule?.status_updates ?? []}
                  isLoading={isLoading}
                  initialLimit={5}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EditRulePage() {
  return (
    <ProtectedRoute requiredPermission="manage_site_maintenance">
      <EditRulePageContent />
    </ProtectedRoute>
  );
}
