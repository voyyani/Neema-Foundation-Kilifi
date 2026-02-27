/**
 * PaymentMethodBadge
 * Color-coded badge for each PaymentMethodType.
 * Uses the canonical color map from src/admin/types/bank.ts.
 */

import { motion } from 'framer-motion';
import {
  Building2,
  Smartphone,
  Globe,
  CreditCard,
} from 'lucide-react';
import {
  PAYMENT_METHOD_FIELDS,
  PAYMENT_METHOD_COLORS,
  type PaymentMethodType,
} from '../../types/bank';

interface PaymentMethodBadgeProps {
  type: PaymentMethodType;
  /** When true the icon is omitted — useful in dense table cells. */
  compact?: boolean;
  className?: string;
}

const METHOD_ICONS: Record<PaymentMethodType, React.ReactNode> = {
  bank_transfer: <Building2 className="w-3 h-3" />,
  mpesa_paybill: <Smartphone className="w-3 h-3" />,
  mpesa_till:    <Smartphone className="w-3 h-3" />,
  paypal:        <Globe className="w-3 h-3" />,
  stripe:        <CreditCard className="w-3 h-3" />,
};

export function PaymentMethodBadge({
  type,
  compact = false,
  className = '',
}: PaymentMethodBadgeProps) {
  const colors = PAYMENT_METHOD_COLORS[type];
  const label  = PAYMENT_METHOD_FIELDS[type].label;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className,
      ].join(' ')}
    >
      {!compact && METHOD_ICONS[type]}
      {label}
    </motion.span>
  );
}
