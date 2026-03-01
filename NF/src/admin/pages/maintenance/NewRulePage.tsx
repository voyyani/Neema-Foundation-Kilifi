/**
 * NewRulePage — Create a new maintenance rule
 *
 * Full-page form using the RuleForm component with step-by-step wizard.
 * Accessible at /admin/maintenance/new
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { RuleForm } from '../../components/maintenance';
import {
  useCreateMaintenanceRule,
} from '../../hooks/useMaintenanceRules';
import type {
  CreateMaintenanceRuleInput,
  UpdateMaintenanceRuleInput,
} from '../../types/maintenance';

// =============================================================================
// Component
// =============================================================================

function NewRulePageContent() {
  const navigate = useNavigate();
  const createMutation = useCreateMaintenanceRule();

  const handleSubmit = useCallback(
    (
      data: CreateMaintenanceRuleInput | (UpdateMaintenanceRuleInput & { id: string }),
      options: { activate: boolean }
    ) => {
      const input = data as CreateMaintenanceRuleInput;
      if (options.activate) {
        input.is_active = true;
      }

      createMutation.mutate(input, {
        onSuccess: () => {
          navigate('/admin/maintenance');
        },
      });
    },
    [createMutation, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/admin/maintenance');
  }, [navigate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/maintenance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B01C2E]/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-[#B01C2E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Maintenance Rule</h1>
            <p className="text-sm text-gray-500">
              Define a new maintenance rule with scope, severity, and scheduling
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
      >
        <RuleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending}
        />
      </motion.div>
    </div>
  );
}

export default function NewRulePage() {
  return (
    <ProtectedRoute requiredPermission="manage_site_maintenance">
      <NewRulePageContent />
    </ProtectedRoute>
  );
}
