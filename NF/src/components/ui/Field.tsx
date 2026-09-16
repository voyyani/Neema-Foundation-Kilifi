import React, { useId } from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';

/**
 * Form fields: Input, Textarea, Select, and the Field wrapper they share.
 *
 * A field is a ruled line on the page: a single bottom rule in the blue
 * feint colour that turns ink-black on focus and maroon when the answer is
 * wrong. Labels sit above in Inter; errors name the problem in plain words.
 */

export interface FieldProps {
  label: string;
  /** Rendered under the label, before the control */
  hint?: string;
  error?: string;
  required?: boolean;
  optionalText?: string;
  /** Tone follows the surface the form sits on */
  tone?: 'paper' | 'board';
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label, hint, error, required, optionalText = 'optional', tone = 'paper', className, children,
}) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const onBoard = tone === 'board';
  return (
    <div className={clsx('group/field', className)}>
      <label
        htmlFor={id}
        className={clsx('block text-sm font-semibold mb-1.5', onBoard ? 'text-content-chalk' : 'text-content')}
      >
        {label}
        {!required && (
          <span className={clsx('ml-1.5 font-normal', onBoard ? 'text-content-chalk-3' : 'text-content-3')}>
            ({optionalText})
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className={clsx('text-sm mb-1.5', onBoard ? 'text-content-chalk-2' : 'text-content-3')}>
          {hint}
        </p>
      )}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const controlBase = (tone: 'paper' | 'board', invalid: boolean) =>
  clsx(
    'w-full rounded-none border-0 border-b-2 bg-transparent px-0 py-2.5 text-base leading-6 transition-colors duration-200',
    'focus:outline-none focus:ring-0 placeholder:text-content-4',
    tone === 'paper'
      ? 'text-content border-border-rule focus:border-content'
      : 'text-content-chalk border-content-chalk/30 focus:border-content-chalk placeholder:text-content-chalk-3',
    invalid && '!border-danger-600',
  );

type ControlProps = { tone?: 'paper' | 'board'; invalid?: boolean; className?: string };

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & ControlProps>(
  function Input({ tone = 'paper', invalid = false, className, ...rest }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={clsx(controlBase(tone, invalid), className)} {...rest} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps>(
  function Textarea({ tone = 'paper', invalid = false, className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={clsx(controlBase(tone, invalid), 'resize-y min-h-[6rem]', className)}
        {...rest}
      />
    );
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & ControlProps>(
  function Select({ tone = 'paper', invalid = false, className, children, ...rest }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={clsx(controlBase(tone, invalid), 'appearance-none pr-8 cursor-pointer', className)}
          {...rest}
        >
          {children}
        </select>
        <svg
          className={clsx('pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2', tone === 'paper' ? 'text-content-3' : 'text-content-chalk-2')}
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  },
);
