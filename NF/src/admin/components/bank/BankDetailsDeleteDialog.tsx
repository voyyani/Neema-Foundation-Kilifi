/**
 * BankDetailsDeleteDialog
 * Confirmation dialog for hard-deleting a payment method record.
 * Only rendered for owner / super_admin roles (enforced by table).
 * Requires the admin to type the record label before confirming.
 */

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BankDetail } from '../../types/bank';

interface BankDetailsDeleteDialogProps {
  record: BankDetail | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function BankDetailsDeleteDialog({
  record,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: BankDetailsDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const requiredText = record?.label ?? '';
  const isConfirmed  = confirmText.trim() === requiredText.trim();

  const handleConfirm = async () => {
    if (!record || !isConfirmed) return;
    await onConfirm(record.id);
    setConfirmText('');
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && record && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete payment method?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This will permanently delete{' '}
                    <span className="font-semibold">"{record.label}"</span>.
                    The audit log will be preserved. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Confirmation input */}
              <div className="space-y-2 mb-5">
                <label className="text-sm font-medium text-gray-700">
                  Type{' '}
                  <code className="px-1.5 py-0.5 bg-gray-100 rounded text-red-700 text-xs font-mono">
                    {requiredText}
                  </code>{' '}
                  to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                             disabled:bg-gray-50"
                  placeholder={requiredText}
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                             font-medium text-gray-700 hover:bg-gray-50
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isConfirmed || isDeleting}
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm
                             font-medium hover:bg-red-700
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                             inline-flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete permanently
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
