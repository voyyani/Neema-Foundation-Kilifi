/**
 * ScheduleEditor — Date/time + recurrence picker for maintenance windows
 *
 * Supports:
 * - Immediate activation
 * - Scheduled start/end with timezone
 * - Recurring windows (daily, weekly, monthly)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  RefreshCw,
  Zap,
  CalendarClock,
  X,
  Plus,
  Globe,
} from 'lucide-react';
import type { RecurrenceConfig } from '../../types/maintenance';

// =============================================================================
// Types
// =============================================================================

export interface ScheduleData {
  mode: 'immediate' | 'scheduled';
  startsAt: string; // ISO timestamp or datetime-local value
  endsAt: string;   // ISO timestamp or datetime-local value
  timezone: string;
  recurrence: RecurrenceConfig | null;
}

interface ScheduleEditorProps {
  value: ScheduleData;
  onChange: (schedule: ScheduleData) => void;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const TIMEZONES = [
  { value: 'Africa/Nairobi', label: 'East Africa Time (EAT)', offset: 'UTC+3' },
  { value: 'UTC', label: 'Coordinated Universal Time', offset: 'UTC+0' },
  { value: 'Europe/London', label: 'London', offset: 'UTC+0/+1' },
  { value: 'America/New_York', label: 'New York (EST)', offset: 'UTC-5' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: 'UTC-8' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const DURATION_PRESETS = [
  { hours: 1, label: '1 hour' },
  { hours: 2, label: '2 hours' },
  { hours: 4, label: '4 hours' },
  { hours: 6, label: '6 hours' },
  { hours: 8, label: '8 hours' },
  { hours: 12, label: '12 hours' },
  { hours: 24, label: '24 hours' },
];

// =============================================================================
// Component
// =============================================================================

export default function ScheduleEditor({
  value,
  onChange,
  className = '',
}: ScheduleEditorProps) {
  const [showRecurrence, setShowRecurrence] = useState(!!value.recurrence);

  useEffect(() => {
    setShowRecurrence(!!value.recurrence);
  }, [value.recurrence]);

  const update = (partial: Partial<ScheduleData>) => {
    onChange({ ...value, ...partial });
  };

  const updateRecurrence = (partial: Partial<RecurrenceConfig>) => {
    update({
      recurrence: value.recurrence
        ? { ...value.recurrence, ...partial }
        : {
            type: 'weekly',
            day: 'sunday',
            start_time: '02:00',
            duration_hours: 4,
            ...partial,
          },
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Schedule</label>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update({ mode: 'immediate' })}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
            value.mode === 'immediate'
              ? 'bg-[#B01C2E] text-white border-[#B01C2E] shadow-sm'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Zap className="h-4 w-4" />
          Immediate
        </button>
        <button
          type="button"
          onClick={() => update({ mode: 'scheduled' })}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
            value.mode === 'scheduled'
              ? 'bg-[#B01C2E] text-white border-[#B01C2E] shadow-sm'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          Scheduled
        </button>
      </div>

      {/* Immediate Mode */}
      {value.mode === 'immediate' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <Zap className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Activate on save</p>
            <p className="text-xs text-amber-600">
              The rule will become active as soon as you save with the "Activate" option.
              You can also save as a draft and activate later.
            </p>
          </div>
        </motion.div>
      )}

      {/* Scheduled Mode */}
      {value.mode === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Start / End DateTime */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Calendar className="h-3.5 w-3.5 inline mr-1" />
                Starts at
              </label>
              <input
                type="datetime-local"
                value={value.startsAt}
                onChange={(e) => update({ startsAt: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                Ends at <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={value.endsAt}
                onChange={(e) => update({ endsAt: e.target.value })}
                min={value.startsAt || undefined}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
              />
            </div>
          </div>

          {/* Duration quick-picks */}
          {value.startsAt && !value.endsAt && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Quick duration:</p>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.hours}
                    type="button"
                    onClick={() => {
                      if (value.startsAt) {
                        const start = new Date(value.startsAt);
                        const end = new Date(start.getTime() + preset.hours * 3600000);
                        // Format to datetime-local
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        const formatted = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
                        update({ endsAt: formatted });
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100
                               hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timezone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Globe className="h-3.5 w-3.5 inline mr-1" />
              Timezone
            </label>
            <select
              value={value.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                         focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>
          </div>

          {/* Schedule summary */}
          {value.startsAt && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CalendarClock className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">Schedule Summary</p>
                <p className="mt-0.5">
                  Starts: {new Date(value.startsAt).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {value.endsAt && (
                  <p>
                    Ends: {new Date(value.endsAt).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {!value.endsAt && (
                  <p className="text-blue-500 italic">No end time — will remain active until manually deactivated</p>
                )}
              </div>
            </div>
          )}

          {/* Recurrence Toggle */}
          <div className="border-t border-gray-200 pt-4">
            {!showRecurrence ? (
              <button
                type="button"
                onClick={() => {
                  setShowRecurrence(true);
                  updateRecurrence({});
                }}
                className="inline-flex items-center gap-2 text-sm text-[#B01C2E] hover:text-[#8A1624]
                           font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Recurrence
              </button>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Recurring Window</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecurrence(false);
                        update({ recurrence: null });
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Frequency
                      </label>
                      <select
                        value={value.recurrence?.type ?? 'weekly'}
                        onChange={(e) =>
                          updateRecurrence({
                            type: e.target.value as RecurrenceConfig['type'],
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                                   focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Day (weekly) */}
                    {(value.recurrence?.type ?? 'weekly') === 'weekly' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Day of Week
                        </label>
                        <select
                          value={value.recurrence?.day ?? 'sunday'}
                          onChange={(e) => updateRecurrence({ day: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                                     focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Day of Month (monthly) */}
                    {value.recurrence?.type === 'monthly' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Day of Month
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={value.recurrence?.day_of_month ?? 1}
                          onChange={(e) =>
                            updateRecurrence({ day_of_month: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                     focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                        />
                      </div>
                    )}

                    {/* Start Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={value.recurrence?.start_time ?? '02:00'}
                        onChange={(e) => updateRecurrence({ start_time: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                   focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        min={0.5}
                        max={168}
                        step={0.5}
                        value={value.recurrence?.duration_hours ?? 4}
                        onChange={(e) =>
                          updateRecurrence({ duration_hours: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                   focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                      />
                    </div>
                  </div>

                  {/* Recurrence summary */}
                  {value.recurrence && (
                    <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-purple-500 mt-0.5" />
                      <p className="text-xs text-purple-700">
                        <span className="font-medium">Recurs: </span>
                        {formatRecurrenceSummary(value.recurrence)}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function formatRecurrenceSummary(r: RecurrenceConfig): string {
  const timeStr = r.start_time ?? '02:00';
  const durationStr = r.duration_hours === 1
    ? '1 hour'
    : `${r.duration_hours} hours`;

  switch (r.type) {
    case 'daily':
      return `Every day at ${timeStr} for ${durationStr}`;
    case 'weekly':
      return `Every ${r.day ?? 'Sunday'} at ${timeStr} for ${durationStr}`;
    case 'monthly':
      return `Day ${r.day_of_month ?? 1} of every month at ${timeStr} for ${durationStr}`;
    default:
      return 'Custom recurrence';
  }
}
