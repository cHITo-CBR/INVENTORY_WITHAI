"use server";

import pool, { query } from "@/lib/mysql";
import { login, logout, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function registerUser(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const roleName = formData.get("role") as string;

  if (!fullName || !email || !password || !roleName) {
    return { error: "Missing required fields." };
  }

  try {
    // 1. Get role id
    const roles = await query<any[]>("SELECT id FROM roles WHERE name = ?", [roleName]);
    const roleData = roles[0];

    if (!roleData) {
      return { error: "Invalid role selected." };
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    // 3. Insert into MySQL users table
    await query(
      "INSERT INTO users (id, full_name, email, phone_number, password_hash, role_id, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, fullName, email, phone || null, passwordHash, roleData.id, "pending", false]
    );

    return { success: true };
  } catch (err: any) {
    console.error("Registration error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return { error: "Email already exists." };
    }
    return { error: "An unexpected error occurred during registration." };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password required." };
  }

  try {
    // 1. Find user in MySQL
    const [users] = await pool.execute(
      "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?",
      [email]
    ) as any;
    const user = users[0];

    if (!user) {
      return { error: "Invalid email or password." };
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { error: "Invalid email or password." };
    }

    // 3. Check status
    if (user.status === "pending") {
      return { error: "Waiting for admin approval. Your account is pending." };
    }
    
    if (user.status === "rejected") {
      return { error: "Account rejected." };
    }

    if (!user.is_active) {
      return { error: "Account is inactive." };
    }

    // 4. Create session
    const sessionUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role_name,
    };
    await login(sessionUser);

    return { success: true, role: user.role_name };
  } catch (err) {
    console.error("Login error:", err);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function logoutUser() {
  await logout();
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.user) return null;

    return {
      ...session.user,
      user: session.user
    };
  } catch (err) {
    console.error("Get current user error:", err);
    return null;
  }
}
