/**
 * BankDetailsForm
 * Create / edit form for a single payment method entry.
 *
 * Features:
 *  - Renders only the fields relevant to the selected `method_type` (conditional fields).
 *  - Sensitive fields (account number, SWIFT, IBAN) use the `SensitiveField` input component.
 *  - Full zod validation with per-field inline error messages.
 *  - In edit mode, existing masked values are shown via `SensitiveField` in "masked" display mode.
 *  - Live preview card updates as the user types (provided by the parent via `onPreviewChange`).
 */

import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Info } from 'lucide-react';
import {
  PAYMENT_METHOD_FIELDS,
  type PaymentMethodType,
  type BankDetail,
  type BankDetailFormData,
} from '../../types/bank';
import { SensitiveField } from './SensitiveField';
import { PaymentMethodBadge } from './PaymentMethodBadge';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const bankDetailSchema = z.object({
  method_type: z.enum([
    'bank_transfer',
    'mpesa_paybill',
    'mpesa_till',
    'paypal',
    'stripe',
  ]),
  label:           z.string().min(2, 'Label must be at least 2 characters').max(80, 'Label too long'),
  bank_name:       z.string().max(120).optional().or(z.literal('')),
  account_name:    z.string().max(120).optional().or(z.literal('')),
  account_number:  z.string().max(34, 'Too long (max 34 chars)').optional().or(z.literal('')),
  swift_code:      z.string().max(11, 'SWIFT code is max 11 chars').optional().or(z.literal('')),
  iban:            z.string().max(34, 'IBAN is max 34 chars').optional().or(z.literal('')),
  paybill_number:  z.string().max(20).optional().or(z.literal('')),
  till_number:     z.string().max(20).optional().or(z.literal('')),
  paypal_email:    z.string().email('Must be a valid email').optional().or(z.literal('')),
  instructions:    z.string().max(1000, 'Instructions too long (max 1000 chars)').optional().or(z.literal('')),
  is_public:       z.boolean(),
  sort_order:      z.number().int().min(0),
});

type BankDetailSchema = z.infer<typeof bankDetailSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BankDetailsFormProps {
  /** When provided, populates form for editing. */
  existing?: BankDetail;
  onSubmit: (data: BankDetailFormData) => Promise<void>;
  onCancel: () => void;
  /** Called on every render to keep a live preview in sync. */
  onPreviewChange?: (data: Partial<BankDetailFormData>) => void;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Field-group helpers
// ---------------------------------------------------------------------------

const PAYMENT_METHODS: PaymentMethodType[] = [
  'bank_transfer',
  'mpesa_paybill',
  'mpesa_till',
  'paypal',
  'stripe',
];

function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function InputField({
  id,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      id={id}
      {...props}
      className={[
        'w-full px-4 py-3 sm:py-2.5 border rounded-xl text-base sm:text-sm min-h-[44px]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:bg-gray-50 disabled:text-gray-500',
        error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200',
        props.className ?? '',
      ].join(' ')}
    />
  );
}

function TextareaField({
  id,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      id={id}
      rows={3}
      {...props}
      className={[
        'w-full px-4 py-3 sm:py-2.5 border rounded-xl text-base sm:text-sm resize-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:bg-gray-50 disabled:text-gray-500',
        error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
        props.className ?? '',
      ].join(' ')}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BankDetailsForm({
  existing,
  onSubmit,
  onCancel,
  onPreviewChange,
  isLoading = false,
}: BankDetailsFormProps) {
  const isEditing = !!existing;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BankDetailSchema>({
    resolver: zodResolver(bankDetailSchema),
    defaultValues: {
      method_type:    (existing?.method_type ?? 'bank_transfer') as PaymentMethodType,
      label:          existing?.label          ?? '',
      bank_name:      existing?.bank_name      ?? '',
      account_name:   existing?.account_name   ?? '',
      account_number: '',
      swift_code:     '',
      iban:           '',
      paybill_number: existing?.paybill_number ?? '',
      till_number:    existing?.till_number    ?? '',
      paypal_email:   existing?.paypal_email   ?? '',
      instructions:   existing?.instructions   ?? '',
      is_public:      existing?.is_public      ?? true,
      sort_order:     existing?.sort_order     ?? 0,
    },
  });

  // Selected method drives which field groups appear
  const methodType  = useWatch({ control, name: 'method_type' });
  const allValues   = watch();

  // Push values to parent for live preview
  useEffect(() => {
    onPreviewChange?.(allValues as Partial<BankDetailFormData>);
  }, [allValues, onPreviewChange]);

  const cfg = PAYMENT_METHOD_FIELDS[methodType];

  const handleFormSubmit = async (data: BankDetailSchema) => {
    await onSubmit(data as BankDetailFormData);
  };

  const isSaving = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>

      {/* ── Method type selector ────────────────────────────────────────── */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method<span className="text-red-500 ml-1">*</span>
        </p>
        <Controller
          name="method_type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => field.onChange(method)}
                  disabled={isEditing}   // method_type is immutable after creation
                  className={[
                    'flex items-center justify-center p-3 rounded-xl border-2 min-h-[52px]',
                    'text-sm font-medium transition-all tap-scale',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    field.value === method
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <PaymentMethodBadge type={method} compact />
                </button>
              ))}
            </div>
          )}
        />
        {isEditing && (
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <Info className="w-3 h-3" />
            Payment method type cannot be changed after creation.
          </p>
        )}
        {errors.method_type && (
          <p className="mt-1 text-xs text-red-600">{errors.method_type.message}</p>
        )}
      </div>

      {/* ── Display label ────────────────────────────────────────────────── */}
      <FormField
        label="Display Label"
        htmlFor="label"
        error={errors.label?.message}
        required
        hint={`Shown on the public donation page, e.g. "${cfg.label} — Neema Foundation"`}
      >
        <InputField
          id="label"
          {...register('label')}
          placeholder={`e.g. ${cfg.label} — Neema Foundation`}
          disabled={isSaving}
          error={errors.label?.message}
        />
      </FormField>

      {/* ══ Bank Transfer fields ═══════════════════════════════════════════ */}
      {methodType === 'bank_transfer' && (
        <motion.div
          key="bank_transfer"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-gray-100"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Bank Transfer Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Bank Name"
              htmlFor="bank_name"
              error={errors.bank_name?.message}
              hint="e.g. KCB Bank Kenya"
            >
              <InputField
                id="bank_name"
                {...register('bank_name')}
                placeholder="KCB Bank Kenya"
                disabled={isSaving}
                error={errors.bank_name?.message}
              />
            </FormField>

            <FormField
              label="Account Name"
              htmlFor="account_name"
              error={errors.account_name?.message}
              hint="The registered name on the account"
            >
              <InputField
                id="account_name"
                {...register('account_name')}
                placeholder="Neema Foundation"
                disabled={isSaving}
                error={errors.account_name?.message}
              />
            </FormField>
          </div>

          {/* Account Number — sensitive */}
          {isEditing && existing?.account_number_mask ? (
            <SensitiveField
              mode="masked"
              label="Account Number"
              maskedValue={existing.account_number_mask}
            />
          ) : (
            <Controller
              name="account_number"
              control={control}
              render={({ field }) => (
                <SensitiveField
                  mode="input"
                  label="Account Number"
                  name="account_number"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="e.g. 1234567890"
                  disabled={isSaving}
                  error={errors.account_number?.message}
                  hint="Encrypted at rest — only the last 4 digits are stored in plaintext."
                />
              )}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SWIFT — sensitive */}
            {isEditing && existing?.swift_code_mask ? (
              <SensitiveField
                mode="masked"
                label="SWIFT / BIC Code"
                maskedValue={existing.swift_code_mask}
              />
            ) : (
              <Controller
                name="swift_code"
                control={control}
                render={({ field }) => (
                  <SensitiveField
                    mode="input"
                    label="SWIFT / BIC Code"
                    name="swift_code"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="e.g. KCBLKENX"
                    disabled={isSaving}
                    error={errors.swift_code?.message}
                    hint="8 or 11 characters"
                  />
                )}
              />
            )}

            {/* IBAN — sensitive */}
            {isEditing && existing?.iban_mask ? (
              <SensitiveField
                mode="masked"
                label="IBAN"
                maskedValue={existing.iban_mask}
              />
            ) : (
              <Controller
                name="iban"
                control={control}
                render={({ field }) => (
                  <SensitiveField
                    mode="input"
                    label="IBAN (optional)"
                    name="iban"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="e.g. GB29NWBK60161331926819"
                    disabled={isSaving}
                    error={errors.iban?.message}
                  />
                )}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* ══ M-Pesa Paybill fields ══════════════════════════════════════════ */}
      {methodType === 'mpesa_paybill' && (
        <motion.div
          key="mpesa_paybill"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-gray-100"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            M-Pesa Paybill Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Paybill Number"
              htmlFor="paybill_number"
              error={errors.paybill_number?.message}
              required
            >
              <InputField
                id="paybill_number"
                {...register('paybill_number')}
                placeholder="e.g. 400200"
                disabled={isSaving}
                error={errors.paybill_number?.message}
              />
            </FormField>

            <FormField
              label="Account Number"
              htmlFor="account_name_mpb"
              error={errors.account_name?.message}
              hint="Account number donors enter (e.g. your org number)"
            >
              <InputField
                id="account_name_mpb"
                {...register('account_name')}
                placeholder="e.g. 0723456789"
                disabled={isSaving}
                error={errors.account_name?.message}
              />
            </FormField>
          </div>
        </motion.div>
      )}

      {/* ══ M-Pesa Till fields ════════════════════════════════════════════ */}
      {methodType === 'mpesa_till' && (
        <motion.div
          key="mpesa_till"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-gray-100"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            M-Pesa Till Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Account Name"
              htmlFor="account_name_mt"
              error={errors.account_name?.message}
            >
              <InputField
                id="account_name_mt"
                {...register('account_name')}
                placeholder="Neema Foundation"
                disabled={isSaving}
                error={errors.account_name?.message}
              />
            </FormField>

            <FormField
              label="Till Number"
              htmlFor="till_number"
              error={errors.till_number?.message}
              required
            >
              <InputField
                id="till_number"
                {...register('till_number')}
                placeholder="e.g. 123456"
                disabled={isSaving}
                error={errors.till_number?.message}
              />
            </FormField>
          </div>
        </motion.div>
      )}

      {/* ══ PayPal fields ══════════════════════════════════════════════════ */}
      {methodType === 'paypal' && (
        <motion.div
          key="paypal"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-gray-100"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            PayPal Details
          </p>

          <FormField
            label="PayPal Email"
            htmlFor="paypal_email"
            error={errors.paypal_email?.message}
            required
            hint="The email address associated with the PayPal account"
          >
            <InputField
              id="paypal_email"
              type="email"
              {...register('paypal_email')}
              placeholder="donate@neemafoundation.org"
              disabled={isSaving}
              error={errors.paypal_email?.message}
            />
          </FormField>
        </motion.div>
      )}

      {/* ══ Stripe fields ══════════════════════════════════════════════════ */}
      {methodType === 'stripe' && (
        <motion.div
          key="stripe"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-gray-100"
        >
          <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-50 border border-violet-200">
            <Info className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-violet-700">
              Stripe payment links and checkout sessions are managed separately in the
              Stripe Dashboard. Use the instructions field below to add a link or guidance
              for donors.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Instructions (all types) ─────────────────────────────────────── */}
      <FormField
        label="Instructions (optional)"
        htmlFor="instructions"
        error={errors.instructions?.message}
        hint="Additional guidance shown to donors below the payment details"
      >
        <TextareaField
          id="instructions"
          {...register('instructions')}
          placeholder="e.g. Please use your name as the payment reference."
          disabled={isSaving}
          error={errors.instructions?.message}
        />
      </FormField>

      {/* ── Visibility & sort order ──────────────────────────────────────── */}
      <div className="pt-2 border-t border-gray-100 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Visibility & Order
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Show on public site</p>
            <p className="text-xs text-gray-500">
              When enabled, this payment method appears on the public /bank-details page.
            </p>
          </div>
          <Controller
            name="is_public"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                disabled={isSaving}
                className={[
                  'relative inline-flex w-11 h-6 rounded-full border-2 border-transparent',
                  'transition-colors duration-200 focus:outline-none focus:ring-2',
                  'focus:ring-offset-2 focus:ring-blue-500',
                  field.value
                    ? 'bg-blue-600'
                    : 'bg-gray-200',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block w-5 h-5 rounded-full bg-white shadow-md',
                    'transform transition-transform duration-200',
                    field.value ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            )}
          />
        </div>

        <FormField
          label="Sort Order"
          htmlFor="sort_order"
          error={errors.sort_order?.message}
          hint="Lower numbers appear first. You can also drag rows to reorder."
        >
          <InputField
            id="sort_order"
            type="number"
            min={0}
            {...register('sort_order', { valueAsNumber: true })}
            disabled={isSaving}
            error={errors.sort_order?.message}
            className="w-32"
          />
        </FormField>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="tap-scale w-full sm:w-auto px-5 py-3 sm:py-2.5 border border-gray-200 rounded-xl
                     text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="tap-scale flex-1 px-5 py-3 sm:py-2.5 bg-blue-600 text-white rounded-xl
                     text-sm font-semibold hover:bg-blue-700 active:bg-blue-800
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     inline-flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Add Payment Method'
          )}
        </button>
      </div>
    </form>
  );
}
