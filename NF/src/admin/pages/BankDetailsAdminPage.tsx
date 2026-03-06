/**
 * BankDetailsAdminPage
 * Neema Foundation Bank Details Management System — Phase 6
 *
 * World-class admin page for managing donation payment methods.
 *
 * Features:
 *  - Permission-gated header action ("Add Payment Method")
 *  - At-a-glance stats strip (total / active / public / inactive)
 *  - Drag-and-drop sortable table with per-row loading indicators
 *  - Create / edit slide-over modal with live preview pane
 *  - Full audit log timeline with action filter and diff viewer
 *  - Dismissable error banner
 *  - Graceful loading skeleton
 *  - Role-based UI hiding (delete is owner/super_admin only)
 *  - ProtectedRoute wrapper — users without view_bank_details are redirected
 */

import { useState, useCallback } from 'react';
import {
  Building2,
  Plus,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import {
  BankDetailsTable,
  BankDetailsFormModal,
  BankDetailsAuditLog,
} from '../components/bank';
import {
  useBankDetailsAdmin,
} from '../hooks/useBankDetailsAdmin';
import { usePermissions } from '../hooks';
import { useOnboardingTracker } from '../hooks/useOnboardingTracker';
import type { BankDetail, BankDetailFormData } from '../types/bank';

// ---------------------------------------------------------------------------
// Stat card helper
// ---------------------------------------------------------------------------

interface StatCardProps {
  label:   string;
  value:   number;
  icon:    React.ReactNode;
  colour:  string; // Tailwind bg colour class for the icon blob
  loading: boolean;
}

function StatCard({ label, value, icon, colour, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-lg ${colour} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function BankDetailsContent() {
  const { can } = usePermissions();
  const hook = useBankDetailsAdmin();
  const { track } = useOnboardingTracker();

  // Modal state
  const [modal, setModal] = useState<{
    open:     boolean;
    editing?: BankDetail;
  }>({ open: false });

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setModal({ open: true, editing: undefined });
  }, []);

  const openEdit = useCallback((record: BankDetail) => {
    setModal({ open: true, editing: record });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false });
  }, []);

  const handleSubmit = useCallback(async (data: BankDetailFormData) => {
    if (modal.editing) {
      await hook.update(modal.editing.id, data);
    } else {
      await hook.create(data);
      track('bank.created');
    }
    closeModal();
  }, [modal.editing, hook, closeModal, track]);

  // ── Derived counts ────────────────────────────────────────────────────────

  const total    = hook.records.length;
  const active   = hook.records.filter((r) => r.status === 'active').length;
  const publicN  = hook.records.filter((r) => r.is_public).length;
  const inactive = hook.records.filter((r) => r.status !== 'active').length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B01C2E]/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-[#B01C2E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Bank Details
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage donation payment methods displayed on the public site.
            </p>
          </div>
        </div>

        {can('manage_bank_details') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                       text-white text-sm font-medium rounded-lg shadow-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-[#B01C2E] focus:ring-offset-2
                       whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Payment Method
          </motion.button>
        )}
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hook.error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{hook.error}</p>
            <button
              onClick={hook.clearError}
              className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Methods"
          value={total}
          loading={hook.loading}
          colour="bg-blue-100"
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Active"
          value={active}
          loading={hook.loading}
          colour="bg-green-100"
          icon={<Activity className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          label="Publicly Visible"
          value={publicN}
          loading={hook.loading}
          colour="bg-amber-100"
          icon={<Eye className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          label="Inactive / Archived"
          value={inactive}
          loading={hook.loading}
          colour="bg-gray-100"
          icon={<EyeOff className="h-5 w-5 text-gray-500" />}
        />
      </div>

      {/* ── Security notice ───────────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Security notice:</span> Account numbers, IBAN and SWIFT codes are
          stored AES-256-GCM encrypted at rest. Only masked values are displayed here.
          Every change is captured in the immutable audit log below.
        </p>
      </div>

      {/* ── Records table ────────────────────────────────────────────────── */}
      <BankDetailsTable
        records={hook.records}
        loading={hook.loading}
        savingState={hook.savingState}
        error={null}
        onEdit={openEdit}
        onToggle={async (id: string) => { await hook.toggle(id); track('bank.toggled'); }}
        onDelete={hook.remove}
        onReorder={hook.reorder}
        onRefetch={hook.refetch}
        onAddNew={openCreate}
      />

      {/* ── Audit log ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Change History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Append-only log of every mutation. Visible to admins; IP shown to super_admin only.
          </p>
        </div>
        <div className="p-6">
          <BankDetailsAuditLog
            entries={hook.audit}
            auditLoading={hook.auditLoading}
            onRefresh={() => hook.fetchAudit()}
          />
        </div>
      </div>

      {/* ── Create / Edit modal ───────────────────────────────────────────── */}
      <BankDetailsFormModal
        isOpen={modal.open}
        existing={modal.editing}
        isSaving={hook.saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// Wrap with ProtectedRoute so unauthorised users get a redirect instead of a blank page
export default function BankDetailsAdminPage() {
  return (
    <ProtectedRoute requiredPermission="view_bank_details">
      <BankDetailsContent />
    </ProtectedRoute>
  );
}
