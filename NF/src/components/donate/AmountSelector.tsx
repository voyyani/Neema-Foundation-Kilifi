/**
 * AmountSelector — choose a gift, written like a pledge line. Today the
 * choice fills in the M-Pesa instructions beneath; in Phase 4 it feeds
 * STK Push without the layout changing. What each amount does is the
 * Foundation's own costing, or nothing at all: no invented equivalences.
 */
import React from 'react';
import clsx from 'clsx';
import { Field, Input } from '../ui';

export const PRESETS = [500, 1000, 2000, 5000, 10000, 20000] as const;

export interface AmountSelectorProps {
  amount: number | null;
  onChange: (amount: number | null) => void;
  frequency: 'once' | 'monthly';
  onFrequencyChange: (f: 'once' | 'monthly') => void;
  tone?: 'paper' | 'board';
}

const AmountSelector: React.FC<AmountSelectorProps> = ({ amount, onChange, frequency, onFrequencyChange, tone = 'paper' }) => {
  const [custom, setCustom] = React.useState('');
  const onBoard = tone === 'board';
  const isPreset = amount !== null && (PRESETS as readonly number[]).includes(amount);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className={clsx('mb-3 text-sm font-semibold', onBoard ? 'text-content-chalk' : 'text-content')}>How often</legend>
        <div className={clsx('inline-flex rounded border p-1', onBoard ? 'border-border-chalk' : 'border-border-strong')} role="radiogroup">
          {(['once', 'monthly'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={frequency === f}
              onClick={() => onFrequencyChange(f)}
              className={clsx(
                'h-9 rounded px-4 text-sm font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none',
                frequency === f
                  ? 'bg-brand-600 text-white'
                  : onBoard ? 'text-content-chalk-2 hover:text-content-chalk' : 'text-content-2 hover:text-content',
              )}
            >
              {f === 'once' ? 'One gift' : 'Every month'}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={clsx('mb-3 text-sm font-semibold', onBoard ? 'text-content-chalk' : 'text-content')}>Amount (KES)</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup">
          {PRESETS.map((p) => {
            const active = amount === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => { onChange(p); setCustom(''); }}
                className={clsx(
                  'h-12 rounded border font-display text-lg font-bold tabular transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none',
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : onBoard
                      ? 'border-border-chalk text-content-chalk hover:border-content-chalk'
                      : 'border-border-strong bg-white text-content hover:border-content',
                )}
              >
                {p.toLocaleString('en-KE')}
              </button>
            );
          })}
        </div>
        <div className="mt-4 max-w-xs">
          <Field label="Or another amount" tone={tone} optionalText="KES">
            {({ id }) => (
              <Input
                id={id}
                tone={tone}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 1,500"
                value={custom}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^\d]/g, '');
                  setCustom(digits);
                  onChange(digits ? Number(digits) : null);
                }}
                aria-describedby={`${id}-note`}
              />
            )}
          </Field>
          <p id="amount-note" className={clsx('mt-1.5 text-xs', onBoard ? 'text-content-chalk-3' : 'text-content-3')}>
            {amount ? (
              <>You chose <strong className="tabular">KES {amount.toLocaleString('en-KE')}</strong>{frequency === 'monthly' ? ' every month' : ''}{isPreset ? '' : ' (your own amount)'}.</>
            ) : (
              'Any amount helps; choose one to see it written into the instructions below.'
            )}
          </p>
        </div>
      </fieldset>
    </div>
  );
};

export default AmountSelector;
