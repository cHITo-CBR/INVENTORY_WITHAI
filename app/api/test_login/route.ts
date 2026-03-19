import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: user, error } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("email", "admin@flowstock.com")
    .single();

  return Response.json({ user, error });
}
