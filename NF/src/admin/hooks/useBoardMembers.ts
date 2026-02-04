import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { BoardMember, BoardMemberInput } from '../types/content';
import { toast } from 'sonner';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const boardMembersTable = () => supabase.from('board_members') as any;

export function useBoardMembers() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all members
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('board_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setMembers(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to load board members:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Create member
  const createMember = async (input: BoardMemberInput): Promise<BoardMember> => {
    try {
      // Get max display_order
      const maxOrder = members.length > 0
        ? Math.max(...members.map(m => m.display_order))
        : 0;

      const { data, error: createError } = await boardMembersTable()
        .insert([{
          ...input,
          display_order: maxOrder + 1,
          is_active: input.is_active ?? true,
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Board member added successfully!');
      fetchMembers();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to add member: ' + error.message);
      throw error;
    }
  };

  // Update member
  const updateMember = async (id: string, input: Partial<BoardMemberInput>): Promise<BoardMember> => {
    try {
      const { data, error: updateError } = await boardMembersTable()
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Member updated successfully!');
      fetchMembers();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update member: ' + error.message);
      throw error;
    }
  };

  // Delete member
  const deleteMember = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('board_members')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Member removed successfully!');
      fetchMembers();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to remove member: ' + error.message);
      throw error;
    }
  };

  // Toggle active status
  const toggleActive = async (id: string): Promise<BoardMember> => {
    try {
      const member = members.find(m => m.id === id);
      if (!member) throw new Error('Member not found');

      const { data, error: updateError } = await boardMembersTable()
        .update({ is_active: !member.is_active })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Member ${data.is_active ? 'activated' : 'deactivated'}`);
      fetchMembers();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle status: ' + error.message);
      throw error;
    }
  };

  // Reorder members
  const reorderMembers = async (reorderedMembers: BoardMember[]): Promise<void> => {
    try {
      const updates = reorderedMembers.map((member, index) => ({
        id: member.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        await boardMembersTable()
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Order updated successfully!');
      fetchMembers();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to reorder members: ' + error.message);
      throw error;
    }
  };

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    toggleActive,
    reorderMembers,
  };
}
