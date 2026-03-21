"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function registerUser(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const roleName = formData.get("role") as string;

  if (!fullName || !email || !password || !roleName) {
    return { error: "Missing required fields." };
  }

  try {
    // Get role id
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleError || !roleData) {
      return { error: "Invalid role selected." };
    }

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: roleName,
        },
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user account." };
    }

    // 2. Sync with public.users table
    const { error: dbError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        full_name: fullName,
        email: email,
        phone_number: phone,
        role_id: roleData.id,
        status: "pending",
        is_active: false,
      },
    ]);

    if (dbError) {
      console.error("Database sync error:", dbError);
      return { error: "Account created but profile sync failed. Please contact support." };
    }

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "An unexpected error occurred during registration." };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password required." };
  }

  try {
    // 1. Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { error: "Invalid email or password." };
    }

    // 2. Check user status in public.users
    const { data: user, error: dbError } = await supabase
      .from("users")
      .select("*, roles(name)")
      .eq("id", authData.user.id)
      .single();

    if (dbError || !user) {
      await supabase.auth.signOut();
      return { error: "User profile not found. Please contact support." };
    }

    if (user.status === "pending") {
      await supabase.auth.signOut();
      return { error: "Waiting for admin approval. Your account is pending." };
    }
    
    if (user.status === "rejected") {
      await supabase.auth.signOut();
      return { error: `Account rejected. Reason: ${user.rejection_reason || "Not specified"}` };
    }

    if (!user.is_active) {
      await supabase.auth.signOut();
      return { error: "Account is inactive." };
    }

    // 3. Update Auth Metadata to include role for middleware accessibility
    // This is important if they signed up before role metadata was added or for role updates
    const currentRole = user.roles?.name;
    if (currentRole) {
      await supabase.auth.updateUser({
        data: { role: currentRole }
      });
    }

    return { success: true, role: currentRole };
  } catch (err) {
    console.error("Login error:", err);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const userData = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role,
      full_name: user.user_metadata?.full_name
    };

    return {
      ...userData,
      user: userData
    };
  } catch (err) {
    console.error("Get current user error:", err);
    return null;
  }
}
