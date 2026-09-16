/**
 * PaymentMethods — every way to give that the office has published, with
 * the details written out and copyable. Shared by /donate and
 * /bank-details. Numbers are masked server-side where the office chose
 * to mask them; the component never invents a detail.
 */
import React from 'react';
import { Check, Copy } from 'lucide-react';
import clsx from 'clsx';
import type { PublicBankDetail } from '../../hooks/public/useBankDetails';
import { Alert, Button } from '../ui';
import { METHOD_META, buildRows, type DetailRow } from './methodRows';
import { useCopy } from './useCopy';

const Row: React.FC<{ row: DetailRow; copied: string | null; onCopy: (v: string, k: string) => void }> = ({ row, copied, onCopy }) => {
  const isCopied = copied === row.key;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border-rule py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-content-3">{row.label}</p>
        <p className="font-display text-xl font-bold tabular tracking-tight text-content">{row.value}</p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(row.value, row.key)}
        aria-label={isCopied ? `${row.label} copied` : `Copy ${row.label}`}
        className={clsx(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded border px-2.5 text-xs font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none',
          isCopied ? 'border-success-100 bg-success-50 text-success-700' : 'border-border text-content-2 hover:border-content hover:text-content',
        )}
      >
        {isCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        {isCopied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export const PaymentMethod: React.FC<{ detail: PublicBankDetail; amount?: number | null; open?: boolean }> = ({ detail, amount, open = true }) => {
  const meta = METHOD_META[detail.method_type] ?? METHOD_META.stripe;
  const Icon = meta.icon;
  const rows = buildRows(detail);
  const { copied, copy } = useCopy();
  return (
    <details open={open} className="group border-t-2 border-content py-4">
      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        <Icon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-display uppercase text-display-sm text-content">{detail.label || meta.name}</span>
          <span className="block text-sm text-content-3">{meta.audience}</span>
        </span>
        <span className="text-sm font-medium text-content-3 group-open:hidden">Show</span>
        <span className="hidden text-sm font-medium text-content-3 group-open:inline">Hide</span>
      </summary>
      <div className="mt-3">
        {rows.length > 0 && rows.map((r) => <Row key={r.key} row={r} copied={copied} onCopy={copy} />)}
        {amount && detail.method_type.startsWith('mpesa') && (
          <p className="mt-3 rounded bg-surface-paper-2 px-3 py-2 text-sm text-content-2">
            Enter <strong className="tabular text-content">KES {amount.toLocaleString('en-KE')}</strong> as the amount when M-Pesa asks.
          </p>
        )}
        {detail.instructions && <p className="mt-3 max-w-measure text-sm leading-6 text-content-2">{detail.instructions}</p>}
        {detail.method_type === 'stripe' && detail.instructions && (
          <Button href={detail.instructions} target="_blank" rel="noopener noreferrer" size="sm" className="mt-3">Give online</Button>
        )}
      </div>
    </details>
  );
};

export const PaymentMethodsList: React.FC<{
  details: PublicBankDetail[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  amount?: number | null;
  openAll?: boolean;
}> = ({ details, isLoading, isError, onRetry, amount, openAll = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading ways to give">
        {[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded bg-surface-paper-3" />)}
      </div>
    );
  }
  if (isError) {
    return (
      <Alert status="danger" title="The giving details could not be loaded." action={onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button>}>
        Check your connection, or contact the office for the Paybill and bank details.
      </Alert>
    );
  }
  const list = (details ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  if (list.length === 0) {
    return <Alert status="info" title="Giving details are being updated.">Contact the office and they will send you the Paybill and bank details directly.</Alert>;
  }
  return (
    <div>
      {list.map((d, i) => <PaymentMethod key={d.id} detail={d} amount={amount} open={openAll || i === 0} />)}
    </div>
  );
};
