import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useReducedMotionPref } from '../../lib/motion';

/**
 * Tally — a figure the Foundation can stand behind, written the way a
 * count is kept on the classroom board: the number, then what it counts,
 * over what period, in which programme. A figure never stands alone.
 *
 *   <Tally value="650+" unit="children" period="every school day" subject="Ahoho Mission" />
 *
 * Numeric values count up when they scroll into view (once, ease-out);
 * reduced motion shows the final value immediately.
 */
export interface TallyProps {
  value: string | number;
  unit: React.ReactNode;
  period?: React.ReactNode;
  subject?: React.ReactNode;
  tone?: 'paper' | 'board';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
  /** Draw the five-bar tally marks beside the figure */
  marks?: boolean;
  /** Skip the count-up (years, codes) */
  static?: boolean;
}

const parse = (v: string | number) => {
  const s = String(v);
  const m = s.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  const n = Number(m[2].replace(/,/g, ''));
  if (Number.isNaN(n)) return null;
  return { prefix: m[1], n, suffix: m[3], decimals: (m[2].split('.')[1] || '').length, grouped: m[2].includes(',') };
};

const useCountUp = (target: number, active: boolean, duration = 1200) => {
  const [n, setN] = useState(active ? 0 : target);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return n;
};

const TallyMarks: React.FC<{ tone: 'paper' | 'board' }> = ({ tone }) => (
  <svg
    viewBox="0 0 40 28"
    className={clsx('h-7 w-10 shrink-0', tone === 'board' ? 'text-content-chalk' : 'text-brand-600')}
    aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"
  >
    <path d="M6 4v20M13 3.5v20M20 4.5v19M27 3.5v20" />
    <path d="M2 21L33 8" />
  </svg>
);

const Tally: React.FC<TallyProps> = ({ value, unit, period, subject, tone = 'paper', size = 'lg', className, marks = false, static: isStatic = false }) => {
  const reduce = useReducedMotionPref();
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const parsed = parse(value);

  useEffect(() => {
    if (reduce || isStatic || !parsed || seen) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, isStatic, parsed, seen]);

  const animate = Boolean(parsed) && !reduce && !isStatic;
  const current = useCountUp(parsed?.n ?? 0, animate && seen);
  const shown = parsed
    ? `${parsed.prefix}${(animate ? current : parsed.n).toLocaleString('en-KE', {
        minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals, useGrouping: parsed.grouped,
      })}${parsed.suffix}`
    : String(value);

  const onBoard = tone === 'board';
  return (
    <div ref={ref} className={clsx('flex items-start gap-3', className)}>
      {marks && <TallyMarks tone={tone} />}
      <div className="min-w-0">
        <div
          className={clsx(
            'font-display tabular leading-none',
            onBoard && 'chalk',
            size === 'xl' && 'text-display-xl',
            size === 'lg' && 'text-display-lg',
            size === 'md' && 'text-display-md',
            onBoard ? 'text-content-chalk' : 'text-content',
          )}
          aria-label={`${value} ${typeof unit === 'string' ? unit : ''}`.trim()}
        >
          <span aria-hidden="true">{shown}</span>
        </div>
        <div className={clsx('mt-2 text-sm leading-5', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>
          <span className="font-semibold">{unit}</span>
          {period && <span className={onBoard ? 'text-content-chalk-3' : 'text-content-3'}> · {period}</span>}
          {subject && <span className={clsx('block', onBoard ? 'text-content-chalk-3' : 'text-content-3')}>{subject}</span>}
        </div>
      </div>
    </div>
  );
};

export default Tally;
