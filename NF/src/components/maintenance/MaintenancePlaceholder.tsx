/**
 * MaintenancePlaceholder — Visual replacement for content under maintenance
 *
 * Three display modes based on severity:
 * - full_block:  Full page/section replacement with countdown, progress, CTA, live feed
 * - degraded:    Compact placeholder — content hidden, short explanatory card + progress
 * - notice:      Thin inline banner above content (content still renders)
 *
 * Phase 5 enhancements:
 *   - Real progress data from status updates (replaces hardcoded 60%/45%)
 *   - Embedded MaintenanceStatusFeed for full_block mode
 *   - Latest status update display in degraded mode
 *   - Live progress bar animation synced to actual percentage
 *
 * Animations preserved from the original Maintenance.tsx page:
 *   pulsing icon, countdown timer, progress bar, floating wrench particles.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Wrench,
  Clock,
  AlertTriangle,
  Info,
  ArrowRight,
  Mail,
  Radio,
} from 'lucide-react';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { useMaintenanceStatusFeed } from '../../hooks/public/useMaintenanceStatusFeed';
import MaintenanceStatusFeed from './MaintenanceStatusFeed';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MaintenancePlaceholderProps {
  /** The active rule driving this placeholder */
  rule: ActiveMaintenanceRule;
  /** Optional: render children below a notice-level placeholder */
  children?: React.ReactNode;
  /** Override minimum height (defaults to display_config.placeholder_height or auto) */
  minHeight?: string;
  /** Extra classes on root wrapper */
  className?: string;
}

// ─── Countdown helper ─────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(estimatedEnd: string | null): TimeLeft | null {
  const endTime = useMemo(
    () => (estimatedEnd ? new Date(estimatedEnd).getTime() : null),
    [estimatedEnd],
  );

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    endTime ? computeTimeLeft(endTime) : null,
  );

  useEffect(() => {
    if (!endTime) return;
    const tick = () => setTimeLeft(computeTimeLeft(endTime));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [endTime]);

  return timeLeft;
}

function computeTimeLeft(endTime: number): TimeLeft {
  const distance = Math.max(0, endTime - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1_000),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const easing = [0.22, 1, 0.36, 1] as const;

/** Reduced-motion safe transition */
function useA11yTransition(duration: number, delay = 0) {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion
    ? { duration: 0.01, delay: 0 }
    : { duration, delay, ease: easing };
}

const MaintenancePlaceholder: React.FC<MaintenancePlaceholderProps> = ({
  rule,
  children,
  minHeight,
  className = '',
}) => {
  const config = (rule.display_config ?? {}) as Record<string, unknown>;
  const showCountdown = config.show_countdown === true;
  const showProgress = config.show_progress === true;
  const theme = (config.theme as string) ?? 'branded';
  const prefersReducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus the heading on mount for screen readers
  useEffect(() => {
    if (rule.severity === 'full_block' && headingRef.current) {
      headingRef.current.focus();
    }
  }, [rule.severity]);
  const customCta = config.custom_cta as { label: string; href: string } | undefined;
  const placeholderHeight =
    minHeight ?? (config.placeholder_height as string | undefined) ?? undefined;

  const timeLeft = useCountdown(showCountdown ? rule.estimated_end : null);

  // Phase 5: Live status updates & real progress
  const { latestProgress, latestUpdate, updates } = useMaintenanceStatusFeed(rule.id);
  const progressPct = latestProgress ?? 0;
  const hasRealProgress = latestProgress !== null;
  const progressLabel = latestUpdate?.title ?? 'Work in progress';

  // ── NOTICE ──────────────────────────────────────────────────────────────────
  if (rule.severity === 'notice') {
    return (
      <>
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: easing }}
          className={`bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 ${className}`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800" id={`notice-title-${rule.id}`}>{rule.title}</p>
              {rule.message && (
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed" id={`notice-msg-${rule.id}`}>
                  {rule.message}
                </p>
              )}
            </div>
            {timeLeft && (
              <span
                className="text-xs font-medium text-amber-600 tabular-nums whitespace-nowrap"
                aria-label={`Estimated time remaining: ${timeLeft.days > 0 ? `${timeLeft.days} days ` : ''}${timeLeft.hours} hours ${timeLeft.minutes} minutes`}
                role="timer"
              >
                {timeLeft.days > 0 && `${timeLeft.days}d `}
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            )}
          </div>
        </motion.div>
        {children}
      </>
    );
  }

  // ── DEGRADED ────────────────────────────────────────────────────────────────
  if (rule.severity === 'degraded') {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: easing }}
        className={`bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 text-center ${className}`}
        style={placeholderHeight ? { minHeight: placeholderHeight } : undefined}
        role="region"
        aria-label={`${rule.title}: This section is temporarily unavailable`}
        aria-live="polite"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-amber-100 rounded-full"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={prefersReducedMotion ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
            <div className="relative bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1" ref={headingRef} tabIndex={-1}>{rule.title}</h3>
            {rule.message && (
              <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                {rule.message}
              </p>
            )}
          </div>

          {showCountdown && timeLeft && <CountdownCompact timeLeft={timeLeft} />}
          {showProgress && <ProgressBarCompact progressPct={progressPct} label={progressLabel} />}

          {/* Latest status update (degraded mode) */}
          {hasRealProgress && latestUpdate && (
            <div className="w-full max-w-sm">
              <div className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 mt-1">
                <Radio className="h-3 w-3 text-emerald-500" />
                <span>{latestUpdate.title}</span>
                <span className="text-gray-300">·</span>
                <span className="tabular-nums">
                  {new Date(latestUpdate.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {customCta && (
            <a
              href={customCta.href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#B01C2E] hover:underline mt-1"
            >
              {customCta.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  // ── FULL_BLOCK ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easing }}
      className={`relative bg-gradient-to-br from-white to-red-50/30 overflow-hidden ${className}`}
      style={{ minHeight: placeholderHeight ?? '60vh' }}
      role="main"
      aria-labelledby={`maint-heading-${rule.id}`}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" role="alert" aria-live="assertive">
        This page is currently under maintenance. {rule.title}. {rule.message ?? ''}
      </div>

      {/* Floating wrench particles (from original Maintenance.tsx) — disabled for reduced motion */}
      {theme === 'animated' && !prefersReducedMotion && <FloatingParticles />}

      <div className="relative z-10 flex flex-col items-center justify-center h-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        {/* Animated icon */}
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-6"
          aria-hidden="true"
        >
          <div className="relative inline-flex">
            <motion.div
              className="absolute inset-0 bg-red-100 rounded-full"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={prefersReducedMotion ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative bg-white p-4 rounded-2xl shadow-2xl border border-gray-200"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ scale: { type: 'spring', stiffness: 300 }, rotate: { duration: 0.5 } }}
            >
              <Wrench className="h-10 w-10 md:h-12 md:w-12 text-red-800" aria-hidden="true" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          id={`maint-heading-${rule.id}`}
          ref={headingRef}
          tabIndex={-1}
          initial={prefersReducedMotion ? {} : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
          className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-3 outline-none"
        >
          {rule.title || 'Under Maintenance'}
        </motion.h1>

        {/* Message */}
        {rule.message && (
          <motion.p
            initial={prefersReducedMotion ? {} : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.55 }}
            className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mb-6"
          >
            {rule.message}
          </motion.p>
        )}

        {/* Countdown timer */}
        {showCountdown && timeLeft && (
          <motion.div
            initial={prefersReducedMotion ? {} : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 mb-6 w-full max-w-md"
            role="timer"
            aria-label={`Estimated return: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Estimated Return</h2>
            <div className="grid grid-cols-4 gap-3" aria-hidden="true">
              {(Object.entries(timeLeft) as [string, number][]).map(([unit, val]) => (
                <div key={unit} className="text-center">
                  <div className="bg-red-50 rounded-xl p-2.5 border border-red-100">
                    <div className="text-xl md:text-2xl font-bold text-red-800 tabular-nums">
                      {String(val).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mt-0.5">
                      {unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Status + progress bar (Phase 5: real progress data) */}
        {showProgress && (
          <motion.div
            initial={prefersReducedMotion ? {} : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.85 }}
            className="w-full max-w-md mb-6"
            role="status"
            aria-label={`Progress: ${hasRealProgress ? `${progressPct}% complete` : 'In progress'}. ${progressLabel}`}
          >
            <div className="flex items-center justify-between text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={prefersReducedMotion ? {} : { rotate: 360 }}
                  transition={prefersReducedMotion ? {} : { duration: 10, repeat: Infinity, ease: 'linear' }}
                  aria-hidden="true"
                >
                  <Clock className="h-4 w-4 text-red-800" aria-hidden="true" />
                </motion.div>
                <span className="text-sm font-medium">{progressLabel}</span>
              </div>
              {hasRealProgress && (
                <span className="text-sm font-bold text-red-800 tabular-nums">
                  {progressPct}%
                </span>
              )}
            </div>
            <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={hasRealProgress ? progressPct : 60} aria-valuemin={0} aria-valuemax={100} aria-label="Maintenance progress">
              <motion.div
                className="bg-gradient-to-r from-red-800 to-red-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${hasRealProgress ? progressPct : 60}%` }}
                transition={prefersReducedMotion ? { duration: 0.3 } : { duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Live Status Feed (Phase 5) */}
        {showProgress && updates.length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? {} : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.95 }}
            className="w-full max-w-md mb-6"
          >
            <MaintenanceStatusFeed
              ruleId={rule.id}
              maxVisible={3}
              compact
              showLiveIndicator
            />
          </motion.div>
        )}

        {/* CTA / contact */}
        <motion.nav
          initial={prefersReducedMotion ? {} : { y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 1 }}
          className="flex flex-col sm:flex-row gap-3"
          aria-label="Maintenance actions"
        >
          {customCta && (
            <a
              href={customCta.href}
              className="inline-flex items-center justify-center gap-2 bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#8A1624] transition-colors"
            >
              {customCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          <a
            href="mailto:info@neemafoundationkilifi.org"
            className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-800 px-6 py-3 rounded-xl font-semibold text-sm border border-red-200 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </a>
        </motion.nav>
      </div>
    </motion.div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Compact countdown for degraded mode */
const CountdownCompact: React.FC<{ timeLeft: TimeLeft }> = ({ timeLeft }) => (
  <div
    className="flex items-center gap-2 text-xs font-medium text-gray-500"
    role="timer"
    aria-label={`Time remaining: ${timeLeft.days > 0 ? `${timeLeft.days} days ` : ''}${timeLeft.hours} hours ${timeLeft.minutes} minutes`}
  >
    <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
    <span className="tabular-nums" aria-hidden="true">
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  </div>
);

/** Compact progress indicator for degraded mode (Phase 5: real data) */
const ProgressBarCompact: React.FC<{ progressPct: number; label?: string }> = ({
  progressPct,
  label,
}) => (
  <div className="w-full max-w-xs" role="status" aria-label={`Progress: ${progressPct}% complete${label ? `. ${label}` : ''}`}>
    <div className="flex items-center justify-between mb-1">
      {label && (
        <span className="text-[11px] text-gray-500 truncate mr-2">{label}</span>
      )}
      <span className="text-[11px] font-bold text-gray-600 tabular-nums" aria-hidden="true">
        {progressPct}%
      </span>
    </div>
    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${
          progressPct >= 90
            ? 'from-emerald-500 to-emerald-400'
            : progressPct >= 50
              ? 'from-blue-500 to-blue-400'
              : 'from-amber-500 to-amber-400'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${progressPct || 0}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </div>
  </div>
);

/** Floating wrench particles from original Maintenance.tsx */
const FloatingParticles: React.FC = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: `${20 + Math.random() * 60}%`,
        left: `${10 + Math.random() * 80}%`,
        delay: Math.random() * 2,
        duration: 8 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-red-200"
          style={{ top: p.top, left: p.left }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        >
          <Wrench className="h-4 w-4 md:h-6 md:w-6" />
        </motion.div>
      ))}
    </div>
  );
};

export default MaintenancePlaceholder;
