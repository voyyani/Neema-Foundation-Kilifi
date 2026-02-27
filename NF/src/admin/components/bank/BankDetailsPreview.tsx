/**
 * BankDetailsPreview
 * Renders a live card preview that mirrors the appearance of the public
 * /bank-details page. Used inside the form modal so admins can see exactly
 * what donors will see before saving.
 */

import { Building2, Smartphone, Globe, CreditCard, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BankDetailFormData, PaymentMethodType } from '../../types/bank';

// ---------------------------------------------------------------------------
// Icon per method type
// ---------------------------------------------------------------------------

const METHOD_ICONS: Record<PaymentMethodType, React.ReactNode> = {
  bank_transfer: <Building2 className="w-5 h-5" />,
  mpesa_paybill: <Smartphone className="w-5 h-5" />,
  mpesa_till:    <Smartphone className="w-5 h-5" />,
  paypal:        <Globe className="w-5 h-5" />,
  stripe:        <CreditCard className="w-5 h-5" />,
};

const METHOD_COLORS: Record<PaymentMethodType, { bg: string; icon: string; accent: string }> = {
  bank_transfer: { bg: 'bg-blue-50',    icon: 'text-blue-600',    accent: 'border-blue-200' },
  mpesa_paybill: { bg: 'bg-green-50',   icon: 'text-green-600',   accent: 'border-green-200' },
  mpesa_till:    { bg: 'bg-emerald-50', icon: 'text-emerald-600', accent: 'border-emerald-200' },
  paypal:        { bg: 'bg-sky-50',     icon: 'text-sky-600',     accent: 'border-sky-200' },
  stripe:        { bg: 'bg-violet-50',  icon: 'text-violet-600',  accent: 'border-violet-200' },
};

// ---------------------------------------------------------------------------
// Row renderer
// ---------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
      <span className="w-36 text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 font-mono">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BankDetailsPreviewProps {
  /** Partial form data from the currently open form. */
  data: Partial<BankDetailFormData>;
  /** When true shows as a compact inline card (inside modal sidebar). */
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BankDetailsPreview({ data, compact = false }: BankDetailsPreviewProps) {
  const method  = data.method_type ?? 'bank_transfer';
  const colors  = METHOD_COLORS[method];
  const label   = data.label || 'Payment Method';

  const isEmpty = !data.method_type && !data.label;

  return (
    <div className={compact ? '' : 'space-y-3'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-gray-400" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Live Preview
          </p>
          {!data.is_public && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             bg-gray-100 text-gray-500 text-xs">
              <EyeOff className="w-3 h-3" />
              Hidden from public
            </span>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border-2 border-dashed border-gray-200 p-6
                       flex items-center justify-center text-gray-400 text-sm"
          >
            Start filling in the form to see a preview
          </motion.div>
        ) : (
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={[
              'rounded-xl border p-5 space-y-4',
              colors.bg,
              colors.accent,
            ].join(' ')}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={['w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm', colors.icon].join(' ')}>
                {METHOD_ICONS[method]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 leading-tight">{label}</h3>
                {data.bank_name && (
                  <p className="text-xs text-gray-500">{data.bank_name}</p>
                )}
              </div>
            </div>

            {/* Fields per method */}
            <div className="space-y-1.5">
              {method === 'bank_transfer' && (
                <>
                  <DetailRow label="Account Name"   value={data.account_name} />
                  <DetailRow label="Account No."    value={data.account_number ? '••••' + data.account_number.slice(-4) : undefined} />
                  <DetailRow label="SWIFT / BIC"    value={data.swift_code ? '••••' + data.swift_code.slice(-4) : undefined} />
                  <DetailRow label="IBAN"           value={data.iban ? '••••' + data.iban.slice(-4) : undefined} />
                </>
              )}

              {method === 'mpesa_paybill' && (
                <>
                  <DetailRow label="Paybill Number" value={data.paybill_number} />
                  <DetailRow label="Account Name"   value={data.account_name} />
                </>
              )}

              {method === 'mpesa_till' && (
                <>
                  <DetailRow label="Till Number"    value={data.till_number} />
                  <DetailRow label="Account Name"   value={data.account_name} />
                </>
              )}

              {method === 'paypal' && (
                <DetailRow label="PayPal Email" value={data.paypal_email} />
              )}

              {method === 'stripe' && (
                <p className="text-sm text-gray-600 italic">
                  Stripe checkout — link in instructions
                </p>
              )}
            </div>

            {/* Instructions */}
            {data.instructions && (
              <p className="text-xs text-gray-600 border-t border-black/5 pt-3">
                {data.instructions}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
