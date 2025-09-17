import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('=== SUPABASE CONNECTION DEBUG ===');
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');
console.log('All env vars:', import.meta.env);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

console.log('Creating Supabase client...');
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'tutortracker-web'
    }
  }
});

// Test connection immediately
console.log('Testing Supabase connection...');
supabase.auth.getSession()
  .then(({ data, error }) => {
    console.log('Initial session check:', { data: data?.session ? 'Session exists' : 'No session', error });
  })
  .catch((err) => {
    console.error('Failed to get initial session:', err);
  });

// Test database connection
supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    console.log('Database connection test:', { count, error });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
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