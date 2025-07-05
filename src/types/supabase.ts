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
      mulvi_conversations: {
        Row: {
          id: string
          user_id: string
          title?: string
          created_at: string
          updated_at: string
          context?: any
          is_archived: boolean
          category?: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
          context?: any
          is_archived?: boolean
          category?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          context?: any
          is_archived?: boolean
          category?: string
        }
      }
      mulvi_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
          metadata?: any
          tokens_used?: number
          model_used?: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
          metadata?: any
          tokens_used?: number
          model_used?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
          metadata?: any
          tokens_used?: number
          model_used?: string
        }
      }
      mulvi_knowledge: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      mulvi_faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
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
