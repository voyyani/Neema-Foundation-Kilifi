/**
 * BankDetailsFormModal
 * Full-screen slide-over modal wrapping BankDetailsForm.
 * Two-column layout on wider screens: form on the left, live preview on the right.
 */

import { useState } from 'react';
import { X, Plus, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankDetailsForm } from './BankDetailsForm';
import { BankDetailsPreview } from './BankDetailsPreview';
import type {
  BankDetail,
  BankDetailFormData,
} from '../../types/bank';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BankDetailsFormModalProps {
  /** When provided, the modal is in edit mode. */
  existing?: BankDetail;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: BankDetailFormData) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BankDetailsFormModal({
  existing,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: BankDetailsFormModalProps) {
  const [preview, setPreview] = useState<Partial<BankDetailFormData>>(
    existing ?? {},
  );

  const isEditing = !!existing;
  const title     = isEditing ? 'Edit Payment Method' : 'Add Payment Method';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-start justify-end">
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="relative w-full max-w-4xl min-h-screen bg-white shadow-2xl
                           flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={[
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      isEditing ? 'bg-amber-100' : 'bg-blue-100',
                    ].join(' ')}>
                      {isEditing
                        ? <Pencil className="w-4 h-4 text-amber-600" />
                        : <Plus className="w-4 h-4 text-blue-600" />
                      }
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {existing?.label}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600
                               hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body — two-column on lg+ */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
                  {/* Form column */}
                  <div className="flex-1 px-6 py-6 overflow-y-auto">
                    <BankDetailsForm
                      existing={existing}
                      onSubmit={onSubmit}
                      onCancel={onClose}
                      onPreviewChange={setPreview}
                      isLoading={isSaving}
                    />
                  </div>

                  {/* Preview column */}
                  <div
                    className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l
                               border-gray-200 bg-gray-50 px-6 py-6"
                  >
                    <BankDetailsPreview data={preview} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
