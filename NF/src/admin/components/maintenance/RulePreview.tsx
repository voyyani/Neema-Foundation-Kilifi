/**
 * RulePreview — Live preview of the maintenance display
 *
 * Shows a real-time preview of what visitors will see based on the
 * current rule configuration. Renders different views for each severity:
 * - full_block: Full maintenance page with countdown & progress
 * - degraded: Compact placeholder with message
 * - notice: Thin banner above content
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Monitor,
  Smartphone,
  Clock,
  Wrench,
  AlertTriangle,
  Info,
  ArrowRight,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { SEVERITY_CONFIG, type MaintenanceSeverity, type MaintenanceDisplayConfig } from '../../types/maintenance';
import { resolveTargetLabel } from '../../config/maintenanceRegistry';

// =============================================================================
// Types
// =============================================================================

interface RulePreviewProps {
  title: string;
  message: string;
  severity: MaintenanceSeverity;
  targetKey: string;
  displayConfig: MaintenanceDisplayConfig;
  estimatedEnd?: string;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function RulePreview({
  title,
  message,
  severity,
  targetKey,
  displayConfig,
  estimatedEnd,
  className = '',
}: RulePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const targetLabel = useMemo(() => resolveTargetLabel(targetKey || 'landing'), [targetKey]);

  const countdown = useMemo(() => {
    if (!estimatedEnd || !displayConfig.show_countdown) return null;
    const end = new Date(estimatedEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return null;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return { hours, minutes };
  }, [estimatedEnd, displayConfig.show_countdown]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <Eye className="h-4 w-4 text-gray-400" />
          Live Preview
        </label>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Monitor className="h-3.5 w-3.5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <motion.div
        layout
        className={`border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 ${
          viewMode === 'mobile' ? 'max-w-[320px] mx-auto' : ''
        }`}
      >
        {/* Browser chrome mockup */}
        <div className="bg-gray-200 px-3 py-2 flex items-center gap-2 border-b border-gray-300">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-2 py-0.5 text-[10px] text-gray-400 font-mono">
            neemafoundation.org{targetKey ? ` — ${targetLabel}` : ''}
          </div>
        </div>

        {/* Preview content */}
        <div className="p-4">
          {severity === 'full_block' && (
            <FullBlockPreview
              title={title}
              message={message}
              displayConfig={displayConfig}
              countdown={countdown}
              viewMode={viewMode}
            />
          )}
          {severity === 'degraded' && (
            <DegradedPreview
              title={title}
              message={message}
              displayConfig={displayConfig}
              viewMode={viewMode}
            />
          )}
          {severity === 'notice' && (
            <NoticePreview
              title={title}
              message={message}
              viewMode={viewMode}
            />
          )}
        </div>

        {/* Severity indicator */}
        <div className="bg-white border-t border-gray-200 px-3 py-1.5 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${SEVERITY_CONFIG[severity].color} px-2 py-0.5 rounded-full`}>
            {SEVERITY_CONFIG[severity].icon} {SEVERITY_CONFIG[severity].label}
          </span>
          <span className="text-[10px] text-gray-400">
            {viewMode === 'desktop' ? 'Desktop' : 'Mobile'} view
          </span>
        </div>
      </motion.div>

      {/* Preview notes */}
      <p className="text-[11px] text-gray-400 text-center">
        This is an approximation. The actual display may vary slightly based on page context.
      </p>
    </div>
  );
}

// =============================================================================
// Full Block Preview
// =============================================================================

function FullBlockPreview({
  title,
  message,
  displayConfig,
  countdown,
  viewMode,
}: {
  title: string;
  message: string;
  displayConfig: MaintenanceDisplayConfig;
  countdown: { hours: number; minutes: number } | null;
  viewMode: 'desktop' | 'mobile';
}) {
  const theme = displayConfig.theme ?? 'branded';

  return (
    <div
      className={`rounded-lg overflow-hidden ${
        theme === 'branded'
          ? 'bg-gradient-to-b from-[#B01C2E]/10 via-white to-gray-50'
          : theme === 'animated'
            ? 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
            : 'bg-white'
      }`}
    >
      <div className={`text-center ${viewMode === 'mobile' ? 'py-6 px-4' : 'py-10 px-8'}`}>
        {/* Icon */}
        <div
          className={`mx-auto rounded-2xl flex items-center justify-center mb-4 ${
            theme === 'branded' ? 'bg-[#B01C2E]/10' : 'bg-gray-100'
          } ${viewMode === 'mobile' ? 'w-12 h-12' : 'w-16 h-16'}`}
        >
          <Wrench
            className={`${
              theme === 'branded' ? 'text-[#B01C2E]' : 'text-gray-400'
            } ${viewMode === 'mobile' ? 'h-6 w-6' : 'h-8 w-8'}`}
          />
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-gray-900 mb-2 ${
            viewMode === 'mobile' ? 'text-base' : 'text-lg'
          }`}
        >
          {title || 'Under Maintenance'}
        </h3>

        {/* Message */}
        <p className={`text-gray-500 mb-4 ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
          {message || 'This section is temporarily unavailable while we make improvements.'}
        </p>

        {/* Countdown */}
        {displayConfig.show_countdown && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[56px]">
              <p className="text-lg font-bold font-mono">{countdown?.hours ?? '--'}</p>
              <p className="text-[9px] uppercase tracking-wide text-gray-400">Hours</p>
            </div>
            <span className="text-gray-400 text-lg font-bold">:</span>
            <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[56px]">
              <p className="text-lg font-bold font-mono">{countdown?.minutes ?? '--'}</p>
              <p className="text-[9px] uppercase tracking-wide text-gray-400">Mins</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {displayConfig.show_progress && (
          <div className="max-w-xs mx-auto mb-4">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>Progress</span>
              <span>60%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  theme === 'branded' ? 'bg-[#B01C2E]' : 'bg-blue-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {displayConfig.custom_cta?.label && (
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              theme === 'branded'
                ? 'bg-[#B01C2E] text-white hover:bg-[#8A1624]'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {displayConfig.custom_cta.label}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* Auto-refresh indicator */}
        <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-gray-400">
          <RefreshCw className="h-3 w-3" />
          Auto-refreshing every 30s
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Degraded Preview
// =============================================================================

function DegradedPreview({
  title,
  message,
  displayConfig,
  viewMode,
}: {
  title: string;
  message: string;
  displayConfig: MaintenanceDisplayConfig;
  viewMode: 'desktop' | 'mobile';
}) {
  return (
    <div className="space-y-2">
      {/* Gray content placeholder above */}
      <div className="h-8 bg-gray-200 rounded-md animate-pulse" />

      {/* Maintenance placeholder */}
      <div className="border-2 border-amber-300 border-dashed rounded-lg bg-amber-50/50 p-4">
        <div className={`flex items-start gap-3 ${viewMode === 'mobile' ? 'flex-col items-center text-center' : ''}`}>
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              {title || 'Under Maintenance'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {message || 'This section is temporarily unavailable.'}
            </p>
            {displayConfig.show_progress && (
              <div className="mt-2">
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden max-w-[200px]">
                  <div className="h-full w-[60%] bg-amber-500 rounded-full" />
                </div>
              </div>
            )}
            {displayConfig.custom_cta?.label && (
              <button
                type="button"
                className="mt-2 text-xs text-amber-700 underline hover:text-amber-900"
              >
                {displayConfig.custom_cta.label} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gray content placeholder below */}
      <div className="h-12 bg-gray-200 rounded-md animate-pulse" />
    </div>
  );
}

// =============================================================================
// Notice Preview
// =============================================================================

function NoticePreview({
  title,
  message,
  viewMode,
}: {
  title: string;
  message: string;
  viewMode: 'desktop' | 'mobile';
}) {
  return (
    <div className="space-y-2">
      {/* Notice banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-blue-900 ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
            {title || 'Maintenance Notice'}
          </p>
          {message && (
            <p className="text-[11px] text-blue-700 mt-0.5 truncate">{message}</p>
          )}
        </div>
        <button type="button" className="text-blue-400 hover:text-blue-600 text-xs flex-shrink-0">
          ✕
        </button>
      </div>

      {/* Content still visible */}
      <div className="space-y-2 opacity-80">
        <div className="h-20 bg-gray-200 rounded-md" />
        <div className="h-6 bg-gray-200 rounded-md w-3/4" />
        <div className="h-6 bg-gray-200 rounded-md w-1/2" />
        <div className="h-16 bg-gray-200 rounded-md" />
      </div>

      {/* Indicator */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mt-2">
        <Info className="h-3 w-3" />
        Content remains visible with this severity
      </div>
    </div>
  );
}
