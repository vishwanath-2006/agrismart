import { createClient } from '@supabase/supabase-js';

// Strip potential quotes or accidental leading/trailing whitespace from environment variables
const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

const DEFAULT_SUPABASE_URL = 'https://rcotywamepevuxhrjkak.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb3R5d2FtZXBldnV4aHJqa2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTAwNzgsImV4cCI6MjEwMzYyNjA3OH0.I2J4E6Z0OkDBmLH-UegBwtSZ7hFHZBnYLhZYsFqjvO4';

const rawUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL);
const rawKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Use provided env if valid format, otherwise fall back to verified project constants
const supabaseUrl = rawUrl && rawUrl.startsWith('http') ? rawUrl : DEFAULT_SUPABASE_URL;
const supabaseAnonKey = rawKey && rawKey.length > 30 ? rawKey : DEFAULT_SUPABASE_ANON_KEY;

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
