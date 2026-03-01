/**
 * MaintenanceCalendar — Phase 4: Calendar view of upcoming maintenance windows
 *
 * Full month calendar with:
 * - Color-coded maintenance windows by severity
 * - Recurring event indicators
 * - Day detail panel with event list
 * - Month navigation
 * - Today highlight
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Timer,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type {
  MaintenanceRule,
  MaintenanceSchedule,
  RecurrenceConfig,
} from '../../types/maintenance';
import { SEVERITY_CONFIG } from '../../types/maintenance';
import { resolveTargetLabel } from '../../config/maintenanceRegistry';

// =============================================================================
// Types
// =============================================================================

interface MaintenanceCalendarProps {
  rules: MaintenanceRule[];
  schedules: MaintenanceSchedule[];
  isLoading?: boolean;
  className?: string;
  onRuleClick?: (ruleId: string) => void;
}

interface CalendarEvent {
  id: string;
  ruleId: string;
  scheduleId: string;
  ruleTitle: string;
  targetKey: string;
  targetLabel: string;
  severity: string;
  startsAt: Date;
  endsAt: Date | null;
  isRecurring: boolean;
  recurrence: RecurrenceConfig | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

// =============================================================================
// Constants
// =============================================================================

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SEVERITY_DOT_COLORS: Record<string, string> = {
  full_block: 'bg-red-500',
  degraded: 'bg-amber-500',
  notice: 'bg-blue-500',
};

const SEVERITY_EVENT_STYLES: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  full_block: {
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    text: 'text-red-800',
    hoverBg: 'hover:bg-red-100',
  },
  degraded: {
    bg: 'bg-amber-50',
    border: 'border-l-amber-500',
    text: 'text-amber-800',
    hoverBg: 'hover:bg-amber-100',
  },
  notice: {
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    text: 'text-blue-800',
    hoverBg: 'hover:bg-blue-100',
  },
};

// =============================================================================
// Helpers
// =============================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDuration(startMs: number, endMs: number): string {
  const hours = Math.floor((endMs - startMs) / 3600000);
  const minutes = Math.floor(((endMs - startMs) % 3600000) / 60000);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Get all days in a month with padding from prev/next months */
function getCalendarDays(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  const days: Date[] = [];

  // Previous month padding
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  // Next month padding (fill to 6 rows)
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - startPad - totalDays + 1));
  }

  // Split into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

/** Expand recurring schedules into individual events for a month */
function expandScheduleForMonth(
  schedule: MaintenanceSchedule,
  rule: MaintenanceRule,
  year: number,
  month: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const recurrence = schedule.recurrence as RecurrenceConfig | null;

  if (!recurrence) {
    // Fixed window — just return one event
    const startsAt = new Date(schedule.starts_at);
    const endsAt = schedule.ends_at ? new Date(schedule.ends_at) : null;

    // Check if event falls within this month (with some padding)
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
    const eventEnd = endsAt ?? new Date(startsAt.getTime() + 4 * 3600000);

    if (startsAt <= monthEnd && eventEnd >= monthStart) {
      events.push({
        id: schedule.id,
        ruleId: rule.id,
        scheduleId: schedule.id,
        ruleTitle: rule.title,
        targetKey: rule.target_key,
        targetLabel: resolveTargetLabel(rule.target_key),
        severity: rule.severity,
        startsAt,
        endsAt,
        isRecurring: false,
        recurrence: null,
      });
    }
    return events;
  }

  // Recurring — expand for each day of the month
  const [startHour, startMinute] = (recurrence.start_time || '02:00').split(':').map(Number);
  const durationMs = (recurrence.duration_hours || 4) * 3600000;

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const current = new Date(monthStart);
  while (current <= monthEnd) {
    let shouldAdd = false;

    switch (recurrence.type) {
      case 'daily':
        shouldAdd = true;
        break;
      case 'weekly': {
        const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        shouldAdd = dayName === (recurrence.day || 'sunday').toLowerCase();
        break;
      }
      case 'monthly':
        shouldAdd = current.getDate() === (recurrence.day_of_month ?? 1);
        break;
    }

    if (shouldAdd) {
      const eventStart = new Date(current);
      eventStart.setHours(startHour, startMinute, 0, 0);
      const eventEnd = new Date(eventStart.getTime() + durationMs);

      events.push({
        id: `${schedule.id}-${eventStart.toISOString()}`,
        ruleId: rule.id,
        scheduleId: schedule.id,
        ruleTitle: rule.title,
        targetKey: rule.target_key,
        targetLabel: resolveTargetLabel(rule.target_key),
        severity: rule.severity,
        startsAt: eventStart,
        endsAt: eventEnd,
        isRecurring: true,
        recurrence,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return events;
}

/** Check if two dates are on the same calendar day */
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// =============================================================================
// Subcomponents
// =============================================================================

function DayCell({
  day,
  onClick,
  isSelected,
}: {
  day: CalendarDay;
  onClick: () => void;
  isSelected: boolean;
}) {
  const hasEvents = day.events.length > 0;
  const maxDots = 4;
  const severities = [...new Set(day.events.map(e => e.severity))];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative w-full aspect-square p-1 rounded-lg border transition-all text-left
        flex flex-col items-center
        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
        ${day.isToday ? 'border-[#B01C2E] ring-1 ring-[#B01C2E]/30' : 'border-transparent hover:border-gray-200'}
        ${isSelected ? 'border-[#B01C2E] bg-[#B01C2E]/5 ring-2 ring-[#B01C2E]/20' : ''}
        ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <span className={`
        text-xs font-medium leading-none
        ${day.isToday ? 'bg-[#B01C2E] text-white w-5 h-5 rounded-full flex items-center justify-center' : ''}
        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
      `}>
        {day.date.getDate()}
      </span>

      {/* Event dots */}
      {hasEvents && (
        <div className="flex items-center gap-0.5 mt-auto mb-0.5 flex-wrap justify-center">
          {severities.slice(0, maxDots).map((severity, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT_COLORS[severity] || 'bg-gray-400'}`}
            />
          ))}
          {day.events.length > maxDots && (
            <span className="text-[8px] text-gray-400 font-medium">
              +{day.events.length - maxDots}
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}

function DayDetailPanel({
  day,
  onClose,
  onRuleClick,
}: {
  day: CalendarDay;
  onClose: () => void;
  onRuleClick?: (ruleId: string) => void;
}) {
  const dateStr = day.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{dateStr}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {day.events.length} maintenance {day.events.length === 1 ? 'window' : 'windows'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Events list */}
      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {day.events.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No maintenance scheduled</p>
          </div>
        ) : (
          day.events
            .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
            .map((event) => {
              const styles = SEVERITY_EVENT_STYLES[event.severity] || SEVERITY_EVENT_STYLES.notice;
              const severityCfg = SEVERITY_CONFIG[event.severity as keyof typeof SEVERITY_CONFIG];
              const now = new Date();
              const isActive = now >= event.startsAt && event.endsAt && now < event.endsAt;
              const isPast = event.endsAt && now >= event.endsAt;

              return (
                <motion.button
                  key={event.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => onRuleClick?.(event.ruleId)}
                  className={`
                    w-full text-left p-3 rounded-lg border-l-4 transition-colors
                    ${styles.bg} ${styles.border} ${styles.hoverBg}
                    ${isPast ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{severityCfg?.icon}</span>
                        <span className={`text-sm font-semibold ${styles.text} truncate`}>
                          {event.ruleTitle}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{event.targetLabel}</p>
                    </div>
                    {event.isRecurring && (
                      <RefreshCw className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.startsAt)}
                    </span>
                    {event.endsAt && (
                      <>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span>{formatTime(event.endsAt)}</span>
                        <span className="flex items-center gap-1 text-gray-400 ml-auto">
                          <Timer className="h-3 w-3" />
                          {formatDuration(event.startsAt.getTime(), event.endsAt.getTime())}
                        </span>
                      </>
                    )}
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Currently Active
                    </div>
                  )}
                </motion.button>
              );
            })
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function MaintenanceCalendar({
  rules,
  schedules,
  isLoading = false,
  className = '',
  onRuleClick,
}: MaintenanceCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigation
  const navigatePrev = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
    setSelectedDate(null);
  }, []);

  const navigateNext = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
    setSelectedDate(null);
  }, []);

  const navigateToday = useCallback(() => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(null);
  }, [today]);

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Build calendar events for this month
  const monthEvents = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    for (const schedule of schedules) {
      if (!schedule.is_active) continue;
      const rule = rules.find(r => r.id === schedule.rule_id);
      if (!rule) continue;
      allEvents.push(...expandScheduleForMonth(schedule, rule, currentYear, currentMonth));
    }

    return allEvents;
  }, [rules, schedules, currentYear, currentMonth]);

  // Build calendar grid
  const weeks = useMemo(() => getCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const calendarDays: CalendarDay[][] = useMemo(() => {
    return weeks.map(week =>
      week.map(date => {
        const dayEvents = monthEvents.filter(e => isSameDay(e.startsAt, date));
        return {
          date,
          isCurrentMonth: date.getMonth() === currentMonth,
          isToday: isSameDay(date, today),
          events: dayEvents,
        };
      })
    );
  }, [weeks, monthEvents, currentMonth, today]);

  // Selected day
  const selectedDay = useMemo(() => {
    if (!selectedDate) return null;
    for (const week of calendarDays) {
      for (const day of week) {
        if (isSameDay(day.date, selectedDate)) return day;
      }
    }
    return null;
  }, [selectedDate, calendarDays]);

  // Stats for the month
  const monthStats = useMemo(() => {
    const total = monthEvents.length;
    const recurring = monthEvents.filter(e => e.isRecurring).length;
    const bySeverity = {
      full_block: monthEvents.filter(e => e.severity === 'full_block').length,
      degraded: monthEvents.filter(e => e.severity === 'degraded').length,
      notice: monthEvents.filter(e => e.severity === 'notice').length,
    };
    const totalHours = monthEvents.reduce((acc, e) => {
      if (e.endsAt) {
        return acc + (e.endsAt.getTime() - e.startsAt.getTime()) / 3600000;
      }
      return acc + 4; // Default 4h estimate
    }, 0);

    return { total, recurring, bySeverity, totalHours };
  }, [monthEvents]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Loading calendar…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Maintenance Calendar</h3>
              <p className="text-xs text-gray-500">
                {monthStats.total} {monthStats.total === 1 ? 'window' : 'windows'} this month
                {monthStats.totalHours > 0 && ` · ${Math.round(monthStats.totalHours)}h total`}
              </p>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrev}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={navigateToday}
              className="px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors min-w-[160px] text-center"
            >
              {monthLabel}
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Month stats bar */}
        {monthStats.total > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
            {monthStats.bySeverity.full_block > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {monthStats.bySeverity.full_block} full block
              </span>
            )}
            {monthStats.bySeverity.degraded > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {monthStats.bySeverity.degraded} degraded
              </span>
            )}
            {monthStats.bySeverity.notice > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {monthStats.bySeverity.notice} notice
              </span>
            )}
            {monthStats.recurring > 0 && (
              <span className="flex items-center gap-1 text-purple-600">
                <RefreshCw className="h-3 w-3" />
                {monthStats.recurring} recurring
              </span>
            )}
          </div>
        )}
      </div>

      {/* Calendar grid + detail panel */}
      <div className="flex flex-col lg:flex-row">
        {/* Calendar grid */}
        <div className="flex-1 p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(day => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.flat().map((day, i) => (
              <DayCell
                key={i}
                day={day}
                isSelected={selectedDate !== null && isSameDay(day.date, selectedDate)}
                onClick={() => {
                  if (day.events.length > 0 || selectedDate) {
                    setSelectedDate(
                      selectedDate && isSameDay(day.date, selectedDate) ? null : day.date
                    );
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Day detail sidebar */}
        <AnimatePresence>
          {selectedDay && (
            <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200">
              <DayDetailPanel
                day={selectedDay}
                onClose={() => setSelectedDate(null)}
                onRuleClick={onRuleClick}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {monthStats.total === 0 && (
        <div className="text-center py-8 px-4">
          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No scheduled maintenance this month</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a maintenance rule with a scheduled window to see it here
          </p>
        </div>
      )}
    </div>
  );
}
