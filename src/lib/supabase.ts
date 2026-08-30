import { createClient } from '@supabase/supabase-js';

// Sanitize URL by removing quotes and trimming whitespace
const sanitizeUrl = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

// Sanitize API/Publishable key by stripping all internal whitespace, spaces, newlines, and quotes
const sanitizeKey = (val?: string): string => {
  if (!val) return '';
  return val.replace(/\s+/g, '').replace(/^["']|["']$/g, '').trim();
};

const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseKey = sanitizeKey(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'AgriSmart Auth Warning: Supabase client is missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://rcotywamepevuxhrjkak.supabase.co',
  supabaseKey || 'missing-supabase-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'agrismart_supabase_auth'
    }
  }
);
