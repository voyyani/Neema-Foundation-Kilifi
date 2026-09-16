/**
 * MaintenanceFormNotice — the note above a form that staff have paused.
 * Names what is paused, in the words the rule was written with, and when
 * it is expected back. Renders nothing when there is no rule.
 */
import React from 'react';
import { Clock } from 'lucide-react';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { Alert } from '../ui';
import { formatTimeLeft, useCountdown } from './useCountdown';

const MaintenanceFormNotice: React.FC<{ rule: ActiveMaintenanceRule | null; tone?: 'paper' | 'board'; className?: string }> = ({ rule, tone = 'paper', className }) => {
  const showCountdown = (rule?.display_config as { show_countdown?: boolean } | undefined)?.show_countdown === true;
  const left = useCountdown(showCountdown && rule ? rule.estimated_end : null);
  if (!rule) return null;
  const paused = rule.severity !== 'notice';
  return (
    <Alert status={paused ? 'warning' : 'info'} title={rule.title} tone={tone} className={className}>
      {rule.message && <p>{rule.message}</p>}
      {paused && <p className={rule.message ? 'mt-1' : undefined}>This form is paused until the work is done.</p>}
      {left && (
        <p className="mt-1 inline-flex items-center gap-1.5 tabular">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Expected back in {formatTimeLeft(left)}
        </p>
      )}
    </Alert>
  );
};

export default MaintenanceFormNotice;
