import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ghwzpfdmwurlxhppatlp.supabase.co'
const supabaseAnonKey = 'sb_publishable_3YAxc1ZRrWeyGMhx6wDq2A_Pa7huvZk'

console.log('=== SUPABASE CONNECTION DEBUG ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'tutortracker-web'
    }
  }
});

// Test the connection immediately
console.log('Testing Supabase connection...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully');
    console.log('Session data:', data.session ? 'User logged in' : 'No active session');
  }
}).catch(err => {
  console.error('❌ Supabase connection failed:', err);
});

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