/**
 * SeveritySelector — Visual severity mode picker with live preview
 *
 * Shows three cards for full_block, degraded, and notice with
 * descriptions, visual indicators, and a mini preview of what
 * visitors will see for each mode.
 */

import { motion } from 'framer-motion';
import {
  ShieldOff,
  AlertTriangle,
  Info,
  Check,
  Ban,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { SEVERITY_CONFIG, type MaintenanceSeverity } from '../../types/maintenance';

// =============================================================================
// Types
// =============================================================================

interface SeveritySelectorProps {
  value: MaintenanceSeverity;
  onChange: (severity: MaintenanceSeverity) => void;
  className?: string;
}

// =============================================================================
// Severity Card Configuration
// =============================================================================

const SEVERITY_CARDS: {
  value: MaintenanceSeverity;
  icon: React.ComponentType<{ className?: string }>;
  previewIcon: React.ComponentType<{ className?: string }>;
  previewLabel: string;
  previewDescription: string;
  ring: string;
  activeBg: string;
  activeBorder: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    value: 'full_block',
    icon: Ban,
    previewIcon: ShieldOff,
    previewLabel: 'Content Replaced',
    previewDescription: 'Visitors see a full maintenance page with countdown and status updates. Original content is hidden.',
    ring: 'ring-red-500/20',
    activeBg: 'bg-red-50',
    activeBorder: 'border-red-300',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    value: 'degraded',
    icon: AlertTriangle,
    previewIcon: Eye,
    previewLabel: 'Placeholder Shown',
    previewDescription: 'A compact placeholder with your message replaces the section. Page layout is preserved.',
    ring: 'ring-amber-500/20',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-300',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    value: 'notice',
    icon: Info,
    previewIcon: MessageSquare,
    previewLabel: 'Banner Only',
    previewDescription: 'A slim info banner appears above the content. The content remains fully visible and functional.',
    ring: 'ring-blue-500/20',
    activeBg: 'bg-blue-50',
    activeBorder: 'border-blue-300',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
];

// =============================================================================
// Component
// =============================================================================

export default function SeveritySelector({
  value,
  onChange,
  className = '',
}: SeveritySelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Severity Level</label>
      <p className="text-xs text-gray-500">
        Controls how maintenance is displayed to visitors
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {SEVERITY_CARDS.map((card) => {
          const config = SEVERITY_CONFIG[card.value];
          const isActive = value === card.value;

          return (
            <motion.button
              key={card.value}
              type="button"
              onClick={() => onChange(card.value)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isActive
                  ? `${card.activeBg} ${card.activeBorder} ${card.ring} ring-2`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Selection indicator */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#B01C2E] flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}

              {/* Icon + Label */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive ? card.iconBg : 'bg-gray-100'
                  }`}
                >
                  <card.icon
                    className={`h-4.5 w-4.5 ${isActive ? card.iconColor : 'text-gray-400'}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{config.label}</p>
                  <p className="text-[11px] text-gray-500">{config.icon} {config.description}</p>
                </div>
              </div>

              {/* Mini Preview */}
              <div
                className={`w-full rounded-lg border p-3 ${
                  isActive ? 'border-gray-200 bg-white/70' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <card.previewIcon
                    className={`h-3.5 w-3.5 ${isActive ? card.iconColor : 'text-gray-400'}`}
                  />
                  <span className="text-xs font-medium text-gray-700">{card.previewLabel}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {card.previewDescription}
                </p>
              </div>

              {/* Visual severity scale */}
              <div className="flex items-center gap-1 mt-3 w-full">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 rounded-full flex-1 transition-colors ${
                      card.value === 'full_block'
                        ? level <= 3
                          ? isActive ? 'bg-red-400' : 'bg-gray-300'
                          : 'bg-gray-200'
                        : card.value === 'degraded'
                          ? level <= 2
                            ? isActive ? 'bg-amber-400' : 'bg-gray-300'
                            : 'bg-gray-200'
                          : level <= 1
                            ? isActive ? 'bg-blue-400' : 'bg-gray-300'
                            : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {card.value === 'full_block'
                  ? 'Maximum impact'
                  : card.value === 'degraded'
                    ? 'Moderate impact'
                    : 'Minimal impact'}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
