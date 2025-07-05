'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  goal_type: string;
  start_date: string;
  end_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  target_value: number;
  goal_type: string;
  end_date?: string;
}

export function useGoals(userId?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's goals
  const fetchGoals = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  // Create a new goal
  const createGoal = async (goalData: CreateGoalData): Promise<Goal | null> => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: goalData.title,
          description: goalData.description,
          target_value: goalData.target_value,
          goal_type: goalData.goal_type,
          end_date: goalData.end_date,
          current_value: 0,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      return null;
    }
  };

  // Update goal progress
  const updateGoalProgress = async (goalId: string, newValue: number): Promise<boolean> => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        setError('Goal not found');
        return false;
      }

      const isCompleted = newValue >= goal.target_value;
      const updateData: any = {
        current_value: newValue,
        updated_at: new Date().toISOString()
      };

      if (isCompleted && !goal.completed) {
        updateData.completed = true;
        updateData.completed_at = new Date().toISOString();
      } else if (!isCompleted && goal.completed) {
        updateData.completed = false;
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(g => g.id === goalId ? data : g));
      return true;
    } catch (err) {
      console.error('Error updating goal progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update goal progress');
      return false;
    }
  };

  // Delete a goal
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));
      return true;
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      return false;
    }
  };

  // Get active goals (not completed)
  const getActiveGoals = () => {
    return goals.filter(goal => !goal.completed);
  };

  // Get completed goals
  const getCompletedGoals = () => {
    return goals.filter(goal => goal.completed);
  };

  // Get goals by type
  const getGoalsByType = (type: string) => {
    return goals.filter(goal => goal.goal_type === type);
  };

  // Check if user has active goal of specific type
  const hasActiveGoalOfType = (type: string) => {
    return goals.some(goal => goal.goal_type === type && !goal.completed);
  };

  // Get progress percentage for a goal
  const getGoalProgress = (goal: Goal) => {
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  // Update goal progress based on current streak (for streak-based goals)
  const updateStreakGoalProgress = async (currentStreak: number) => {
    const streakGoals = goals.filter(goal => 
      goal.goal_type.includes('streak') || goal.goal_type.includes('consistent') && !goal.completed
    );

    for (const goal of streakGoals) {
      if (currentStreak !== goal.current_value) {
        await updateGoalProgress(goal.id, currentStreak);
      }
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    getActiveGoals,
    getCompletedGoals,
    getGoalsByType,
    hasActiveGoalOfType,
    getGoalProgress,
    updateStreakGoalProgress,
    refetch: fetchGoals,
    clearError
  };
} 