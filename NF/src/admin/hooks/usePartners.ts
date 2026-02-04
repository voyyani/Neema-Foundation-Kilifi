// Admin hook for managing partners (CRUD operations)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  type: string | null;
  description: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerFormData {
  name: string;
  logo_url?: string | null;
  type?: string | null;
  description?: string | null;
  website_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

// Fetch all partners (admin view - includes inactive)
export function usePartners() {
  return useQuery({
    queryKey: ['admin', 'partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching partners:', error);
        throw error;
      }
      return data as Partner[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch single partner by ID
export function usePartner(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'partners', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching partner:', error);
        throw error;
      }
      return data as Partner;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Create new partner
export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerData: PartnerFormData) => {
      const { data, error } = await supabase
        .from('partners')
        .insert([{
          ...partnerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating partner:', error);
        throw error;
      }
      return data as Partner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partners'] });
    },
  });
}

// Update existing partner
export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PartnerFormData> }) => {
      const { data: updatedData, error } = await supabase
        .from('partners')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating partner:', error);
        throw error;
      }
      return updatedData as Partner;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partners'] });
    },
  });
}

// Delete partner
export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting partner:', error);
        throw error;
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partners'] });
    },
  });
}

// Toggle partner featured status
export function useTogglePartnerFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { data, error } = await supabase
        .from('partners')
        .update({ 
          is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling featured status:', error);
        throw error;
      }
      return data as Partner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partners'] });
    },
  });
}

// Toggle partner active status
export function useTogglePartnerActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('partners')
        .update({ 
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling active status:', error);
        throw error;
      }
      return data as Partner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partners'] });
    },
  });
}

// Reorder partners
export function useReorderPartners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partners: { id: string; display_order: number }[]) => {
      const updates = partners.map(({ id, display_order }) =>
        supabase
          .from('partners')
          .update({ 
            display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        console.error('Error reordering partners:', errors);
        throw new Error('Failed to reorder partners');
      }

      return partners;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'partners'] });
    },
  });
}
