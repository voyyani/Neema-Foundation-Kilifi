/**
 * BankDetailsTable
 * Sortable, drag-and-drop table of all bank detail records.
 * Provides inline actions: edit, toggle visibility, delete.
 *
 * Drag-and-drop uses @dnd-kit (already used by DraggableList.tsx).
 * Permission gates mirror the RBAC rules:
 *  - view:   all admins
 *  - edit:   edit_bank_details
 *  - toggle: manage_bank_details
 *  - delete: manage_bank_details + role owner/super_admin
 */

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions, useAuth } from '../../hooks';
import { PaymentMethodBadge } from './PaymentMethodBadge';
import { BankDetailsDeleteDialog } from './BankDetailsDeleteDialog';
import {
  BANK_DETAIL_STATUS_COLORS,
  type BankDetail,
  type BankDetailReorderPayload,
} from '../../types/bank';
import type { SavingState } from '../../hooks/useBankDetailsAdmin';
import LoadingSpinner from '../ui/LoadingSpinner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sortable row
// ---------------------------------------------------------------------------

interface SortableRowProps {
  record: BankDetail;
  canEdit: boolean;
  canManage: boolean;
  canDelete: boolean;
  savingState: SavingState;
  onEdit: (record: BankDetail) => void;
  onToggle: (id: string) => void;
  onDelete: (record: BankDetail) => void;
}

function SortableRow({
  record,
  canEdit,
  canManage,
  canDelete,
  savingState,
  onEdit,
  onToggle,
  onDelete,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: record.id, disabled: !canManage });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isUpdating = savingState.type === 'updating' && savingState.id === record.id;
  const isToggling = savingState.type === 'toggling' && savingState.id === record.id;
  const isDeleting = savingState.type === 'deleting' && savingState.id === record.id;
  const isBusy     = isUpdating || isToggling || isDeleting;

  const status       = BANK_DETAIL_STATUS_COLORS[record.status];

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={[
        'group border-b border-gray-100 last:border-0 transition-colors',
        isDragging ? 'bg-blue-50 shadow-lg' : 'bg-white hover:bg-gray-50',
        isBusy ? 'opacity-70' : '',
      ].join(' ')}
    >
      {/* Drag handle */}
      <td className="w-10 pl-4 py-3">
        {canManage ? (
          <button
            type="button"
            className="p-1 cursor-grab active:cursor-grabbing text-gray-300
                       hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        ) : (
          <span className="block w-4" />
        )}
      </td>

      {/* Sort order */}
      <td className="w-12 py-3 text-center">
        <span className="text-xs text-gray-400 tabular-nums">{record.sort_order}</span>
      </td>

      {/* Method badge */}
      <td className="py-3 pr-3">
        <PaymentMethodBadge type={record.method_type} />
      </td>

      {/* Label */}
      <td className="py-3 pr-4 min-w-0">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {record.label}
          </span>
          {record.bank_name && (
            <span className="text-xs text-gray-500 truncate">{record.bank_name}</span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="py-3 pr-3">
        <span
          className={[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            status.bg,
            status.text,
          ].join(' ')}
        >
          <span className={['w-1.5 h-1.5 rounded-full', status.dot].join(' ')} />
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </span>
      </td>

      {/* Visibility */}
      <td className="py-3 pr-3">
        <span
          className={[
            'inline-flex items-center gap-1 text-xs font-medium',
            record.is_public ? 'text-green-600' : 'text-gray-400',
          ].join(' ')}
        >
          {record.is_public ? (
            <><Eye className="w-3.5 h-3.5" />Public</>
          ) : (
            <><EyeOff className="w-3.5 h-3.5" />Hidden</>
          )}
        </span>
      </td>

      {/* Updated */}
      <td className="py-3 pr-3 hidden xl:table-cell">
        <span className="text-xs text-gray-400">{formatDate(record.updated_at)}</span>
      </td>

      {/* Actions */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1 justify-end">
          {isBusy && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-1" />
          )}

          {/* Edit */}
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(record)}
              disabled={isBusy}
              title="Edit"
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600
                         hover:bg-blue-50 disabled:opacity-40
                         disabled:cursor-not-allowed transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* Toggle visibility */}
          {canManage && (
            <button
              type="button"
              onClick={() => onToggle(record.id)}
              disabled={isBusy}
              title={record.is_public ? 'Hide from public' : 'Show on public site'}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600
                         hover:bg-amber-50 disabled:opacity-40
                         disabled:cursor-not-allowed transition-colors"
            >
              {record.is_public
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          )}

          {/* Delete */}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(record)}
              disabled={isBusy}
              title="Delete permanently"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600
                         hover:bg-red-50 disabled:opacity-40
                         disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

interface BankDetailsTableProps {
  records: BankDetail[];
  loading: boolean;
  savingState: SavingState;
  error: string | null;
  onEdit: (record: BankDetail) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (ordered: BankDetailReorderPayload[]) => Promise<boolean>;
  onRefetch: () => void;
  onAddNew: () => void;
}

export function BankDetailsTable({
  records,
  loading,
  savingState,
  error,
  onEdit,
  onToggle,
  onDelete,
  onReorder,
  onRefetch,
  onAddNew,
}: BankDetailsTableProps) {
  const { can, is } = usePermissions();
  const { profile } = useAuth();

  const canEdit   = can('edit_bank_details');
  const canManage = can('manage_bank_details');
  const canDelete = canManage && is(['owner', 'super_admin']);

  const [deleteTarget, setDeleteTarget] = useState<BankDetail | null>(null);

  // ── Drag-and-drop ────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = records.findIndex((r) => r.id === active.id);
    const newIndex = records.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(records, oldIndex, newIndex);
    const payload: BankDetailReorderPayload[] = reordered.map((r, i) => ({
      id: r.id,
      sort_order: i,
    }));

    await onReorder(payload);
  };

  // ── Delete flow ──────────────────────────────────────────────────────────

  const handleDeleteConfirm = async (id: string) => {
    const ok = await onDelete(id);
    if (ok) setDeleteTarget(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return <LoadingSpinner text="Loading payment methods…" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Failed to load bank details</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={onRefetch}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                     border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Plus className="w-7 h-7 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">No payment methods yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Add a bank account, M-Pesa number, or PayPal address for donors.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        )}
      </motion.div>
    );
  }

  const isReordering = savingState.type === 'reordering';

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        {isReordering && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-700">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving new order…
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-10 pl-4 py-3" />
                <th className="w-12 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                  #
                </th>
                <th className="py-3 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Label / Bank
                </th>
                <th className="py-3 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="py-3 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Visibility
                </th>
                <th className="py-3 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                  Updated
                </th>
                <th className="py-3 pr-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <SortableContext
              items={records.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                <tbody>
                  {records.map((record) => (
                    <SortableRow
                      key={record.id}
                      record={record}
                      canEdit={canEdit}
                      canManage={canManage}
                      canDelete={canDelete}
                      savingState={savingState}
                      onEdit={onEdit}
                      onToggle={onToggle}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </AnimatePresence>
            </SortableContext>
          </table>
        </DndContext>

        {/* Footer summary */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>{records.length} payment method{records.length !== 1 ? 's' : ''}</span>
          <span>{records.filter((r) => r.is_public).length} public</span>
        </div>
      </div>

      {/* Delete dialog */}
      <BankDetailsDeleteDialog
        record={deleteTarget}
        isOpen={!!deleteTarget}
        isDeleting={
          savingState.type === 'deleting' && savingState.id === deleteTarget?.id
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
