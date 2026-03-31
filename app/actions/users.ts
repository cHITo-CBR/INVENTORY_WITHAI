"use server";

import pool from "@/lib/mysql";
import { getCurrentUser } from "@/app/actions/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  role_name: string | null;
}

export async function getUsers(search?: string, roleFilter?: string): Promise<UserRow[]> {
  try {
    let sql = `
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (roleFilter && roleFilter !== "all") {
      sql += " AND r.name = ?";
      params.push(roleFilter);
    }

    if (search && search.trim()) {
      sql += " AND (u.full_name LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY u.created_at DESC";

    const [rows] = await pool.execute(sql, params) as any;
    return rows;
  } catch (err) {
    console.error("getUsers error:", err);
    return [];
  }
}

export async function getRoles(): Promise<{ id: number; name: string }[]> {
  try {
    const [rows] = await pool.execute("SELECT id, name FROM roles ORDER BY name") as any;
    return rows;
  } catch (err) {
    console.error("getRoles error:", err);
    return [];
  }
}

export async function createUser(formData: FormData) {
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

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.execute(
      "INSERT INTO users (id, full_name, email, phone_number, password_hash, role_id, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        fullName,
        email,
        phone || null,
        passwordHash,
        parseInt(roleId),
        "active",
        true,
      ]
    );

    revalidatePath("/users");
    return { success: true };
  } catch (err: any) {
    console.error("createUser error:", err);
    return { error: err.message };
  }
}
