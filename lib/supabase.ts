import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // During build time, Next.js might import this file. 
  // We should not throw an error immediately if the variables are missing,
  // as it will break the build. Instead, we'll log a warning and only 
  // throw when the client is actually used if possible.
  // However, createClient requires these to be strings.
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
    console.warn('⚠️ Supabase environment variables are missing!');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
