"use server";

import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/session";

export async function syncGoogleUser(accessToken: string) {
  // Verify the access token securely using Supabase's built-in token verifier
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return { error: "Invalid token or session expired." };

  const email = user.email;
  const fullName = user.user_metadata?.full_name || "Google User";
  
  if (!email) return { error: "No email provided by Google." };

  const { data: existingUser } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("email", email)
    .single();

  if (existingUser) {
     if (existingUser.status === "pending") return { success: false, redirect: "/login?error=Account%20is%20pending%20approval" };
     if (existingUser.status === "rejected") return { success: false, redirect: "/login?error=Account%20rejected" };
     if (!existingUser.is_active) return { success: false, redirect: "/login?error=Account%20is%20inactive" };

     await createSession({
       id: existingUser.id,
       email: existingUser.email,
       role: existingUser.roles?.name,
       full_name: existingUser.full_name
     });

     return { success: true, redirect: "/dashboard" };
  } else {
     const { data: roleData } = await supabase.from("roles").select("id").eq("name", "buyer").single();
     if (!roleData) return { error: "System role setup missing" };

     const { error: insertError } = await supabase.from("users").insert([{
       full_name: fullName,
       email: email,
       role_id: roleData.id,
       status: "pending",
       is_active: false
     }]);
     
     if (insertError) return { error: insertError.message };

     return { success: true, redirect: "/signup?success=google_pending" };
  }
}
