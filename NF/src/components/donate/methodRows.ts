import type React from 'react';
import { Building2, Globe, Smartphone } from 'lucide-react';
import type { PaymentMethodType, PublicBankDetail } from '../../hooks/public/useBankDetails';

export interface DetailRow { label: string; value: string; key: string }

export function buildRows(d: PublicBankDetail): DetailRow[] {
  const rows: DetailRow[] = [];
  const push = (label: string, value: string | null | undefined, key: string) => {
    if (value && value.trim()) rows.push({ label, value: value.trim(), key: `${d.id}-${key}` });
  };
  switch (d.method_type) {
    case 'bank_transfer':
      push('Bank', d.bank_name, 'bank');
      push('Account name', d.account_name, 'account_name');
      push('Account number', d.account_number_mask, 'account_number');
      push('SWIFT / BIC', d.swift_code_mask, 'swift');
      push('IBAN', d.iban_mask, 'iban');
      break;
    case 'mpesa_paybill':
      push('Paybill number', d.paybill_number, 'paybill');
      push('Account number', d.account_name, 'account');
      break;
    case 'mpesa_till':
      push('Till number', d.till_number, 'till');
      push('Account name', d.account_name, 'account_name');
      break;
    case 'paypal':
      push('PayPal email', d.paypal_email, 'paypal');
      break;
    default:
      break;
  }
  return rows;
}

export const METHOD_META: Record<PaymentMethodType, { icon: React.ElementType; name: string; audience: string }> = {
  mpesa_paybill: { icon: Smartphone, name: 'M-Pesa Paybill', audience: 'From any Safaricom line in Kenya' },
  mpesa_till: { icon: Smartphone, name: 'M-Pesa Till', audience: 'Lipa na M-Pesa · Buy Goods' },
  bank_transfer: { icon: Building2, name: 'Bank transfer', audience: 'Local and international transfers' },
  paypal: { icon: Globe, name: 'PayPal', audience: 'Cards and PayPal balances worldwide' },
  stripe: { icon: Globe, name: 'Online', audience: 'Card payments' },
};
