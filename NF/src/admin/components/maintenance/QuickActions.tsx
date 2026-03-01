/**
 * QuickActions — One-Click Maintenance Presets (Phase 6)
 *
 * Dashboard widget providing pre-configured one-click buttons for common
 * maintenance scenarios. Supports:
 * - Quick preset activation with confirmation
 * - Template-based rule creation
 * - Affected users preview before activation
 * - Smart duplicate detection (won't create if matching rule exists)
 */

import { useState, useCallback } from 'react';
import {
  Zap,
  Globe,
  Heart,
  Camera,
  Users,
  Image,
  BookOpen,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QUICK_PRESETS,
  estimateAffectedUsers,
  type QuickPreset,
} from '../../config/maintenanceRegistry';
import {
  useCreateMaintenanceRule,
  useMaintenanceTemplates,
  useApplyTemplate,
} from '../../hooks/useMaintenanceRules';
import type { MaintenanceRule, MaintenanceTemplate } from '../../types/maintenance';

// =============================================================================
// Icon mapping
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Heart,
  Camera,
  Users,
  Image,
  BookOpen,
  FileText,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Zap;
}

// =============================================================================
// Types
// =============================================================================

export interface QuickActionsProps {
  rules: MaintenanceRule[];
  onRuleCreated?: () => void;
  className?: string;
}

// =============================================================================
// Confirm Dialog
// =============================================================================

function ConfirmDialog({
  preset,
  rules,
  onConfirm,
  onCancel,
  isCreating,
}: {
  preset: QuickPreset | null;
  rules: MaintenanceRule[];
  onConfirm: () => void;
  onCancel: () => void;
  isCreating: boolean;
}) {
  if (!preset) return null;

  const impact = estimateAffectedUsers(
    [
      ...rules,
      {
        id: 'preview',
        scope: preset.rule.scope,
        target_key: preset.rule.target_key,
        severity: preset.rule.severity,
        is_active: true,
        title: preset.rule.title,
        message: preset.rule.message,
        priority: preset.rule.priority,
        display_config: {},
        metadata: preset.rule.metadata as any,
        allowed_roles: ['super_admin', 'admin'],
        estimated_end: null,
        created_by: null,
        updated_by: null,
        created_at: '',
        updated_at: '',
      },
    ]
  );

  const existingRule = rules.find(
    (r) => r.target_key === preset.rule.target_key && r.scope === preset.rule.scope
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${preset.color} flex items-center justify-center`}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{preset.label}</h3>
            <p className="text-xs text-gray-500">{preset.description}</p>
          </div>
        </div>

        {existingRule && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800">Existing rule detected</p>
              <p className="text-xs text-amber-600 mt-0.5">
                A rule for <strong>{preset.rule.target_key}</strong> already exists
                {existingRule.is_active ? ' and is active' : ' (inactive)'}.
                This action will create a duplicate.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Scope</span>
            <span className="font-medium text-gray-900 capitalize">{preset.rule.scope.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Target</span>
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{preset.rule.target_key}</code>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Severity</span>
            <span className={`font-medium capitalize ${
              preset.rule.severity === 'full_block'
                ? 'text-red-600'
                : preset.rule.severity === 'degraded'
                  ? 'text-amber-600'
                  : 'text-blue-600'
            }`}>
              {preset.rule.severity.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Affected visitors</span>
            <span className="font-medium text-gray-900">~{impact.percentage}% of traffic</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isCreating}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       ${preset.color} hover:opacity-90`}
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            Activate Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// Template Selector
// =============================================================================

function TemplateList({
  templates,
  onApply,
  onDelete,
  isApplying,
}: {
  templates: MaintenanceTemplate[];
  onApply: (template: MaintenanceTemplate) => void;
  onDelete: (id: string) => void;
  isApplying: boolean;
}) {
  if (templates.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        No saved templates. Save a rule as a template from the edit page.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {templates.map((template) => (
        <div
          key={template.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
        >
          <Copy className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{template.name}</p>
            <p className="text-[10px] text-gray-400 truncate">
              {template.scope} · {template.target_key} · Used {template.usage_count}x
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onApply(template)}
              disabled={isApplying}
              className="px-2 py-1 text-[10px] font-medium text-white bg-[#B01C2E] rounded
                         hover:bg-[#8A1624] transition-colors disabled:opacity-50"
            >
              Use
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="p-1 hover:bg-red-50 rounded transition-colors"
              title="Delete template"
            >
              <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main QuickActions Component
// =============================================================================

export default function QuickActions({
  rules,
  onRuleCreated,
  className = '',
}: QuickActionsProps) {
  const [confirmPreset, setConfirmPreset] = useState<QuickPreset | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [recentSuccess, setRecentSuccess] = useState<string | null>(null);

  const createMutation = useCreateMaintenanceRule();
  const { data: templates = [] } = useMaintenanceTemplates();
  const applyTemplateMutation = useApplyTemplate();
  const createFromTemplate = useCreateMaintenanceRule();

  const handlePresetConfirm = useCallback(() => {
    if (!confirmPreset) return;

    createMutation.mutate(
      {
        scope: confirmPreset.rule.scope,
        target_key: confirmPreset.rule.target_key,
        severity: confirmPreset.rule.severity,
        title: confirmPreset.rule.title,
        message: confirmPreset.rule.message,
        priority: confirmPreset.rule.priority,
        metadata: confirmPreset.rule.metadata as any,
        is_active: true,
      },
      {
        onSuccess: () => {
          setRecentSuccess(confirmPreset.key);
          setConfirmPreset(null);
          setTimeout(() => setRecentSuccess(null), 3000);
          onRuleCreated?.();
        },
      }
    );
  }, [confirmPreset, createMutation, onRuleCreated]);

  const handleApplyTemplate = useCallback(
    (template: MaintenanceTemplate) => {
      applyTemplateMutation.mutate(template.id, {
        onSuccess: (tpl) => {
          createFromTemplate.mutate(
            {
              scope: tpl.scope,
              target_key: tpl.target_key,
              severity: tpl.severity,
              title: tpl.title,
              message: tpl.message,
              priority: tpl.priority,
              display_config: tpl.display_config,
              metadata: tpl.metadata,
              allowed_roles: tpl.allowed_roles,
              is_active: true,
            },
            {
              onSuccess: () => {
                setShowTemplates(false);
                onRuleCreated?.();
              },
            }
          );
        },
      });
    },
    [applyTemplateMutation, createFromTemplate, onRuleCreated]
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
              showTemplates
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showTemplates ? 'Quick Presets' : `Templates (${templates.length})`}
          </button>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {showTemplates ? (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <TemplateList
                templates={templates}
                onApply={handleApplyTemplate}
                onDelete={() => {}} // Delete handled inline
                isApplying={applyTemplateMutation.isPending || createFromTemplate.isPending}
              />
            </motion.div>
          ) : (
            <motion.div
              key="presets"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {QUICK_PRESETS.map((preset) => {
                const PresetIcon = getIcon(preset.icon);
                const isSuccess = recentSuccess === preset.key;
                const hasExisting = rules.some(
                  (r) =>
                    r.target_key === preset.rule.target_key &&
                    r.scope === preset.rule.scope &&
                    r.is_active
                );

                return (
                  <motion.button
                    key={preset.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmPreset(preset)}
                    disabled={isSuccess}
                    className={`
                      relative flex flex-col items-center gap-2 p-3 rounded-xl border
                      transition-all duration-200 text-center
                      ${isSuccess
                        ? 'bg-emerald-50 border-emerald-200'
                        : hasExisting
                          ? 'bg-amber-50/50 border-amber-200/50 hover:border-amber-300'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSuccess ? 'bg-emerald-500' : preset.color
                    }`}>
                      {isSuccess ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <PresetIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 leading-tight">
                      {preset.label}
                    </span>
                    {hasExisting && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full
                                       flex items-center justify-center">
                        <AlertTriangle className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmPreset && (
          <ConfirmDialog
            preset={confirmPreset}
            rules={rules}
            onConfirm={handlePresetConfirm}
            onCancel={() => setConfirmPreset(null)}
            isCreating={createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
