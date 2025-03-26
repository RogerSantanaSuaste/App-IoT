import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eeryivzgrgkarzwyuvun.supabase.co/';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnlpdnpncmdrYXJ6d3l1dnVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODIxMDI5MywiZXhwIjoyMDUzNzg2MjkzfQ.C1WbeHKKtIxhBO7CIjnx1yvu_1lgt0Rj-bedp3WfePA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});