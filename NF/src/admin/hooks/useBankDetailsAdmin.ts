/**
 * useBankDetailsAdmin — Admin Data Hook
 * Neema Foundation Bank Details Management System — Phase 4
 *
 * Provides full CRUD access to the bank_details Edge Function and a direct
 * Supabase read for the append-only audit log.
 *
 * Security model:
 *  - All mutating operations go through the Supabase Edge Function
 *    (`/functions/v1/bank-details`), which holds the service-role key and
 *    performs AES-256-GCM encryption before writing to the database.
 *  - The hook never touches plaintext sensitive values after they leave the
 *    form — they are forwarded straight to the Edge Function via HTTPS.
 *  - Audit log entries are read directly via the Supabase client; RLS
 *    (`is_bank_admin()`) ensures only privileged roles can access them.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import type {
  BankDetail,
  BankDetailFormData,
  BankDetailAuditEntry,
  BankDetailReorderPayload,
} from '../types/bank';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum number of audit entries fetched per call.
 * For the global log this provides a recent-history view; for per-record
 * logs this is more than enough to cover the entire life of any record.
 */
const AUDIT_PAGE_SIZE = 100;

/** How many times to retry a transient network failure before giving up. */
const MAX_RETRIES = 2;

/** Base delay (ms) for exponential back-off on retries. */
const RETRY_BASE_MS = 400;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Sleep for `ms` milliseconds. */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Parse a JSON or plain-text error response from the Edge Function and
 * return a human-readable message string.
 */
async function parseEdgeError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string; message?: string };
    return json.error ?? json.message ?? text;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Tracks which specific record is currently being saved (for per-row spinners). */
export type SavingState =
  | { type: 'idle' }
  | { type: 'creating' }
  | { type: 'updating'; id: string }
  | { type: 'deleting'; id: string }
  | { type: 'toggling'; id: string }
  | { type: 'reordering' };

/** Shape returned by the hook. */
export interface UseBankDetailsAdminReturn {
  /** All bank detail records, sorted by `sort_order`. */
  records: BankDetail[];
  /** Audit log entries, newest first. */
  audit: BankDetailAuditEntry[];
  /** True only during the initial data fetch. */
  loading: boolean;
  /** True during any audit-only fetch (does not block the main records list). */
  auditLoading: boolean;
  /** Granular saving state — use to drive per-row loading indicators. */
  savingState: SavingState;
  /** True when any mutation is in flight. */
  saving: boolean;
  /** Last error message, or null when healthy. */
  error: string | null;

  /** Refresh all records from the Edge Function. */
  refetch: () => Promise<void>;
  /** Refresh audit log, optionally scoped to a single record. */
  fetchAudit: (bankDetailId?: string) => Promise<void>;

  /** Create a new payment method. */
  create: (form: BankDetailFormData) => Promise<BankDetail | null>;
  /** Partially update an existing record (send only changed fields). */
  update: (id: string, form: Partial<BankDetailFormData>) => Promise<BankDetail | null>;
  /** Hard-delete a record (owner / super_admin only). */
  remove: (id: string) => Promise<boolean>;
  /** Flip `is_public` for a single record. */
  toggle: (id: string) => Promise<BankDetail | null>;
  /**
   * Persist a new sort order after a drag-and-drop operation.
   * Applies an optimistic update instantly; rolls back on error.
   */
  reorder: (ordered: BankDetailReorderPayload[]) => Promise<boolean>;
  /** Clear the stored error message. */
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBankDetailsAdmin(): UseBankDetailsAdminReturn {
  const [records, setRecords] = useState<BankDetail[]>([]);
  const [audit, setAudit] = useState<BankDetailAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [savingState, setSavingState] = useState<SavingState>({ type: 'idle' });
  const [error, setError] = useState<string | null>(null);

  /**
   * AbortController ref — cancelled when the hook unmounts so that in-flight
   * requests started during the initial load do not try to set state on an
   * unmounted component.
   */
  const abortRef = useRef<AbortController>(new AbortController());

  // ─── Edge Function caller ────────────────────────────────────────────────

  /**
   * Make an authenticated request to the bank-details Edge Function.
   *
   * @param method   HTTP verb
   * @param path     Sub-path, e.g. `""` for the list, `"/<id>"` for a record
   * @param body     Optional JSON body (POST/PATCH)
   * @param signal   Optional AbortSignal for cancellation
   * @returns        Parsed JSON response
   */
  const callEdge = useCallback(async <T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No active session — please sign in again.');
    }

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bank-details${path}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        // Exponential back-off: 400 ms, 800 ms, …
        await sleep(RETRY_BASE_MS * 2 ** (attempt - 1));
      }

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        });

        if (!res.ok) {
          const message = await parseEdgeError(res);
          // 4xx errors are non-retryable
          if (res.status >= 400 && res.status < 500) {
            throw new Error(message);
          }
          lastError = new Error(message);
          continue; // retry on 5xx
        }

        // 204 No Content (e.g. DELETE)
        if (res.status === 204) return undefined as T;

        return (await res.json()) as T;
      } catch (err) {
        // AbortError should propagate immediately — no retry
        if ((err as Error).name === 'AbortError') throw err;
        lastError = err as Error;
        // Network errors are retryable
      }
    }

    throw lastError ?? new Error('Unknown error calling Edge Function');
  }, []);

  // ─── Records fetch ───────────────────────────────────────────────────────

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await callEdge<{ data: BankDetail[]; total: number }>(
        'GET',
        '',
        undefined,
        abortRef.current.signal,
      );
      setRecords(res?.data ?? []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const message = (err as Error).message ?? 'Failed to load bank details';
      setError(message);
      toast.error('Bank details', { description: message });
    } finally {
      setLoading(false);
    }
  }, [callEdge]);

  // ─── Audit fetch ─────────────────────────────────────────────────────────

  const fetchAudit = useCallback(async (bankDetailId?: string) => {
    setAuditLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('bank_detail_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(AUDIT_PAGE_SIZE);

      if (bankDetailId) {
        query = query.eq('bank_detail_id', bankDetailId);
      }

      const { data, error: supaError } = await query;

      if (supaError) throw new Error(supaError.message);

      setAudit((data as BankDetailAuditEntry[]) ?? []);
    } catch (err) {
      // Audit errors are non-critical; log but don't block the UI
      console.error('[useBankDetailsAdmin] fetchAudit failed:', err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // ─── Mount / unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    // Fire both fetches concurrently on mount
    void refetch();
    void fetchAudit();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Mutations ───────────────────────────────────────────────────────────

  /** Create a new payment method record via the Edge Function. */
  const create = useCallback(
    async (form: BankDetailFormData): Promise<BankDetail | null> => {
      setSavingState({ type: 'creating' });
      setError(null);

      try {
        const res = await callEdge<{ data: BankDetail; message: string }>('POST', '', form);
        const result = res.data;
        toast.success('Payment method added', {
          description: `"${result.label}" has been created.`,
        });
        await Promise.all([refetch(), fetchAudit()]);
        return result;
      } catch (err) {
        const message = (err as Error).message ?? 'Failed to create record';
        setError(message);
        toast.error('Could not add payment method', { description: message });
        return null;
      } finally {
        setSavingState({ type: 'idle' });
      }
    },
    [callEdge, refetch, fetchAudit],
  );

  /** Update an existing record. Send only the fields that changed. */
  const update = useCallback(
    async (
      id: string,
      form: Partial<BankDetailFormData>,
    ): Promise<BankDetail | null> => {
      setSavingState({ type: 'updating', id });
      setError(null);

      try {
        const res = await callEdge<{ data: BankDetail; message: string }>('PATCH', `/${id}`, form);
        const result = res.data;
        toast.success('Payment method updated', {
          description: `"${result.label}" has been saved.`,
        });
        await Promise.all([refetch(), fetchAudit()]);
        return result;
      } catch (err) {
        const message = (err as Error).message ?? 'Failed to update record';
        setError(message);
        toast.error('Could not update payment method', { description: message });
        return null;
      } finally {
        setSavingState({ type: 'idle' });
      }
    },
    [callEdge, refetch, fetchAudit],
  );

  /** Hard-delete a record. Only owner / super_admin roles may do this. */
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setSavingState({ type: 'deleting', id });
      setError(null);

      // Find label before deletion for the toast message
      const label =
        records.find((r) => r.id === id)?.label ?? 'Payment method';

      try {
        await callEdge('DELETE', `/${id}`);
        toast.success('Payment method deleted', {
          description: `"${label}" has been permanently removed.`,
        });
        await Promise.all([refetch(), fetchAudit()]);
        return true;
      } catch (err) {
        const message = (err as Error).message ?? 'Failed to delete record';
        setError(message);
        toast.error('Could not delete payment method', { description: message });
        return false;
      } finally {
        setSavingState({ type: 'idle' });
      }
    },
    [callEdge, records, refetch, fetchAudit],
  );

  /** Toggle the `is_public` flag on a single record. */
  const toggle = useCallback(
    async (id: string): Promise<BankDetail | null> => {
      setSavingState({ type: 'toggling', id });
      setError(null);

      // Optimistic UI — flip locally first
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_public: !r.is_public } : r,
        ),
      );

      try {
        const res = await callEdge<{ data: BankDetail; message: string }>('PATCH', `/${id}/toggle`);
        const result = res.data;
        const visibilityLabel = result.is_public ? 'visible' : 'hidden';
        toast.success('Visibility updated', {
          description: `"${result.label}" is now ${visibilityLabel} on the public site.`,
        });
        // Reconcile with server truth
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? result : r)),
        );
        void fetchAudit();
        return result;
      } catch (err) {
        // Roll back the optimistic update
        setRecords((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, is_public: !r.is_public } : r,
          ),
        );
        const message = (err as Error).message ?? 'Failed to toggle visibility';
        setError(message);
        toast.error('Could not update visibility', { description: message });
        return null;
      } finally {
        setSavingState({ type: 'idle' });
      }
    },
    [callEdge, fetchAudit],
  );

  /**
   * Persist a new drag-and-drop sort order.
   *
   * Applies an optimistic sort locally so the UI responds instantly.
   * If the API call fails, the previous order is restored.
   */
  const reorder = useCallback(
    async (ordered: BankDetailReorderPayload[]): Promise<boolean> => {
      setSavingState({ type: 'reordering' });
      setError(null);

      // Snapshot for rollback
      const previousRecords = records;

      // Optimistic update
      const orderMap = new Map(ordered.map((o) => [o.id, o.sort_order]));
      setRecords((prev) =>
        [...prev]
          .map((r) => ({
            ...r,
            sort_order: orderMap.has(r.id) ? (orderMap.get(r.id) as number) : r.sort_order,
          }))
          .sort((a, b) => a.sort_order - b.sort_order),
      );

      try {
        await callEdge('PATCH', '/reorder', ordered);
        // Reconcile from server after a brief delay to allow DB to settle
        await refetch();
        return true;
      } catch (err) {
        // Roll back to snapshot
        setRecords(previousRecords);
        const message = (err as Error).message ?? 'Failed to save new order';
        setError(message);
        toast.error('Could not save sort order', { description: message });
        return false;
      } finally {
        setSavingState({ type: 'idle' });
      }
    },
    [callEdge, records, refetch],
  );

  // ─── Derived state ───────────────────────────────────────────────────────

  const saving = savingState.type !== 'idle';

  const clearError = useCallback(() => setError(null), []);

  // ─── Return ──────────────────────────────────────────────────────────────

  return {
    records,
    audit,
    loading,
    auditLoading,
    savingState,
    saving,
    error,
    refetch,
    fetchAudit,
    create,
    update,
    remove,
    toggle,
    reorder,
    clearError,
  };
}
