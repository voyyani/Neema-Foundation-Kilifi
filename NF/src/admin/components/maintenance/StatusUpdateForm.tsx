/**
 * StatusUpdateForm — Admin component for posting maintenance status updates
 *
 * Features:
 *  - Rich form with title, body, progress percentage, and status type
 *  - Live progress slider with visual feedback
 *  - Quick-action presets for common updates (Started, In Progress, Almost Done, Complete)
 *  - Inline character counters
 *  - Confirmation animation on successful post
 *  - Auto-updates rule progress via the same mutation
 *
 * Used on the rule detail / edit pages and embedded in the dashboard.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Loader2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCreateStatusUpdate } from '../../hooks/useMaintenanceRules';
import type { StatusType, CreateStatusUpdateInput } from '../../types/maintenance';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TYPE_CONFIG: Record<
  StatusType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }
> = {
  info: {
    label: 'Info',
    icon: <Info className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  success: {
    label: 'Success',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  warning: {
    label: 'Warning',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  error: {
    label: 'Error',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

interface QuickPreset {
  label: string;
  title: string;
  body: string;
  progress_pct: number;
  status_type: StatusType;
  icon: React.ReactNode;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    label: 'Started',
    title: 'Maintenance has begun',
    body: 'Our team has started working on the scheduled maintenance. We appreciate your patience.',
    progress_pct: 10,
    status_type: 'info',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  {
    label: 'In Progress',
    title: 'Work in progress',
    body: 'Maintenance is progressing as planned. We expect to be back on schedule.',
    progress_pct: 50,
    status_type: 'info',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  {
    label: 'Almost Done',
    title: 'Nearly complete',
    body: 'We are in the final stages of maintenance. The system will be available shortly.',
    progress_pct: 90,
    status_type: 'success',
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    label: 'Completed',
    title: 'Maintenance complete',
    body: 'All scheduled maintenance has been completed successfully. Everything is back online.',
    progress_pct: 100,
    status_type: 'success',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    label: 'Delay',
    title: 'Maintenance delayed',
    body: 'We have encountered an unexpected issue. Maintenance will take longer than expected.',
    progress_pct: 0,
    status_type: 'warning',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  {
    label: 'Issue',
    title: 'Issue detected',
    body: 'An issue has been identified during maintenance. Our team is working to resolve it.',
    progress_pct: 0,
    status_type: 'error',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
];

const TITLE_MAX = 120;
const BODY_MAX = 500;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StatusUpdateFormProps {
  /** The rule ID this update belongs to */
  ruleId: string;
  /** Current progress (used as initial slider value) */
  currentProgress?: number;
  /** Callback after successful post */
  onSuccess?: () => void;
  /** Compact mode for inline/card usage */
  compact?: boolean;
  /** Extra CSS classes */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({
  ruleId,
  currentProgress = 0,
  onSuccess,
  compact = false,
  className = '',
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [progressPct, setProgressPct] = useState(currentProgress);
  const [statusType, setStatusType] = useState<StatusType>('info');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const createUpdate = useCreateStatusUpdate();

  // Focus title on mount
  useEffect(() => {
    if (!compact) titleRef.current?.focus();
  }, [compact]);

  // Reset form
  const resetForm = useCallback(() => {
    setTitle('');
    setBody('');
    setProgressPct(currentProgress);
    setStatusType('info');
    setShowAdvanced(false);
  }, [currentProgress]);

  // Apply a quick preset
  const applyPreset = useCallback((preset: QuickPreset) => {
    setTitle(preset.title);
    setBody(preset.body);
    setProgressPct(preset.progress_pct);
    setStatusType(preset.status_type);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) return;

      const input: CreateStatusUpdateInput = {
        rule_id: ruleId,
        title: title.trim(),
        body: body.trim() || undefined,
        progress_pct: progressPct,
        status_type: statusType,
      };

      createUpdate.mutate(input, {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            resetForm();
            onSuccess?.();
          }, 1500);
        },
      });
    },
    [ruleId, title, body, progressPct, statusType, createUpdate, resetForm, onSuccess],
  );

  // Progress color based on percentage
  const progressColor =
    progressPct >= 90
      ? 'from-emerald-500 to-emerald-400'
      : progressPct >= 50
        ? 'from-blue-500 to-blue-400'
        : progressPct >= 25
          ? 'from-amber-500 to-amber-400'
          : 'from-red-500 to-red-400';

  const isValid = title.trim().length > 0 && title.length <= TITLE_MAX;

  // ── Success overlay ─────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex flex-col items-center justify-center py-8 ${className}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
        </motion.div>
        <p className="text-sm font-semibold text-gray-900">Status update posted!</p>
        <p className="text-xs text-gray-500 mt-1">Visitors will see this update immediately.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* ── Quick Presets ──────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                border transition-all duration-150 hover:shadow-sm
                ${
                  title === preset.title
                    ? 'bg-[#B01C2E] text-white border-[#B01C2E] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {preset.icon}
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="status-title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-xs tabular-nums ${
              title.length > TITLE_MAX ? 'text-red-500 font-medium' : 'text-gray-400'
            }`}
          >
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <input
          ref={titleRef}
          id="status-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Database migration in progress…"
          maxLength={TITLE_MAX + 10}
          className={`
            w-full px-3 py-2.5 text-sm border rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]
            placeholder:text-gray-400 transition-colors
            ${title.length > TITLE_MAX ? 'border-red-300' : 'border-gray-200'}
          `}
        />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="status-body" className="block text-sm font-medium text-gray-700">
            Details <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <span
            className={`text-xs tabular-nums ${
              body.length > BODY_MAX ? 'text-red-500 font-medium' : 'text-gray-400'
            }`}
          >
            {body.length}/{BODY_MAX}
          </span>
        </div>
        <textarea
          id="status-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Provide additional context for visitors…"
          rows={compact ? 2 : 3}
          maxLength={BODY_MAX + 10}
          className={`
            w-full px-3 py-2.5 text-sm border rounded-lg bg-white resize-none
            focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]
            placeholder:text-gray-400 transition-colors
            ${body.length > BODY_MAX ? 'border-red-300' : 'border-gray-200'}
          `}
        />
      </div>

      {/* ── Progress Slider ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="status-progress" className="block text-sm font-medium text-gray-700">
            Progress
          </label>
          <span className="text-sm font-bold text-gray-900 tabular-nums">
            {progressPct}%
          </span>
        </div>
        <div className="relative">
          <input
            id="status-progress"
            type="range"
            min={0}
            max={100}
            step={5}
            value={progressPct}
            onChange={(e) => setProgressPct(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer
                       bg-gray-200 accent-[#B01C2E]
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-[#B01C2E]
                       [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                       [&::-webkit-slider-thumb]:shadow-md
                       [&::-webkit-slider-thumb]:transition-transform
                       [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-[#B01C2E]
                       [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                       [&::-moz-range-thumb]:shadow-md"
          />
          {/* Visual fill behind slider */}
          <div
            className="absolute top-0 left-0 h-2 rounded-full pointer-events-none"
            style={{ width: `${progressPct}%` }}
          >
            <div className={`h-full rounded-full bg-gradient-to-r ${progressColor}`} />
          </div>
        </div>
        {/* Progress milestones */}
        <div className="flex justify-between mt-1 px-0.5">
          {[0, 25, 50, 75, 100].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setProgressPct(v)}
              className={`text-[10px] font-medium tabular-nums transition-colors ${
                progressPct === v ? 'text-[#B01C2E] font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {v}%
            </button>
          ))}
        </div>
      </div>

      {/* ── Status Type Selector ───────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status Type</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.entries(STATUS_TYPE_CONFIG) as [StatusType, typeof STATUS_TYPE_CONFIG[StatusType]][]).map(
            ([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => setStatusType(type)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-medium
                  transition-all duration-150
                  ${
                    statusType === type
                      ? `${config.bgColor} ${config.color} ${config.borderColor} ring-2 ring-offset-1 ring-${type === 'info' ? 'blue' : type === 'success' ? 'emerald' : type === 'warning' ? 'amber' : 'red'}-200`
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                {config.icon}
                {config.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* ── Advanced toggle ────────────────────────────────────────────────── */}
      {!compact && (
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAdvanced ? 'Hide' : 'Show'} preview
        </button>
      )}

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-xl border p-4 ${STATUS_TYPE_CONFIG[statusType].bgColor} ${STATUS_TYPE_CONFIG[statusType].borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div className={STATUS_TYPE_CONFIG[statusType].color}>
                  {STATUS_TYPE_CONFIG[statusType].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${STATUS_TYPE_CONFIG[statusType].color}`}>
                    {title || 'Status update title…'}
                  </p>
                  {body && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {body}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 bg-white/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-300`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-gray-700">
                      {progressPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {(title || body) && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || createUpdate.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                     text-white text-sm font-semibold rounded-lg shadow-sm transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#B01C2E]"
        >
          {createUpdate.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post Update
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StatusUpdateForm;
