import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { User, UserSettings } from '@/types';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format');
}

// Security configuration
const supabaseConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Security settings
    flowType: 'pkce' as const,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // Additional security options
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for realtime
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'lopi-app',
    },
  },
};

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseConfig
);

// Authentication helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  // Initialize user profile after signup
  if (data?.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      onboarding_completed: false
    });
  }
  
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

// User data functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Prayer record functions
export const getPrayerRecords = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('prayer_records')
    .select('*')
    .eq('user_id', userId)
    .gte('scheduled_time', `${date}T00:00:00`)
    .lte('scheduled_time', `${date}T23:59:59`)
    .order('scheduled_time', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const markPrayerCompleted = async (prayerId: string, completedTime: string, emotionalState?: string, notes?: string) => {
  const { data, error } = await supabase
    .from('prayer_records')
    .update({
      completed: true,
      completed_time: completedTime,
      emotional_state_after: emotionalState,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', prayerId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

// User stats functions
export const getUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    throw error;
  }
  
  return data;
};

// Settings functions
export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  return data;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Lopi AI assistant functions
export const createLopiConversation = async (userId: string, title: string) => {
  const { data, error } = await supabase
    .from('lopi_conversations')
    .insert({
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getLopiConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('lopi_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getLopiMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('lopi_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const sendLopiMessage = async (conversationId: string, content: string, role: 'user' | 'assistant' | 'system') => {
  const { data, error } = await supabase
    .from('lopi_messages')
    .insert({
      conversation_id: conversationId,
      content,
      role,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};
