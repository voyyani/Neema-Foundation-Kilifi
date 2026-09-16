/**
 * MaintenancePlaceholder — what a visitor sees where a section or page is
 * under maintenance. Three modes by severity:
 *
 *  - notice     a note in the margin above the real content
 *  - degraded   a ruled card in place of the section, with countdown
 *  - full_block a full page: the chalkboard, the message, the countdown,
 *               the live status feed, and a way to give or contact us
 *
 * Copy comes from the rule the staff wrote; nothing here invents a status.
 */
import React, { Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Wrench } from 'lucide-react';
import clsx from 'clsx';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { useMaintenanceStatusFeed } from '../../hooks/public/useMaintenanceStatusFeed';
import { Alert, Button, Container, Section } from '../ui';
import { formatTimeLeft, useCountdown } from './useCountdown';

const MaintenanceStatusFeed = React.lazy(() => import('./MaintenanceStatusFeed'));

export interface MaintenancePlaceholderProps {
  /** The active rule driving this placeholder */
  rule: ActiveMaintenanceRule;
  /** Rendered below a notice-level placeholder */
  children?: React.ReactNode;
  /** Override minimum height (defaults to display_config.placeholder_height) */
  minHeight?: string;
  className?: string;
}

type Config = {
  show_countdown?: boolean;
  show_progress?: boolean;
  custom_cta?: { label: string; href: string };
  placeholder_height?: string;
};

const CountdownLine: React.FC<{ estimatedEnd: string | null; tone?: 'paper' | 'board' }> = ({ estimatedEnd, tone = 'paper' }) => {
  const left = useCountdown(estimatedEnd);
  if (!left) return null;
  const when = new Date(estimatedEnd!).toLocaleString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <p role="timer" aria-live="off" className={clsx('flex items-center gap-2 text-sm tabular', tone === 'board' ? 'text-content-chalk-2' : 'text-content-3')}>
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Expected back in <strong className={tone === 'board' ? 'text-content-chalk' : 'text-content'}>{formatTimeLeft(left)}</strong> · {when}</span>
    </p>
  );
};

const ProgressLine: React.FC<{ pct: number; label?: string; tone?: 'paper' | 'board' }> = ({ pct, label, tone = 'paper' }) => (
  <div className="w-full max-w-sm" role="status" aria-label={`Progress: ${pct}% complete${label ? `. ${label}` : ''}`}>
    <div className={clsx('flex items-baseline justify-between text-sm', tone === 'board' ? 'text-content-chalk-2' : 'text-content-3')}>
      <span className="truncate">{label ?? 'Work in progress'}</span>
      <span className="tabular font-semibold">{pct}%</span>
    </div>
    <div className={clsx('mt-1.5 h-1.5 overflow-hidden rounded-full', tone === 'board' ? 'bg-white/10' : 'bg-surface-paper-3')}>
      <div className="h-full rounded-full bg-brand-600 transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

const MaintenancePlaceholder: React.FC<MaintenancePlaceholderProps> = ({ rule, children, minHeight, className }) => {
  const config = (rule.display_config ?? {}) as Config;
  const showCountdown = config.show_countdown === true;
  const showProgress = config.show_progress === true;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feed = useMaintenanceStatusFeed(rule.severity === 'full_block' ? rule.id : null);
  const pct = feed.latestProgress != null ? Math.round(feed.latestProgress) : null;

  useEffect(() => {
    if (rule.severity === 'full_block') headingRef.current?.focus();
  }, [rule.severity]);

  // ── notice ───────────────────────────────────────────────────────────────
  if (rule.severity === 'notice') {
    return (
      <>
        <div className={clsx('py-3', className)} style={{ paddingLeft: 'calc(var(--rail) + var(--rail-gap))', paddingRight: 'var(--gutter)' }}>
          <Alert status="warning" title={rule.title}>
            {rule.message}
            {showCountdown && rule.estimated_end && <div className="mt-1"><CountdownLine estimatedEnd={rule.estimated_end} /></div>}
          </Alert>
        </div>
        {children}
      </>
    );
  }

  // ── degraded ─────────────────────────────────────────────────────────────
  if (rule.severity === 'degraded') {
    return (
      <Section ground="ruled-faint" pad="md" className={className} aria-label={`${rule.title}: this section is temporarily unavailable`} role="region" style={{ minHeight: minHeight ?? config.placeholder_height }}>
        <Container>
          <div className="flex max-w-measure flex-col gap-4">
            <Wrench className="h-6 w-6 text-brand-600" aria-hidden="true" />
            <h3 ref={headingRef} tabIndex={-1} className="font-display uppercase text-display-sm text-content outline-none">{rule.title}</h3>
            {rule.message && <p className="text-base leading-7 text-content-2">{rule.message}</p>}
            {showCountdown && <CountdownLine estimatedEnd={rule.estimated_end} />}
            {config.custom_cta && <Button href={config.custom_cta.href} variant="secondary" size="sm" className="self-start">{config.custom_cta.label}</Button>}
          </div>
        </Container>
      </Section>
    );
  }

  // ── full_block ───────────────────────────────────────────────────────────
  return (
    <Section ground="board" pad="lg" as="div" role="main" className={clsx('flex-1', className)} style={{ minHeight: minHeight ?? config.placeholder_height ?? '70vh' }}>
      <p className="sr-only" role="alert" aria-live="assertive">
        This page is under maintenance. {rule.title}. {rule.message ?? ''}
      </p>
      <Container>
        <div className="grid gap-rule md:grid-cols-12">
          <div className="md:col-span-7">
            <Wrench className="mb-6 h-8 w-8 text-brand-300" aria-hidden="true" />
            <h1 ref={headingRef} tabIndex={-1} className="font-display uppercase text-display-lg text-content-chalk outline-none">
              {rule.title || 'Under maintenance'}
            </h1>
            {rule.message && <p className="mt-4 max-w-measure text-lg leading-8 text-content-chalk-2">{rule.message}</p>}
            <div className="mt-rule flex flex-col gap-4">
              {showCountdown && <CountdownLine estimatedEnd={rule.estimated_end} tone="board" />}
              {showProgress && pct != null && <ProgressLine pct={pct} label={feed.latestUpdate?.title} tone="board" />}
            </div>
            <div className="mt-rule flex flex-wrap gap-3">
              {config.custom_cta ? (
                <Button href={config.custom_cta.href} tone="board">{config.custom_cta.label}</Button>
              ) : (
                <Button to="/donate" tone="board">Give to the Foundation</Button>
              )}
              <Button to="/" tone="board" variant="secondary">Back to the home page</Button>
            </div>
          </div>
          <div className="md:col-span-5">
            <Suspense fallback={null}>
              <MaintenanceStatusFeed ruleId={rule.id} maxVisible={4} showLiveIndicator />
            </Suspense>
            <p className="mt-6 text-sm text-content-chalk-3">
              Need something urgently? <Link to="/#contact" className="text-content-chalk-2 underline underline-offset-4 hover:text-content-chalk">Contact the office</Link>.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default MaintenancePlaceholder;
