import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin' | 'owner'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'owner'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'owner'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          hourly_rate: number
          distance_from_home: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          hourly_rate: number
          distance_from_home?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          hourly_rate?: number
          distance_from_home?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          client_id: string
          date: string
          duration: number
          rate: number
          type: 'virtual' | 'in-person'
          mileage: number | null
          total_earned: number
          paid: boolean
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          date: string
          duration: number
          rate: number
          type: 'virtual' | 'in-person'
          mileage?: number | null
          total_earned: number
          paid?: boolean
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          date?: string
          duration?: number
          rate?: number
          type?: 'virtual' | 'in-person'
          mileage?: number | null
          total_earned?: number
          paid?: boolean
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          date: string
          category: string
          description: string
          amount: number
          deductible: boolean
          receipts_attached: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          category: string
          description: string
          amount: number
          deductible?: boolean
          receipts_attached?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          category?: string
          description?: string
          amount?: number
          deductible?: boolean
          receipts_attached?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}