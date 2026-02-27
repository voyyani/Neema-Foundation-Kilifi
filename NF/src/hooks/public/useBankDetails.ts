/**
 * useBankDetails — Public hook
 * Reads the `bank_details_public` secure view (RLS strips all encrypted
 * columns; only `is_public = true && status = 'active'` rows are visible
 * to anonymous users).
 *
 * Backed by React Query for transparent cache / stale-while-revalidate
 * behaviour — identical pattern to every other public hook in this project.
 */
import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type PaymentMethodType =
  | 'bank_transfer'
  | 'mpesa_paybill'
  | 'mpesa_till'
  | 'paypal'
  | 'stripe';

export interface PublicBankDetail {
  id:                   string;
  method_type:          PaymentMethodType;
  /** Admin-defined display label, e.g. "KCB Bank Account" */
  label:                string;
  // Bank transfer fields
  bank_name?:           string | null;
  account_name?:        string | null;
  account_number_mask?: string | null;  // "****1234"
  swift_code_mask?:     string | null;
  iban_mask?:           string | null;
  // M-Pesa fields
  paybill_number?:      string | null;
  till_number?:         string | null;
  // PayPal / Stripe
  paypal_email?:        string | null;
  // Shared
  instructions?:        string | null;
  sort_order:           number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBankDetails() {
  return useQuery<PublicBankDetail[]>({
    queryKey: ['public', 'bank-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_details_public')
        .select(
          'id, method_type, label, bank_name, account_name, account_number_mask, ' +
          'swift_code_mask, iban_mask, paybill_number, till_number, ' +
          'paypal_email, instructions, sort_order',
        )
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data as PublicBankDetail[]) ?? [];
    },
    staleTime:           10 * 60 * 1000, // 10 min cache
    gcTime:              30 * 60 * 1000, // 30 min GC
    refetchOnWindowFocus: false,
    retry:               2,
  });
}
