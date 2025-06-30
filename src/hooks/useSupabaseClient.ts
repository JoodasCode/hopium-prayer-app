import { supabase } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

/**
 * Hook to access Supabase client
 */
export function useSupabaseClient() {
  return {
    supabase: supabase as SupabaseClient<Database>
  };
}
