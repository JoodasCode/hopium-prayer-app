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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          theme: string | null
          calculation_method: string | null
          notifications_enabled: boolean
          hijri_offset: number
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          theme?: string | null
          calculation_method?: string | null
          notifications_enabled?: boolean
          hijri_offset?: number
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          theme?: string | null
          calculation_method?: string | null
          notifications_enabled?: boolean
          hijri_offset?: number
        }
      }
      prayer_records: {
        Row: {
          id: string
          user_id: string
          prayer_name: string
          scheduled_time: string
          completed_time: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prayer_name: string
          scheduled_time: string
          completed_time?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prayer_name?: string
          scheduled_time?: string
          completed_time?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      app_analytics: {
        Row: {
          id: string
          user_id: string
          event: string
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          event: string
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          event?: string
          timestamp?: string
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
