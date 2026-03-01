/**
 * MessageEditor — Rich text maintenance message editor
 *
 * Provides:
 * - Title input with character counter
 * - Message textarea with live preview
 * - Display config options (countdown, progress bar, theme, CTA)
 * - Advanced metadata fields (reason, estimated duration, tags)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  MessageSquare,
  Settings2,
  Clock,
  BarChart3,
  Palette,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { MaintenanceDisplayConfig, MaintenanceMetadata } from '../../types/maintenance';

// =============================================================================
// Types
// =============================================================================

interface MessageEditorProps {
  title: string;
  message: string;
  displayConfig: MaintenanceDisplayConfig;
  metadata: MaintenanceMetadata;
  onTitleChange: (title: string) => void;
  onMessageChange: (message: string) => void;
  onDisplayConfigChange: (config: MaintenanceDisplayConfig) => void;
  onMetadataChange: (metadata: MaintenanceMetadata) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function MessageEditor({
  title,
  message,
  displayConfig,
  metadata,
  onTitleChange,
  onMessageChange,
  onDisplayConfigChange,
  onMetadataChange,
  className = '',
}: MessageEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (partial: Partial<MaintenanceDisplayConfig>) => {
    onDisplayConfigChange({ ...displayConfig, ...partial });
  };

  const updateMetadata = (partial: Partial<MaintenanceMetadata>) => {
    onMetadataChange({ ...metadata, ...partial });
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Title */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <Type className="h-4 w-4 text-gray-400" />
          Rule Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Payment System Upgrade"
            maxLength={100}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none transition-shadow"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
            {title.length}/100
          </span>
        </div>
        {!title.trim() && (
          <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
            <AlertCircle className="h-3 w-3" />
            Title is required
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          Public Message <span className="text-xs text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="This section is temporarily unavailable while we make improvements. We'll be back soon!"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                     focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none transition-shadow resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-gray-400">
            This message is shown to visitors on the maintenance placeholder
          </p>
          <span className="text-[11px] text-gray-400">{message.length}/500</span>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <Settings2 className="h-4 w-4 text-gray-400" />
          Display Options
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Show Countdown */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={displayConfig.show_countdown ?? false}
              onChange={(e) => updateConfig({ show_countdown: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#B01C2E] focus:ring-[#B01C2E]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Show Countdown</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Display countdown timer to estimated end
              </p>
            </div>
          </label>

          {/* Show Progress */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={displayConfig.show_progress ?? false}
              onChange={(e) => updateConfig({ show_progress: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#B01C2E] focus:ring-[#B01C2E]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Show Progress Bar</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Display progress from status updates
              </p>
            </div>
          </label>
        </div>

        {/* Theme */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
            <Palette className="h-3.5 w-3.5" />
            Theme
          </label>
          <div className="flex gap-2">
            {(['branded', 'minimal', 'animated'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updateConfig({ theme })}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  displayConfig.theme === theme
                    ? 'bg-[#B01C2E] text-white border-[#B01C2E]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom CTA */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              CTA Button Label <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={displayConfig.custom_cta?.label ?? ''}
              onChange={(e) =>
                updateConfig({
                  custom_cta: {
                    label: e.target.value,
                    href: displayConfig.custom_cta?.href ?? '',
                  },
                })
              }
              placeholder="e.g., Volunteer Instead"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
              CTA Link <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={displayConfig.custom_cta?.href ?? ''}
              onChange={(e) =>
                updateConfig({
                  custom_cta: {
                    label: displayConfig.custom_cta?.label ?? '',
                    href: e.target.value,
                  },
                })
              }
              placeholder="e.g., /volunteer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
            />
          </div>
        </div>

        {/* Redirect */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Redirect To <span className="text-gray-400">(optional, full_block only)</span>
          </label>
          <input
            type="text"
            value={displayConfig.redirect_to ?? ''}
            onChange={(e) => updateConfig({ redirect_to: e.target.value || undefined })}
            placeholder="e.g., /volunteer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
          />
        </div>
      </div>

      {/* Advanced / Metadata Section */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Advanced Options
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Priority <span className="text-gray-400">(0–100, higher wins)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                    disabled
                    title="Priority is set on the main form"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Set in the priority field above</p>
                </div>

                {/* Estimated Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={metadata.estimated_duration_hours ?? ''}
                    onChange={(e) =>
                      updateMetadata({
                        estimated_duration_hours: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                  />
                </div>

                {/* Reason */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Internal Reason / Notes
                  </label>
                  <textarea
                    value={metadata.reason ?? ''}
                    onChange={(e) =>
                      updateMetadata({ reason: e.target.value || undefined })
                    }
                    rows={2}
                    placeholder="e.g., Payment provider migration from Stripe v2 to v3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Internal only — not shown to visitors
                  </p>
                </div>

                {/* Ticket Reference */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Ticket / Reference
                  </label>
                  <input
                    type="text"
                    value={metadata.jira_ticket ?? ''}
                    onChange={(e) =>
                      updateMetadata({ jira_ticket: e.target.value || undefined })
                    }
                    placeholder="NF-234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                    <Tag className="h-3 w-3" />
                    Tags <span className="text-gray-400">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={(metadata.tags ?? []).join(', ')}
                    onChange={(e) =>
                      updateMetadata({
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="payment, migration, urgent"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                  />
                </div>

                {/* Affected Services */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Affected Services <span className="text-gray-400">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={(metadata.affected_services ?? []).join(', ')}
                    onChange={(e) =>
                      updateMetadata({
                        affected_services: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="mpesa, stripe, bank-transfers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
