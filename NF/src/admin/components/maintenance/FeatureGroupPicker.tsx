/**
 * FeatureGroupPicker — Select feature groups for cross-cutting maintenance rules
 *
 * Displays feature groups as cards with their affected targets listed.
 * Used when scope is 'feature_group' in the RuleForm.
 */

import { motion } from 'framer-motion';
import {
  Heart,
  Camera,
  Users,
  BookOpen,
  Mail,
  Check,
  FileText,
  Layers,
} from 'lucide-react';
import { FEATURE_GROUPS } from '../../config/maintenanceRegistry';
import { resolveTargetLabel } from '../../config/maintenanceRegistry';

// =============================================================================
// Icon resolver
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Camera, Users, BookOpen, Mail, FileText, Layers,
};

function IconComponent({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Layers;
  return <Icon className={className} />;
}

// =============================================================================
// Types
// =============================================================================

interface FeatureGroupPickerProps {
  value: string; // The selected feature group key
  onChange: (key: string) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function FeatureGroupPicker({
  value,
  onChange,
  className = '',
}: FeatureGroupPickerProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Feature Group</label>
      <p className="text-xs text-gray-500">
        Feature groups apply maintenance to all related pages and sections at once
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURE_GROUPS.map((group) => {
          const isSelected = value === group.key;

          return (
            <motion.button
              key={group.key}
              type="button"
              onClick={() => onChange(group.key)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-[#B01C2E] bg-[#B01C2E]/5 ring-1 ring-[#B01C2E]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Selection check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#B01C2E] flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#B01C2E]/10' : 'bg-gray-100'
                  }`}
                >
                  <IconComponent
                    name={group.icon}
                    className={`h-5 w-5 ${isSelected ? 'text-[#B01C2E]' : 'text-gray-500'}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{group.label}</p>
                  <p className="text-xs text-gray-500">{group.description}</p>
                </div>
              </div>

              {/* Affected targets */}
              <div className="mt-auto">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  Affected areas ({group.targets.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {group.targets.map((target) => (
                    <span
                      key={target}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#B01C2E]/10 text-[#B01C2E]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      title={resolveTargetLabel(target)}
                    >
                      {target}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
