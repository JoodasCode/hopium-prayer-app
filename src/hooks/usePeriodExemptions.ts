import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PeriodExemption {
  id: string;
  user_id: string;
  start_date: string;
  end_date?: string;
  exemption_type: 'menstruation' | 'postpartum' | 'illness' | 'travel';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePeriodExemptions = (userId: string | undefined) => {
  const [exemptions, setExemptions] = useState<PeriodExemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchExemptions = async () => {
      try {
        const { data, error } = await supabase
          .from('period_exemptions')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching period exemptions:', error);
          return;
        }

        setExemptions(data || []);
      } catch (error) {
        console.error('Error in fetchExemptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExemptions();
  }, [userId]);

  const addExemption = async (exemption: Omit<PeriodExemption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('period_exemptions')
        .insert([{ ...exemption, user_id: userId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding period exemption:', error);
        return false;
      }

      setExemptions(prev => [data, ...prev]);
      return true;
    } catch (error) {
      console.error('Error in addExemption:', error);
      return false;
    }
  };

  const updateExemption = async (id: string, updates: Partial<PeriodExemption>) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('period_exemptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating period exemption:', error);
        return false;
      }

      setExemptions(prev => prev.map(ex => ex.id === id ? data : ex));
      return true;
    } catch (error) {
      console.error('Error in updateExemption:', error);
      return false;
    }
  };

  const deleteExemption = async (id: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('period_exemptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting period exemption:', error);
        return false;
      }

      setExemptions(prev => prev.filter(ex => ex.id !== id));
      return true;
    } catch (error) {
      console.error('Error in deleteExemption:', error);
      return false;
    }
  };

  const isDateExempt = (date: string): boolean => {
    const checkDate = new Date(date);
    return exemptions.some(exemption => {
      const startDate = new Date(exemption.start_date);
      const endDate = exemption.end_date ? new Date(exemption.end_date) : new Date();
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  return {
    exemptions,
    isLoading,
    addExemption,
    updateExemption,
    deleteExemption,
    isDateExempt
  };
}; 