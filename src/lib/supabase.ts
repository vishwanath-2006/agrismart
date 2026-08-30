import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcotywamepevuxhrjkak.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb3R5d2FtZXBldnV4aHJqa2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTAwNzgsImV4cCI6MjEwMzYyNjA3OH0.I2J4E6Z0OkDBmLH-UegBwtSZ7hFHZBnYLhZYsFqjvO4';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
