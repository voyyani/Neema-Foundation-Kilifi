import React from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

/**
 * Alert — a note written in the margin. Names the situation and, when
 * there is one, the way out. Status colour is the only colour it uses.
 */
export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  /** An action (Button or link) rendered after the message */
  action?: React.ReactNode;
  tone?: 'paper' | 'board';
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const paperStyles = {
  info: 'bg-surface-paper-2 border-border text-content-2 [&_svg]:text-content-3',
  success: 'bg-success-50 border-success-100 text-success-700',
  warning: 'bg-warning-50 border-warning-100 text-warning-700',
  danger: 'bg-danger-50 border-danger-100 text-danger-700',
};

const boardStyles = {
  info: 'bg-white/5 border-border-chalk text-content-chalk-2',
  success: 'bg-success-700/25 border-success-600/40 text-content-chalk',
  warning: 'bg-warning-600/25 border-warning-500/40 text-content-chalk',
  danger: 'bg-danger-700/30 border-danger-500/40 text-content-chalk',
};

const Alert: React.FC<AlertProps> = ({ status = 'info', title, action, tone = 'paper', className, children, ...rest }) => {
  const Icon = icons[status];
  const live = status === 'danger' || status === 'warning' ? 'assertive' : 'polite';
  return (
    <div
      role={status === 'danger' ? 'alert' : 'status'}
      aria-live={live}
      className={clsx(
        'flex gap-3 rounded-md border px-4 py-3 text-sm leading-6',
        tone === 'paper' ? paperStyles[status] : boardStyles[status],
        className,
      )}
      {...rest}
    >
      <Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && 'mt-0.5')}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
};

export default Alert;
