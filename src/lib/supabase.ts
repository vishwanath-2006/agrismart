import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://rcotywamepevuxhrjkak.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb3R5d2FtZXBldnV4aHJqa2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTAwNzgsImV4cCI6MjEwMzYyNjA3OH0.I2J4E6Z0OkDBmLH-UegBwtSZ7hFHZBnYLhZYsFqjvO4';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'agrismart_supabase_auth'
  }
});
