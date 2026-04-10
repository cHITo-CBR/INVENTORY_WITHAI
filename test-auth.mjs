import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhzgtkbimzumqtvsewpq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemd0a2JpbXp1bXF0dnNld3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MjgwOTMsImV4cCI6MjA5MTIwNDA5M30.DeoboMl97g8z2d_UTTLfM6TrHW-xwysm3n1vU3DkCFw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const email = "admin@flowstock.com";
  const password = "password123";

  console.log("Signing in with Auth...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
    return;
  }
  
  console.log("Auth Success. User ID:", authData.user.id);

  console.log("Checking public.users...");
  const { data: user, error: dbError } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("id", authData.user.id)
    .single();

  if (dbError) {
    console.error("DB Error:", dbError.message);
    return;
  }

  console.log("DB User:", JSON.stringify(user, null, 2));
}

testAuth();
