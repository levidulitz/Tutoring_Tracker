import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin' | 'owner';
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== AUTH HOOK INITIALIZING ===');
    let mounted = true;
    
    // Get initial session
    console.log('Getting initial session...');
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('Initial session result:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error: error?.message 
        });
        
        if (!mounted) return;
        
        if (error) {
          console.error('Auth session error:', error);
          setError('Failed to connect to authentication service');
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('User found, fetching profile...');
          fetchProfile(session.user.id);
        } else {
          console.log('No user session, setting loading to false');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Auth connection error details:', err);
        if (!mounted) return;
        setError('Unable to connect to database. Please check your internet connection.');
        setLoading(false);
      });

    // Listen for auth changes
    console.log('Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, hasSession: !!session });
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('Cleaning up auth hook...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { data: !!data, error: error?.message });

      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, user might need to complete registration
        if (error.code === 'PGRST116') {
          setError('Profile not found. Please complete your registration.');
        } else {
          setError('Failed to load user profile');
        }
        setLoading(false);
        return;
      }
      
      console.log('Profile loaded successfully:', data.email);
      setProfile(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load user data');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signOut,
    isAdmin: profile?.role === 'admin' || profile?.role === 'owner',
    isOwner: profile?.role === 'owner'
  };
};