/**
 * RuleForm — Full maintenance rule create/edit form
 *
 * Orchestrates all Phase 3 sub-components into a multi-step form:
 * 1. Scope & Target (ScopePicker)
 * 2. Severity (SeveritySelector)
 * 3. Message & Display (MessageEditor)
 * 4. Schedule (ScheduleEditor)
 * 5. Access Control & Priority
 * 6. Preview (RulePreview)
 *
 * Supports both create and edit modes.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Zap,
  Loader2,
  Check,
  Shield,
  Hash,
  Target,
  Palette,
  MessageSquare,
  Calendar,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import ScopePicker from './ScopePicker';
import SeveritySelector from './SeveritySelector';
import MessageEditor from './MessageEditor';
import ScheduleEditor, { type ScheduleData } from './ScheduleEditor';
import RulePreview from './RulePreview';
import type {
  MaintenanceRule,
  MaintenanceScope,
  MaintenanceSeverity,
  MaintenanceDisplayConfig,
  MaintenanceMetadata,
  CreateMaintenanceRuleInput,
  UpdateMaintenanceRuleInput,
} from '../../types/maintenance';

// =============================================================================
// Types
// =============================================================================

interface RuleFormProps {
  /** Existing rule when editing. Undefined for new rules. */
  initialRule?: MaintenanceRule;
  /** Called on save with the form data */
  onSubmit: (
    data: CreateMaintenanceRuleInput | (UpdateMaintenanceRuleInput & { id: string }),
    options: { activate: boolean; schedule: ScheduleData }
  ) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

// =============================================================================
// Steps
// =============================================================================

const STEPS = [
  { key: 'scope', label: 'Target', icon: Target, description: 'What to maintain' },
  { key: 'severity', label: 'Severity', icon: Palette, description: 'How to display' },
  { key: 'message', label: 'Message', icon: MessageSquare, description: 'Content & options' },
  { key: 'schedule', label: 'Schedule', icon: Calendar, description: 'When to activate' },
  { key: 'access', label: 'Access', icon: Shield, description: 'Priority & roles' },
  { key: 'preview', label: 'Preview', icon: Eye, description: 'Review & save' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

// =============================================================================
// Component
// =============================================================================

export default function RuleForm({
  initialRule,
  onSubmit,
  onCancel,
  isSubmitting,
}: RuleFormProps) {
  const isEditing = !!initialRule;

  // ── Form State ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<StepKey>('scope');
  const [scope, setScope] = useState<MaintenanceScope>(initialRule?.scope ?? 'page');
  const [targetKey, setTargetKey] = useState(initialRule?.target_key ?? '');
  const [severity, setSeverity] = useState<MaintenanceSeverity>(initialRule?.severity ?? 'notice');
  const [title, setTitle] = useState(initialRule?.title ?? '');
  const [message, setMessage] = useState(initialRule?.message ?? '');
  const [displayConfig, setDisplayConfig] = useState<MaintenanceDisplayConfig>(
    initialRule?.display_config ?? { theme: 'branded' }
  );
  const [metadata, setMetadata] = useState<MaintenanceMetadata>(initialRule?.metadata ?? {});
  const [priority, setPriority] = useState(initialRule?.priority ?? 50);
  const [allowedRoles, setAllowedRoles] = useState<string[]>(
    initialRule?.allowed_roles ?? ['super_admin', 'admin']
  );
  const [estimatedEnd, setEstimatedEnd] = useState(initialRule?.estimated_end ?? '');
  const [schedule, setSchedule] = useState<ScheduleData>({
    mode: 'immediate',
    startsAt: '',
    endsAt: '',
    timezone: 'Africa/Nairobi',
    recurrence: null,
  });

  // Initialize schedule from existing rule data
  useEffect(() => {
    if (initialRule?.schedules && initialRule.schedules.length > 0) {
      const s = initialRule.schedules[0];
      setSchedule({
        mode: 'scheduled',
        startsAt: s.starts_at ? new Date(s.starts_at).toISOString().slice(0, 16) : '',
        endsAt: s.ends_at ? new Date(s.ends_at).toISOString().slice(0, 16) : '',
        timezone: s.timezone ?? 'Africa/Nairobi',
        recurrence: s.recurrence ?? null,
      });
    }
  }, [initialRule]);

  // ── Step Navigation ───────────────────────────────────────────────────────
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex].key);
    }
  }, [currentStepIndex]);

  const goPrev = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex].key);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((s: StepKey) => {
    setStep(s);
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const stepValidation = useMemo(() => {
    return {
      scope: scope === 'global' ? true : targetKey.trim().length > 0,
      severity: true, // always valid
      message: title.trim().length > 0,
      schedule: true, // always valid (immediate is fine)
      access: true, // always valid
      preview: true,
    };
  }, [scope, targetKey, title]);

  const isFormValid = useMemo(
    () => Object.values(stepValidation).every(Boolean),
    [stepValidation]
  );

  const completedSteps = useMemo(() => {
    const completed = new Set<StepKey>();
    if (stepValidation.scope) completed.add('scope');
    if (stepValidation.severity) completed.add('severity');
    if (stepValidation.message) completed.add('message');
    if (stepValidation.schedule) completed.add('schedule');
    if (stepValidation.access) completed.add('access');
    if (isFormValid) completed.add('preview');
    return completed;
  }, [stepValidation, isFormValid]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (activate: boolean) => {
      const payload: CreateMaintenanceRuleInput = {
        scope,
        target_key: scope === 'global' ? 'global' : targetKey.trim(),
        severity,
        title: title.trim(),
        message: message.trim() || null,
        display_config: displayConfig,
        metadata,
        priority,
        allowed_roles: allowedRoles,
        is_active: activate && schedule.mode === 'immediate',
        estimated_end: estimatedEnd || null,
      };

      if (isEditing && initialRule) {
        onSubmit({ id: initialRule.id, ...payload }, { activate, schedule });
      } else {
        onSubmit(payload, { activate, schedule });
      }
    },
    [
      scope, targetKey, severity, title, message, displayConfig, metadata,
      priority, allowedRoles, estimatedEnd, schedule, isEditing, initialRule,
      onSubmit,
    ]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* ── Step Indicator ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <nav className="flex items-center justify-between">
          {/* Steps - horizontal on desktop, hide labels on mobile */}
          <ol className="flex items-center gap-1 sm:gap-2 flex-1">
            {STEPS.map((s, index) => {
              const isActive = step === s.key;
              const isCompleted = completedSteps.has(s.key) && !isActive;
              const isClickable = true; // Allow free navigation

              return (
                <li key={s.key} className="flex items-center gap-1 sm:gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => isClickable && goToStep(s.key)}
                    className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium
                                transition-all w-full justify-center sm:justify-start ${
                      isActive
                        ? 'bg-[#B01C2E] text-white shadow-sm'
                        : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <s.icon className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="hidden sm:inline truncate">{s.label}</span>
                  </button>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`hidden sm:block w-4 h-0.5 flex-shrink-0 ${
                        completedSteps.has(s.key) ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step description */}
        <p className="text-xs text-gray-500 mt-2 pl-1">
          Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex].description}
        </p>
      </div>

      {/* ── Step Content ───────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Left: Form */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'scope' && (
                <div className="space-y-6">
                  <StepHeader
                    title="Select Target"
                    description="Choose what you want to put under maintenance. Start by selecting the scope level, then pick the specific target."
                  />
                  <ScopePicker
                    scope={scope}
                    targetKey={targetKey}
                    onScopeChange={setScope}
                    onTargetKeyChange={setTargetKey}
                  />
                  {!stepValidation.scope && scope !== 'global' && (
                    <p className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Please select a target to continue
                    </p>
                  )}
                </div>
              )}

              {step === 'severity' && (
                <div className="space-y-6">
                  <StepHeader
                    title="Set Severity Level"
                    description="Choose how the maintenance state is displayed to visitors. This controls the visual impact on the public site."
                  />
                  <SeveritySelector value={severity} onChange={setSeverity} />
                </div>
              )}

              {step === 'message' && (
                <div className="space-y-6">
                  <StepHeader
                    title="Compose Message"
                    description="Set the title, message, and display options that visitors will see during maintenance."
                  />
                  <MessageEditor
                    title={title}
                    message={message}
                    displayConfig={displayConfig}
                    metadata={metadata}
                    onTitleChange={setTitle}
                    onMessageChange={setMessage}
                    onDisplayConfigChange={setDisplayConfig}
                    onMetadataChange={setMetadata}
                  />
                </div>
              )}

              {step === 'schedule' && (
                <div className="space-y-6">
                  <StepHeader
                    title="Schedule Maintenance"
                    description="Choose when the maintenance rule should be active. Schedule for the future or activate immediately."
                  />
                  <ScheduleEditor value={schedule} onChange={setSchedule} />

                  {/* Estimated End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Estimated End Time <span className="text-xs text-gray-400">(for countdown display)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={estimatedEnd}
                      onChange={(e) => setEstimatedEnd(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                 focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Used for the countdown timer if "Show Countdown" is enabled
                    </p>
                  </div>
                </div>
              )}

              {step === 'access' && (
                <div className="space-y-6">
                  <StepHeader
                    title="Access Control & Priority"
                    description="Set the priority level and choose which admin roles can bypass this maintenance rule."
                  />

                  {/* Priority */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Hash className="h-4 w-4 text-gray-400" />
                      Priority <span className="text-xs text-gray-400">(0–100)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value))}
                        className="flex-1 accent-[#B01C2E]"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={priority}
                        onChange={(e) => setPriority(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center
                                   focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      When multiple rules match the same target, the higher priority rule wins.
                    </p>
                  </div>

                  {/* Allowed Roles */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      Bypass Roles
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Users with these roles will see the real content instead of the maintenance placeholder.
                    </p>
                    <div className="space-y-2">
                      {AVAILABLE_ROLES.map((role) => (
                        <label
                          key={role.value}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={allowedRoles.includes(role.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAllowedRoles([...allowedRoles, role.value]);
                              } else {
                                setAllowedRoles(allowedRoles.filter((r) => r !== role.value));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-[#B01C2E] focus:ring-[#B01C2E]"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700">{role.label}</span>
                            <p className="text-[11px] text-gray-500">{role.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-6">
                  <StepHeader
                    title="Review & Save"
                    description="Preview how visitors will see the maintenance state and confirm your configuration."
                  />

                  {/* Config Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Configuration Summary</h4>
                    <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                      <SummaryItem label="Scope" value={scope} />
                      <SummaryItem label="Target" value={scope === 'global' ? 'Entire Site' : targetKey} />
                      <SummaryItem label="Severity" value={severity} />
                      <SummaryItem label="Priority" value={String(priority)} />
                      <SummaryItem label="Title" value={title || '(none)'} />
                      <SummaryItem label="Schedule" value={schedule.mode === 'immediate' ? 'Immediate' : 'Scheduled'} />
                      {displayConfig.show_countdown && <SummaryItem label="Countdown" value="Enabled" />}
                      {displayConfig.show_progress && <SummaryItem label="Progress Bar" value="Enabled" />}
                      {displayConfig.theme && <SummaryItem label="Theme" value={displayConfig.theme} />}
                      {metadata.reason && <SummaryItem label="Reason" value={metadata.reason} />}
                    </dl>
                  </div>

                  {/* Validation Warnings */}
                  {!isFormValid && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        Please fix the following issues:
                      </div>
                      <ul className="space-y-1 text-xs text-amber-700">
                        {!stepValidation.scope && (
                          <li>• Select a target for the maintenance rule</li>
                        )}
                        {!stepValidation.message && (
                          <li>• Add a title for the maintenance rule</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Live Preview (always visible on desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <RulePreview
              title={title}
              message={message}
              severity={severity}
              targetKey={targetKey}
              displayConfig={displayConfig}
              estimatedEnd={estimatedEnd}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile Preview Toggle ──────────────────────────────────────── */}
      {step === 'preview' && (
        <div className="lg:hidden mt-6">
          <RulePreview
            title={title}
            message={message}
            severity={severity}
            targetKey={targetKey}
            displayConfig={displayConfig}
            estimatedEnd={estimatedEnd}
          />
        </div>
      )}

      {/* ── Navigation Footer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700
                         bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700
                         bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {step === 'preview' || (step !== 'preview' && currentStepIndex === STEPS.length - 1) ? (
            <>
              {/* Save as Draft */}
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={!isFormValid || isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700
                           bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Draft
              </button>

              {/* Save & Activate */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit(true)}
                disabled={!isFormValid || isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                           text-white text-sm font-medium rounded-lg shadow-sm transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isEditing ? 'Save & Activate' : 'Create & Activate'}
              </motion.button>
            </>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                         text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="text-xs font-medium text-gray-500 min-w-[80px]">{label}:</dt>
      <dd className="text-xs text-gray-900 break-all">{value}</dd>
    </div>
  );
}

// =============================================================================
// Constants
// =============================================================================

const AVAILABLE_ROLES = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full system access with all privileges',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full content management access',
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Organization owner with management rights',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can edit content but limited admin access',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to admin panel',
  },
];
