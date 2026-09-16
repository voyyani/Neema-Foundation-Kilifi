import { useEffect, useState } from 'react';

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const compute = (end: number): TimeLeft => {
  const total = Math.max(0, end - Date.now());
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
};

/**
 * Ticks once a second until `estimatedEnd` (ISO string) is reached.
 * Returns null when there is no valid end time.
 */
export function useCountdown(estimatedEnd: string | null | undefined): TimeLeft | null {
  const end = estimatedEnd ? new Date(estimatedEnd).getTime() : NaN;
  const valid = Number.isFinite(end);
  const [left, setLeft] = useState<TimeLeft | null>(() => (valid ? compute(end) : null));

  useEffect(() => {
    if (!valid) { setLeft(null); return; }
    setLeft(compute(end));
    const id = window.setInterval(() => {
      const next = compute(end);
      setLeft(next);
      if (next.total === 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [end, valid]);

  return valid ? left : null;
}

/** "2 days 4 hrs" / "35 min" / "under a minute" */
export function formatTimeLeft(t: TimeLeft): string {
  if (t.total === 0) return 'any moment now';
  if (t.days > 0) return `${t.days} day${t.days === 1 ? '' : 's'} ${t.hours} hr${t.hours === 1 ? '' : 's'}`;
  if (t.hours > 0) return `${t.hours} hr${t.hours === 1 ? '' : 's'} ${t.minutes} min`;
  if (t.minutes > 0) return `${t.minutes} min`;
  return 'under a minute';
}
