/**
 * useMaintenanceRules — Admin CRUD hook for maintenance rules
 *
 * Provides:
 * - fetchRules (with filtering)
 * - createRule / updateRule / deleteRule mutations
 * - toggleActive shortcut
 * - createStatusUpdate for posting progress
 * - deleteStatusUpdate for removing a status update
 * - fetchAuditLog for history
 *
 * Uses TanStack Query for cache management & optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { queryKeys } from '../config/queryClient';
import { toast } from 'sonner';
import type {
  MaintenanceRule,
  MaintenanceSchedule,
  MaintenanceStatusUpdate,
  MaintenanceAuditEntry,
  MaintenanceTemplate,
  CreateMaintenanceRuleInput,
  UpdateMaintenanceRuleInput,
  CreateStatusUpdateInput,
  CreateTemplateInput,
  MaintenanceFilters,
  MaintenanceScope,
} from '../types/maintenance';

// =============================================================================
// Fetch all rules (with optional filters)
// =============================================================================

export function useMaintenanceRules(filters?: MaintenanceFilters) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceRules, filters],
    queryFn: async (): Promise<MaintenanceRule[]> => {
      let query = supabase
        .from('maintenance_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.scope && filters.scope !== 'all') {
        query = query.eq('scope', filters.scope as MaintenanceScope);
      }

      if (filters?.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters?.status === 'inactive') {
        query = query.eq('is_active', false);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,target_key.ilike.%${filters.search}%,message.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch maintenance rules:', error);
        throw error;
      }

      return (data ?? []) as MaintenanceRule[];
    },
    staleTime: 30 * 1000, // 30 seconds — maintenance rules change frequently
    gcTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Fetch a single rule by ID (with schedules + status updates)
// =============================================================================

export function useMaintenanceRule(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceRule(id ?? ''), id],
    queryFn: async (): Promise<MaintenanceRule & {
      schedules: MaintenanceSchedule[];
      status_updates: MaintenanceStatusUpdate[];
    }> => {
      // Fetch rule
      const { data: rule, error: ruleError } = await supabase
        .from('maintenance_rules')
        .select('*')
        .eq('id', id!)
        .single();

      if (ruleError) throw ruleError;

      // Fetch schedules
      const { data: schedules } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('rule_id', id!)
        .order('starts_at', { ascending: false });

      // Fetch status updates
      const { data: statusUpdates } = await supabase
        .from('maintenance_status_updates')
        .select('*')
        .eq('rule_id', id!)
        .order('created_at', { ascending: false });

      return {
        ...(rule as MaintenanceRule),
        schedules: (schedules ?? []) as MaintenanceSchedule[],
        status_updates: (statusUpdates ?? []) as MaintenanceStatusUpdate[],
      };
    },
    enabled: !!id,
    staleTime: 15 * 1000,
  });
}

// =============================================================================
// Create a new maintenance rule
// =============================================================================

export function useCreateMaintenanceRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateMaintenanceRuleInput): Promise<MaintenanceRule> => {
      const { data, error } = await supabase
        .from('maintenance_rules')
        .insert({
          ...input,
          display_config: input.display_config ?? {},
          metadata: input.metadata ?? {},
          allowed_roles: input.allowed_roles ?? ['super_admin', 'admin'],
          priority: input.priority ?? 50,
          is_active: input.is_active ?? false,
          created_by: user?.id ?? null,
          updated_by: user?.id ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as MaintenanceRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
      toast.success(`Rule "${data.title}" created`, {
        description: `Target: ${data.target_key}`,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create maintenance rule:', error);
      if (error.message?.includes('unique_scope_target')) {
        toast.error('A rule for this target already exists', {
          description: 'Each scope + target combination must be unique.',
        });
      } else {
        toast.error('Failed to create rule', { description: error.message });
      }
    },
  });
}

// =============================================================================
// Update an existing rule
// =============================================================================

export function useUpdateMaintenanceRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateMaintenanceRuleInput & { id: string }): Promise<MaintenanceRule> => {
      const { data, error } = await (supabase
        .from('maintenance_rules') as any)
        .update({
          ...input,
          updated_by: user?.id ?? null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MaintenanceRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRule(data.id) });
      toast.success(`Rule "${data.title}" updated`);
    },
    onError: (error: Error) => {
      console.error('Failed to update maintenance rule:', error);
      toast.error('Failed to update rule', { description: error.message });
    },
  });
}

// =============================================================================
// Toggle rule active/inactive (convenience shortcut)
// =============================================================================

export function useToggleMaintenanceRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }): Promise<MaintenanceRule> => {
      const { data, error } = await (supabase
        .from('maintenance_rules') as any)
        .update({ is_active, updated_by: user?.id ?? null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MaintenanceRule;
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.maintenanceRules });

      const previousRules = queryClient.getQueryData<MaintenanceRule[]>(queryKeys.maintenanceRules);

      queryClient.setQueriesData<MaintenanceRule[]>(
        { queryKey: queryKeys.maintenanceRules },
        (old) =>
          old?.map((rule) =>
            rule.id === id ? { ...rule, is_active } : rule
          ) ?? []
      );

      return { previousRules };
    },
    onError: (error: Error, _vars, context) => {
      // Rollback on error
      if (context?.previousRules) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.maintenanceRules },
          context.previousRules
        );
      }
      console.error('Failed to toggle maintenance rule:', error);
      toast.error('Failed to toggle rule', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
    },
    onSuccess: (data) => {
      toast.success(
        data.is_active
          ? `"${data.title}" activated — target is now under maintenance`
          : `"${data.title}" deactivated — target is back online`,
        { duration: 4000 }
      );
    },
  });
}

// =============================================================================
// Delete a rule
// =============================================================================

export function useDeleteMaintenanceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // First, nullify audit log references to this rule so that the
      // AFTER DELETE trigger can insert a 'deleted' entry without hitting
      // the FK constraint (migration 20260306173000 drops the FK on live DB,
      // but this guard handles any environment where it still exists).
      await supabase
        .from('maintenance_audit_log')
        .update({ rule_id: null } as never)
        .eq('rule_id', id);

      const { data, error } = await supabase
        .from('maintenance_rules')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;

      // If RLS silently blocked the delete, no rows come back — surface it.
      if (!data || data.length === 0) {
        throw new Error('Permission denied: could not delete the maintenance rule. Run the latest DB migrations and verify your admin role.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
      toast.success('Maintenance rule deleted');
    },
    onError: (error: Error) => {
      console.error('Failed to delete maintenance rule:', error);
      toast.error('Failed to delete rule', { description: error.message });
    },
  });
}

// =============================================================================
// Create a status update for a rule
// =============================================================================

export function useCreateStatusUpdate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateStatusUpdateInput): Promise<MaintenanceStatusUpdate> => {
      const { data, error } = await supabase
        .from('maintenance_status_updates')
        .insert({
          ...input,
          status_type: input.status_type ?? 'info',
          created_by: user?.id ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as MaintenanceStatusUpdate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRule(data.rule_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceStatusFeed(data.rule_id) });
      toast.success('Status update posted');
    },
    onError: (error: Error) => {
      toast.error('Failed to post status update', { description: error.message });
    },
  });
}

// =============================================================================
// Delete a status update
// =============================================================================

export function useDeleteStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ruleId }: { id: string; ruleId: string }): Promise<{ ruleId: string }> => {
      const { error } = await supabase
        .from('maintenance_status_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ruleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRule(data.ruleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceStatusFeed(data.ruleId) });
      toast.success('Status update deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete status update', { description: error.message });
    },
  });
}

// =============================================================================
// Fetch all schedules (for timeline / calendar views)
// =============================================================================

export function useMaintenanceSchedules() {
  return useQuery({
    queryKey: queryKeys.maintenanceSchedules,
    queryFn: async (): Promise<MaintenanceSchedule[]> => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('is_active', true)
        .order('starts_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch maintenance schedules:', error);
        throw error;
      }

      return (data ?? []) as MaintenanceSchedule[];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Fetch audit log for a rule (or all rules)
// =============================================================================

export function useMaintenanceAuditLog(ruleId?: string) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceAudit, ruleId],
    queryFn: async (): Promise<MaintenanceAuditEntry[]> => {
      let query = supabase
        .from('maintenance_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ruleId) {
        query = query.eq('rule_id', ruleId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch maintenance audit log:', error);
        throw error;
      }

      return (data ?? []) as MaintenanceAuditEntry[];
    },
    staleTime: 60 * 1000,
  });
}

// =============================================================================
// Summary statistics for the dashboard
// =============================================================================

export function useMaintenanceStats() {
  const { data: rules } = useMaintenanceRules();

  const stats = {
    total: rules?.length ?? 0,
    active: rules?.filter((r) => r.is_active).length ?? 0,
    inactive: rules?.filter((r) => !r.is_active).length ?? 0,
    byScope: {
      global: rules?.filter((r) => r.scope === 'global').length ?? 0,
      page: rules?.filter((r) => r.scope === 'page').length ?? 0,
      section: rules?.filter((r) => r.scope === 'section').length ?? 0,
      component: rules?.filter((r) => r.scope === 'component').length ?? 0,
      feature_group: rules?.filter((r) => r.scope === 'feature_group').length ?? 0,
    },
    bySeverity: {
      full_block: rules?.filter((r) => r.severity === 'full_block' && r.is_active).length ?? 0,
      degraded: rules?.filter((r) => r.severity === 'degraded' && r.is_active).length ?? 0,
      notice: rules?.filter((r) => r.severity === 'notice' && r.is_active).length ?? 0,
    },
  };

  return stats;
}

// =============================================================================
// Phase 6 — Bulk toggle multiple rules at once
// =============================================================================

export function useBulkToggleMaintenanceRules() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ids,
      is_active,
    }: {
      ids: string[];
      is_active: boolean;
    }): Promise<MaintenanceRule[]> => {
      const results: MaintenanceRule[] = [];

      for (const id of ids) {
        const { data, error } = await (supabase
          .from('maintenance_rules') as any)
          .update({ is_active, updated_by: user?.id ?? null })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        results.push(data as MaintenanceRule);
      }

      return results;
    },
    // Optimistic update
    onMutate: async ({ ids, is_active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.maintenanceRules });

      const previousRules = queryClient.getQueryData<MaintenanceRule[]>(queryKeys.maintenanceRules);

      queryClient.setQueriesData<MaintenanceRule[]>(
        { queryKey: queryKeys.maintenanceRules },
        (old) =>
          old?.map((rule) =>
            ids.includes(rule.id) ? { ...rule, is_active } : rule
          ) ?? []
      );

      return { previousRules };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousRules) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.maintenanceRules },
          context.previousRules
        );
      }
      toast.error('Failed to bulk update rules', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
    },
    onSuccess: (data, vars) => {
      toast.success(
        `${data.length} rule${data.length > 1 ? 's' : ''} ${vars.is_active ? 'activated' : 'deactivated'}`
      );
    },
  });
}

export function useBulkDeleteMaintenanceRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      for (const id of ids) {
        // Nullify audit log references before delete (FK guard, see 20260306173000).
        await supabase
          .from('maintenance_audit_log')
          .update({ rule_id: null } as never)
          .eq('rule_id', id);

        const { data, error } = await supabase
          .from('maintenance_rules')
          .delete()
          .eq('id', id)
          .select('id');

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(`Permission denied: could not delete rule ${id}. Run the latest DB migrations and verify your admin role.`);
        }
      }
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRules });
      toast.success(`${ids.length} rule${ids.length > 1 ? 's' : ''} deleted`);
    },
    onError: (error: Error) => {
      toast.error('Failed to bulk delete rules', { description: error.message });
    },
  });
}

// =============================================================================
// Phase 6 — Maintenance Templates CRUD
// =============================================================================

export function useMaintenanceTemplates() {
  return useQuery({
    queryKey: queryKeys.maintenanceTemplates,
    queryFn: async (): Promise<MaintenanceTemplate[]> => {
      const { data, error } = await supabase
        .from('maintenance_templates')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch maintenance templates:', error);
        throw error;
      }

      return (data ?? []) as MaintenanceTemplate[];
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateMaintenanceTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput): Promise<MaintenanceTemplate> => {
      const { data, error } = await supabase
        .from('maintenance_templates')
        .insert({
          ...input,
          display_config: input.display_config ?? {},
          metadata: input.metadata ?? {},
          allowed_roles: input.allowed_roles ?? ['super_admin', 'admin'],
          priority: input.priority ?? 50,
          created_by: user?.id ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as MaintenanceTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceTemplates });
      toast.success(`Template "${data.name}" saved`);
    },
    onError: (error: Error) => {
      if (error.message?.includes('unique_template_name')) {
        toast.error('A template with that name already exists');
      } else {
        toast.error('Failed to save template', { description: error.message });
      }
    },
  });
}

export function useDeleteMaintenanceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('maintenance_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceTemplates });
      toast.success('Template deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete template', { description: error.message });
    },
  });
}

/** Use a template: increment usage_count and return the rule config */
export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string): Promise<MaintenanceTemplate> => {
      // Fetch the template
      const { data: template, error: fetchError } = await supabase
        .from('maintenance_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Increment usage count
      await (supabase.from('maintenance_templates') as any)
        .update({
          usage_count: ((template as any).usage_count ?? 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', templateId);

      return template as MaintenanceTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceTemplates });
    },
    onError: (error: Error) => {
      toast.error('Failed to apply template', { description: error.message });
    },
  });
}

// =============================================================================
// Phase 6 — Maintenance History & Analytics
// =============================================================================

export function useMaintenanceHistory(limit: number = 100) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceAudit, 'history', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch maintenance history:', error);
        throw error;
      }

      return (data ?? []) as MaintenanceAuditEntry[];
    },
    staleTime: 60 * 1000,
  });
}
