import React from 'react';
import clsx from 'clsx';
import { Tick } from '../ui';

/**
 * RuledList — numbered entries on ruled lines: a title, a body, and an
 * optional list of specifics with the teacher's tick. The shape every
 * giving page's options are written in.
 */
export interface RuledEntry {
  title: React.ReactNode;
  body?: React.ReactNode;
  items?: string[];
  /** Right-aligned detail beside the title (a price, a duration) */
  detail?: React.ReactNode;
  action?: React.ReactNode;
}

const RuledList: React.FC<{ entries: RuledEntry[]; tone?: 'paper' | 'board'; columns?: 1 | 2; className?: string }> = ({ entries, tone = 'paper', columns = 1, className }) => {
  const onBoard = tone === 'board';
  const rule = onBoard ? 'border-border-chalk' : 'border-border-rule';
  return (
    <ol className={clsx('grid gap-x-10', columns === 2 && 'md:grid-cols-2', className)}>
      {entries.map((e, i) => (
        <li key={i} className={clsx('grid grid-cols-[2.5rem_1fr] gap-x-3 border-t py-5', rule)}>
          <span className={clsx('font-display tabular text-display-sm', onBoard ? 'text-brand-300' : 'text-brand-600')} aria-hidden="true">{i + 1}.</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className={clsx('font-display uppercase text-display-sm', onBoard ? 'text-content-chalk' : 'text-content')}>{e.title}</h3>
              {e.detail && <span className={clsx('tabular text-sm font-semibold', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>{e.detail}</span>}
            </div>
            {e.body && <p className={clsx('mt-1 max-w-measure text-base leading-7', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>{e.body}</p>}
            {e.items && e.items.length > 0 && (
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {e.items.map((it) => (
                  <li key={it} className={clsx('flex items-start gap-2 text-sm leading-6', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>
                    <Tick className="mt-0.5 h-4 w-4 shrink-0" tone={tone} drawn={false} />{it}
                  </li>
                ))}
              </ul>
            )}
            {e.action && <div className="mt-4">{e.action}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default RuledList;
