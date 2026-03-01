/**
 * ScheduleTimeline — Phase 4: Visual timeline of maintenance schedules
 *
 * Shows a horizontal timeline visualization of upcoming and past maintenance
 * windows. Supports fixed and recurring schedules with interactive tooltips,
 * zoom controls, and real-time "now" indicator.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Loader2,
  X,
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

interface ScheduleTimelineProps {
  rules: MaintenanceRule[];
  schedules: MaintenanceSchedule[];
  isLoading?: boolean;
  className?: string;
}

interface TimelineEvent {
  id: string;
  ruleId: string;
  scheduleId: string;
  ruleTitle: string;
  targetKey: string;
  severity: string;
  startsAt: Date;
  endsAt: Date | null;
  isRecurring: boolean;
  recurrence: RecurrenceConfig | null;
  status: 'past' | 'active' | 'upcoming';
}

type TimelineView = '24h' | '7d' | '30d';

// =============================================================================
// Constants
// =============================================================================

const VIEW_CONFIG: Record<TimelineView, { label: string; hours: number; tickInterval: number; tickFormat: string }> = {
  '24h': { label: '24 Hours', hours: 24, tickInterval: 2, tickFormat: 'HH:mm' },
  '7d': { label: '7 Days', hours: 168, tickInterval: 24, tickFormat: 'EEE d' },
  '30d': { label: '30 Days', hours: 720, tickInterval: 72, tickFormat: 'MMM d' },
};

const SEVERITY_COLORS: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  full_block: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', fill: '#EF4444' },
  degraded: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', fill: '#F59E0B' },
  notice: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', fill: '#3B82F6' },
};

// =============================================================================
// Helpers
// =============================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

function formatDuration(startMs: number, endMs: number): string {
  const durationMs = endMs - startMs;
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Generate recurring events within a time window */
function expandRecurringSchedule(
  schedule: MaintenanceSchedule,
  rule: MaintenanceRule,
  windowStart: Date,
  windowEnd: Date,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const recurrence = schedule.recurrence as RecurrenceConfig;
  if (!recurrence) return events;

  const [startHour, startMinute] = (recurrence.start_time || '02:00').split(':').map(Number);
  const durationMs = (recurrence.duration_hours || 4) * 3600000;

  const current = new Date(windowStart);
  current.setHours(0, 0, 0, 0);

  const now = new Date();
  let iterations = 0;
  const maxIterations = 100; // Safety limit

  while (current <= windowEnd && iterations < maxIterations) {
    iterations++;
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

      if (eventStart >= windowStart && eventStart <= windowEnd) {
        const status: TimelineEvent['status'] =
          now >= eventStart && now < eventEnd ? 'active' :
          now >= eventEnd ? 'past' : 'upcoming';

        events.push({
          id: `${schedule.id}-${eventStart.toISOString()}`,
          ruleId: rule.id,
          scheduleId: schedule.id,
          ruleTitle: rule.title,
          targetKey: rule.target_key,
          severity: rule.severity,
          startsAt: eventStart,
          endsAt: eventEnd,
          isRecurring: true,
          recurrence,
          status,
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return events;
}

// =============================================================================
// Subcomponents
// =============================================================================

function TimelineTooltip({
  event,
  onClose,
}: {
  event: TimelineEvent;
  onClose: () => void;
}) {
  const colors = SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.notice;
  const severityCfg = SEVERITY_CONFIG[event.severity as keyof typeof SEVERITY_CONFIG];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-72"
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-3 ${colors.bg} border-b ${colors.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{severityCfg?.icon}</span>
            <span className={`text-sm font-semibold ${colors.text} truncate`}>{event.ruleTitle}</span>
          </div>
          <button onClick={onClose} className="p-0.5 hover:bg-white/50 rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
              {event.targetKey}
            </code>
            {event.isRecurring && (
              <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                <RefreshCw className="h-3 w-3" />
                Recurring
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500 font-medium">Starts</p>
              <p className="text-gray-900">{formatDateTime(event.startsAt)}</p>
            </div>
            {event.endsAt && (
              <div>
                <p className="text-gray-500 font-medium">Ends</p>
                <p className="text-gray-900">{formatDateTime(event.endsAt)}</p>
              </div>
            )}
          </div>

          {event.endsAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Timer className="h-3.5 w-3.5" />
              Duration: {formatDuration(event.startsAt.getTime(), event.endsAt.getTime())}
            </div>
          )}

          {/* Status indicator */}
          <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-lg ${
            event.status === 'active' ? 'bg-green-50 text-green-700' :
            event.status === 'past' ? 'bg-gray-50 text-gray-500' :
            'bg-blue-50 text-blue-700'
          }`}>
            {event.status === 'active' ? (
              <><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Currently Active</>
            ) : event.status === 'past' ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Completed</>
            ) : (
              <><Clock className="h-3.5 w-3.5" /> Upcoming</>
            )}
          </div>

          {event.isRecurring && event.recurrence && (
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1.5 rounded-lg">
              <RefreshCw className="h-3 w-3 inline mr-1" />
              {event.recurrence.type === 'daily' && `Every day at ${event.recurrence.start_time}`}
              {event.recurrence.type === 'weekly' && `Every ${event.recurrence.day} at ${event.recurrence.start_time}`}
              {event.recurrence.type === 'monthly' && `Day ${event.recurrence.day_of_month} at ${event.recurrence.start_time}`}
              {` for ${event.recurrence.duration_hours}h`}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NowIndicator({ position }: { position: number }) {
  return (
    <div
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: `${position}%` }}
    >
      <div className="relative h-full">
        {/* Triangle marker */}
        <div className="absolute -top-0.5 -translate-x-1/2">
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
        </div>
        {/* Vertical line */}
        <div className="absolute top-1 bottom-0 left-1/2 -translate-x-1/2 w-px bg-red-500" />
        {/* Label */}
        <div className="absolute top-1.5 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
          NOW
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ScheduleTimeline({
  rules,
  schedules,
  isLoading = false,
  className = '',
}: ScheduleTimelineProps) {
  const [view, setView] = useState<TimelineView>('7d');
  const [offset, setOffset] = useState(0); // offset in view-units (negative = past)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Real-time clock update
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const config = VIEW_CONFIG[view];

  // Compute time window
  const windowStart = useMemo(() => {
    const start = new Date(currentTime);
    start.setHours(start.getHours() - config.hours * 0.2); // Show 20% past
    start.setHours(start.getHours() + offset * config.hours);
    return start;
  }, [currentTime, config.hours, offset]);

  const windowEnd = useMemo(() => {
    return new Date(windowStart.getTime() + config.hours * 3600000);
  }, [windowStart, config.hours]);

  // Build timeline events
  const events = useMemo(() => {
    const allEvents: TimelineEvent[] = [];
    const now = currentTime;

    for (const schedule of schedules) {
      const rule = rules.find(r => r.id === schedule.rule_id);
      if (!rule) continue;

      if (schedule.recurrence) {
        // Expand recurring schedule
        allEvents.push(...expandRecurringSchedule(schedule, rule, windowStart, windowEnd));
      } else {
        // Fixed window
        const startsAt = new Date(schedule.starts_at);
        const endsAt = schedule.ends_at ? new Date(schedule.ends_at) : null;

        // Check if event overlaps with window
        const eventEnd = endsAt ?? new Date(startsAt.getTime() + 4 * 3600000);
        if (startsAt <= windowEnd && eventEnd >= windowStart) {
          const status: TimelineEvent['status'] =
            now >= startsAt && (!endsAt || now < endsAt) ? 'active' :
            endsAt && now >= endsAt ? 'past' : 'upcoming';

          allEvents.push({
            id: schedule.id,
            ruleId: rule.id,
            scheduleId: schedule.id,
            ruleTitle: rule.title,
            targetKey: rule.target_key,
            severity: rule.severity,
            startsAt,
            endsAt,
            isRecurring: false,
            recurrence: null,
            status,
          });
        }
      }
    }

    return allEvents.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [rules, schedules, windowStart, windowEnd, currentTime]);

  // Generate tick marks
  const ticks = useMemo(() => {
    const result: { position: number; label: string; isMinor: boolean }[] = [];
    const tickMs = config.tickInterval * 3600000;
    const windowMs = windowEnd.getTime() - windowStart.getTime();

    let tickTime = new Date(windowStart);
    // Align to tick interval
    const intervalHours = config.tickInterval;
    tickTime.setMinutes(0, 0, 0);
    tickTime.setHours(Math.ceil(tickTime.getHours() / intervalHours) * intervalHours);

    while (tickTime <= windowEnd) {
      const position = ((tickTime.getTime() - windowStart.getTime()) / windowMs) * 100;
      let label: string;

      if (view === '24h') {
        label = formatTime(tickTime);
      } else if (view === '7d') {
        label = tickTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      } else {
        label = tickTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      result.push({ position, label, isMinor: false });
      tickTime = new Date(tickTime.getTime() + tickMs);
    }

    return result;
  }, [windowStart, windowEnd, config, view]);

  // Now indicator position
  const nowPosition = useMemo(() => {
    const windowMs = windowEnd.getTime() - windowStart.getTime();
    const nowMs = currentTime.getTime() - windowStart.getTime();
    const pos = (nowMs / windowMs) * 100;
    return pos >= 0 && pos <= 100 ? pos : null;
  }, [currentTime, windowStart, windowEnd]);

  // Navigation
  const navigatePrev = useCallback(() => setOffset(o => o - 1), []);
  const navigateNext = useCallback(() => setOffset(o => o + 1), []);
  const navigateToday = useCallback(() => setOffset(0), []);

  // Assign events to swimlanes (avoid overlapping)
  const swimlanes = useMemo(() => {
    const lanes: TimelineEvent[][] = [];

    for (const event of events) {
      let placed = false;
      for (const lane of lanes) {
        const overlaps = lane.some(e => {
          const eEnd = e.endsAt ?? new Date(e.startsAt.getTime() + 4 * 3600000);
          const eventEnd = event.endsAt ?? new Date(event.startsAt.getTime() + 4 * 3600000);
          return event.startsAt < eEnd && eventEnd > e.startsAt;
        });
        if (!overlaps) {
          lane.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        lanes.push([event]);
      }
    }

    return lanes;
  }, [events]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Loading schedule timeline…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Schedule Timeline</h3>
            <p className="text-xs text-gray-500">
              {formatDate(windowStart)} — {formatDate(windowEnd)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View selector */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(Object.entries(VIEW_CONFIG) as [TimelineView, typeof VIEW_CONFIG['24h']][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { setView(key); setOffset(0); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  view === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrev}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={navigateToday}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Body */}
      <div className="px-5 py-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No scheduled maintenance</p>
            <p className="text-xs text-gray-400 mt-1">
              No maintenance windows in this time range
            </p>
          </div>
        ) : (
          <div ref={timelineRef} className="relative">
            {/* Tick marks */}
            <div className="relative h-6 border-b border-gray-200">
              {ticks.map((tick, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 flex flex-col items-center"
                  style={{ left: `${tick.position}%` }}
                >
                  <div className="w-px h-2 bg-gray-300" />
                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap -translate-x-1/2">
                    {tick.label}
                  </span>
                </div>
              ))}
              {/* Now indicator */}
              {nowPosition !== null && <NowIndicator position={nowPosition} />}
            </div>

            {/* Swimlanes */}
            <div className="relative mt-2 space-y-1.5" style={{ minHeight: `${Math.max(swimlanes.length * 36, 48)}px` }}>
              {/* Grid lines */}
              {ticks.map((tick, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-100"
                  style={{ left: `${tick.position}%` }}
                />
              ))}

              {/* Now line extending into swimlanes */}
              {nowPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-200 z-10"
                  style={{ left: `${nowPosition}%` }}
                />
              )}

              {/* Event bars */}
              {swimlanes.map((lane, laneIdx) => (
                <div key={laneIdx} className="relative h-8">
                  {lane.map((event) => {
                    const windowMs = windowEnd.getTime() - windowStart.getTime();
                    const eventEnd = event.endsAt ?? new Date(event.startsAt.getTime() + 4 * 3600000);
                    const leftPct = Math.max(0, ((event.startsAt.getTime() - windowStart.getTime()) / windowMs) * 100);
                    const rightPct = Math.min(100, ((eventEnd.getTime() - windowStart.getTime()) / windowMs) * 100);
                    const widthPct = Math.max(1, rightPct - leftPct); // Min 1% width for visibility

                    const colors = SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.notice;
                    const isSelected = selectedEvent === event.id;

                    return (
                      <div
                        key={event.id}
                        className="absolute top-0 h-full"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                          className={`
                            relative w-full h-full rounded-md border cursor-pointer
                            transition-all overflow-hidden group
                            ${colors.bg} ${colors.border}
                            ${event.status === 'past' ? 'opacity-50' : ''}
                            ${event.status === 'active' ? 'ring-2 ring-green-400 ring-offset-1' : ''}
                            ${isSelected ? 'ring-2 ring-[#B01C2E] ring-offset-1' : ''}
                          `}
                        >
                          {/* Progress fill for active events */}
                          {event.status === 'active' && event.endsAt && (
                            <div
                              className="absolute inset-0 bg-green-200/40"
                              style={{
                                width: `${Math.min(100, ((currentTime.getTime() - event.startsAt.getTime()) / (event.endsAt.getTime() - event.startsAt.getTime())) * 100)}%`,
                              }}
                            />
                          )}

                          {/* Label */}
                          <div className={`relative px-2 py-1 flex items-center gap-1 h-full ${colors.text}`}>
                            {event.isRecurring && <RefreshCw className="h-3 w-3 flex-shrink-0" />}
                            <span className="text-[11px] font-medium truncate">{event.ruleTitle}</span>
                          </div>
                        </motion.button>

                        {/* Tooltip */}
                        <AnimatePresence>
                          {isSelected && (
                            <TimelineTooltip
                              event={event}
                              onClose={() => setSelectedEvent(null)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer legend */}
      {events.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
            Full Block
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
            Degraded
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300" />
            Notice
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active now
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 text-purple-500" />
            Recurring
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-px bg-red-500" />
            <span className="text-red-500 font-medium">NOW</span>
          </div>
        </div>
      )}
    </div>
  );
}
