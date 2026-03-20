"use server";

import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { createSession, clearSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function registerUser(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const roleName = formData.get("role") as string; // 'salesman', 'buyer', 'supervisor', etc.

  if (!fullName || !email || !password || !roleName) {
    return { error: "Missing required fields." };
  }

  // Get role id
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError || !roleData) {
    return { error: "Invalid role selected." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from("users").insert([
    {
      full_name: fullName,
      email: email,
      phone_number: phone,
      password_hash: passwordHash,
      role_id: roleData.id,
      status: "pending",
      is_active: false,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password required." };
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("email", email)
    .single();

  if (error || !user) {
    console.error("Supabase error fetching user: ", error);
    return { error: "Invalid email or password." };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { error: "Invalid email or password." };
  }

  if (user.status === "pending") {
    return { error: "Waiting for admin approval. Your account is pending." };
  }
  
  if (user.status === "rejected") {
    return { error: `Account rejected. Reason: ${user.rejection_reason}` };
  }

  if (!user.is_active) {
    return { error: "Account is inactive." };
  }

  // Create session
  await createSession({
    id: user.id,
    email: user.email,
    role: user.roles?.name,
    full_name: user.full_name
  });

  return { success: true, role: user.roles?.name };
}

export async function logoutUser() {
  await clearSession();
  redirect("/login");
}

export async function getCurrentUser() {
  return await getSession();
}
