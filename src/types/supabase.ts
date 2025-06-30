export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lopi_knowledge: {
        Row: {
          id: string
          topic: string
          content: string
          source: string | null
          tags: string[] | null
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic: string
          content: string
          source?: string | null
          tags?: string[] | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic?: string
          content?: string
          source?: string | null
          tags?: string[] | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      prayer_records: {
        Row: {
          id: string
          user_id: string
          prayer_name: string
          scheduled_time: string
          completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prayer_name: string
          scheduled_time: string
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prayer_name?: string
          scheduled_time?: string
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_prayers: number
          completed_prayers: number
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_prayers?: number
          completed_prayers?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_prayers?: number
          completed_prayers?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_lopi_context: {
        Args: {
          input_user_id: string
          query_text: string
        }
        Returns: string
      }
      get_lopi_context_with_vectors: {
        Args: {
          input_user_id: string
          query_text: string
          query_embedding: number[]
        }
        Returns: string
      }
      search_knowledge_with_embedding: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          topic: string
          content: string
          similarity: number
        }[]
      }
      update_user_stats: {
        Args: Record<string, unknown>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
