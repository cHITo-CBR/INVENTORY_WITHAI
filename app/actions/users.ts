"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/app/actions/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  roles: { name: string } | null;
}

export async function getUsers(search?: string, roleFilter?: string): Promise<UserRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("users")
      .select("id, full_name, email, phone_number, status, is_active, created_at, roles(name)")
      .order("created_at", { ascending: false });

    if (roleFilter && roleFilter !== "all") {
      const supabase = await createClient();
      const { data: roleData } = await supabase
        .from("roles")
        .select("id")
        .eq("name", roleFilter)
        .single();
      if (roleData) {
        query = query.eq("role_id", roleData.id);
      }
    }

    if (search && search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as any as UserRow[];
  } catch {
    return [];
  }
}

export async function getRoles(): Promise<{ id: number; name: string }[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("roles").select("id, name").order("name");
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createUser(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const roleId = formData.get("roleId") as string;

  if (!fullName || !email || !password || !roleId) {
    return { error: "Missing required fields." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from("users").insert([
    {
      full_name: fullName,
      email,
      phone_number: phone || null,
      password_hash: passwordHash,
      role_id: parseInt(roleId),
      status: "approved",
      is_active: true,
    },
  ]);

  if (error) return { error: error.message };

  revalidatePath("/users");
  return { success: true };
}
