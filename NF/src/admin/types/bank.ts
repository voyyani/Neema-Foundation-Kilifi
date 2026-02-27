/**
 * Bank Details Management — Type Definitions
 * Neema Foundation Admin Portal
 *
 * All sensitive fields (account numbers, SWIFT, IBAN) are never stored or
 * transmitted in plaintext to the browser.  The admin sees only masked
 * versions (e.g. "****1234").  Encryption/decryption is handled exclusively
 * inside the Supabase Edge Function using AES-256-GCM.
 */

// =============================================================================
// Core Enums
// =============================================================================

/** All supported payment method categories. */
export type PaymentMethodType =
  | 'bank_transfer'
  | 'mpesa_paybill'
  | 'mpesa_till'
  | 'paypal'
  | 'stripe';

/** Lifecycle status of a payment method record. */
export type BankDetailStatus = 'active' | 'inactive' | 'archived';

// =============================================================================
// Database Record Shape  (returned by the Edge Function / admin reads)
// =============================================================================

/**
 * A single payment method entry as returned to the admin layer.
 * Sensitive columns are always masked — plaintext values never leave
 * the Edge Function.
 */
export interface BankDetail {
  id: string;
  method_type: PaymentMethodType;

  /** Human-readable display name, e.g. "KCB Main Account" */
  label: string;

  // ── Bank Transfer fields ──────────────────────────────────────────────
  bank_name?: string;
  account_name?: string;
  /** Last-4 masked representation, e.g. "****1234". Never the full number. */
  account_number_mask?: string;
  swift_code_mask?: string;
  iban_mask?: string;

  // ── M-Pesa fields ─────────────────────────────────────────────────────
  paybill_number?: string;
  till_number?: string;

  // ── PayPal field ───────────────────────────────────────────────────────
  paypal_email?: string;

  // ── General ──────────────────────────────────────────────────────────
  instructions?: string;

  /** Whether this record is shown on the public /bank-details page. */
  is_public: boolean;

  /** Ascending sort position (0-based). Controls display order on public page. */
  sort_order: number;

  status: BankDetailStatus;

  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// =============================================================================
// Form Shape  (written by admin forms, sent to Edge Function)
// =============================================================================

/**
 * Data submitted when creating or editing a payment method.
 * Sensitive fields here are plaintext — they are only ever sent over
 * HTTPS to the Edge Function, which encrypts them before persisting.
 * They are NEVER written directly to the Supabase client.
 */
export interface BankDetailFormData {
  method_type: PaymentMethodType;

  /** Required display name shown on cards */
  label: string;

  // ── Bank Transfer ─────────────────────────────────────────────────────
  bank_name?: string;
  account_name?: string;
  /** Plaintext — transmitted to Edge Function only, encrypted at rest */
  account_number?: string;
  /** Plaintext — transmitted to Edge Function only, encrypted at rest */
  swift_code?: string;
  /** Plaintext — transmitted to Edge Function only, encrypted at rest */
  iban?: string;

  // ── M-Pesa ────────────────────────────────────────────────────────────
  paybill_number?: string;
  till_number?: string;

  // ── PayPal ────────────────────────────────────────────────────────────
  paypal_email?: string;

  // ── General ───────────────────────────────────────────────────────────
  instructions?: string;
  is_public: boolean;
  sort_order: number;
}

// =============================================================================
// Audit Log Shape
// =============================================================================

/** Action verbs recorded in the audit log. */
export type BankDetailAuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'visibility_toggled'
  | 'view_sensitive';  // Logged when admin reveals a masked field

/**
 * Single audit trail entry for a bank detail operation.
 * Only `is_bank_admin()` roles can read these rows (enforced by RLS).
 * IP address is only visible to super_admin in the UI.
 */
export interface BankDetailAuditEntry {
  id: string;
  bank_detail_id: string;
  action: BankDetailAuditAction;
  actor_id: string;
  actor_email: string;
  actor_role: string;
  /**
   * JSON diff of changed fields.
   * Keys are field names; values contain `before` and `after`.
   * Sensitive field values in diff are also masked.
   */
  diff: Record<string, { before: unknown; after: unknown }>;
  /** Only visible to super_admin in the audit log UI. */
  ip_address?: string;
  created_at: string;
}

// =============================================================================
// Public View Shape  (used by the public /bank-details page)
// =============================================================================

/**
 * Row shape of the `bank_details_public` Supabase view.
 * This view is the ONLY surface accessible to unauthenticated users.
 * It excludes all encrypted columns and exposes only masked display values.
 */
export interface PublicBankDetail {
  id: string;
  method_type: PaymentMethodType;
  label: string;
  bank_name?: string;
  account_name?: string;
  account_number_mask?: string;
  swift_code_mask?: string;
  iban_mask?: string;
  paybill_number?: string;
  till_number?: string;
  paypal_email?: string;
  instructions?: string;
  sort_order: number;
}

// =============================================================================
// UI State Types
// =============================================================================

/** State used by the admin CRUD modal. */
export type BankDetailModalMode = 'create' | 'edit';

export interface BankDetailModalState {
  open: boolean;
  mode: BankDetailModalMode;
  /** Populated when mode === 'edit' */
  record?: BankDetail;
}

/** Drag-and-drop reorder payload */
export interface BankDetailReorderPayload {
  id: string;
  sort_order: number;
}

// =============================================================================
// API Response Types  (Edge Function responses)
// =============================================================================

export interface BankDetailListResponse {
  data: BankDetail[];
  total: number;
}

export interface BankDetailMutationResponse {
  data: BankDetail;
  message: string;
}

export interface BankDetailErrorResponse {
  error: string;
  code: number;
}

// =============================================================================
// Field Configuration  (drives form conditional rendering)
// =============================================================================

/**
 * Declares which form fields are relevant for each payment method type.
 * The form uses this to show/hide field groups dynamically.
 */
export const PAYMENT_METHOD_FIELDS: Record<
  PaymentMethodType,
  {
    label: string;
    description: string;
    sensitiveFields: (keyof BankDetailFormData)[];
    visibleFields: (keyof BankDetailFormData)[];
  }
> = {
  bank_transfer: {
    label: 'Bank Transfer',
    description: 'International or local bank wire transfer',
    sensitiveFields: ['account_number', 'swift_code', 'iban'],
    visibleFields: ['bank_name', 'account_name', 'instructions'],
  },
  mpesa_paybill: {
    label: 'M-Pesa Paybill',
    description: 'Safaricom M-Pesa Paybill number',
    sensitiveFields: [],
    visibleFields: ['account_name', 'paybill_number', 'instructions'],
  },
  mpesa_till: {
    label: 'M-Pesa Till',
    description: 'Safaricom M-Pesa Buy Goods (Till) number',
    sensitiveFields: [],
    visibleFields: ['account_name', 'till_number', 'instructions'],
  },
  paypal: {
    label: 'PayPal',
    description: 'PayPal email address for donations',
    sensitiveFields: [],
    visibleFields: ['paypal_email', 'instructions'],
  },
  stripe: {
    label: 'Stripe',
    description: 'Stripe payment link or checkout session (managed separately)',
    sensitiveFields: [],
    visibleFields: ['instructions'],
  },
};

/** Human-readable labels for each payment method type */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> =
  Object.fromEntries(
    Object.entries(PAYMENT_METHOD_FIELDS).map(([k, v]) => [k, v.label])
  ) as Record<PaymentMethodType, string>;

/** Color scheme for PaymentMethodBadge component */
export const PAYMENT_METHOD_COLORS: Record<
  PaymentMethodType,
  { bg: string; text: string; border: string }
> = {
  bank_transfer: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  mpesa_paybill: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  mpesa_till: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  paypal: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
  stripe: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
};

/** Color scheme for BankDetailStatus badges */
export const BANK_DETAIL_STATUS_COLORS: Record<
  BankDetailStatus,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  inactive: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  archived: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  },
};

/** Color scheme for audit action pills */
export const AUDIT_ACTION_COLORS: Record<
  BankDetailAuditAction,
  { bg: string; text: string }
> = {
  created: { bg: 'bg-green-50', text: 'text-green-700' },
  updated: { bg: 'bg-amber-50', text: 'text-amber-700' },
  deleted: { bg: 'bg-red-50', text: 'text-red-700' },
  visibility_toggled: { bg: 'bg-blue-50', text: 'text-blue-700' },
  view_sensitive: { bg: 'bg-purple-50', text: 'text-purple-700' },
};
