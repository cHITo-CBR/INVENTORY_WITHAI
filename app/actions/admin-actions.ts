"use server";

import { query } from "@/lib/mysql";
import { revalidatePath } from "next/cache";

export async function getPendingUsers() {
  try {
    const users = await query<any[]>(
      `SELECT u.id, u.full_name, u.email, u.phone_number, u.created_at, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.status = 'pending'
       ORDER BY u.created_at DESC`
    );
    
    // Map to expected format
    return users.map(u => ({
      ...u,
      roles: { name: u.role_name }
    }));
  } catch (error) {
    console.error("getPendingUsers error:", error);
    return [];
  }
}

export async function approveUser(userId: string) {
  try {
    await query(
      "UPDATE users SET status = 'active', is_active = true WHERE id = ?",
      [userId]
    );
    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("approveUser error:", error);
    return { success: false, error: "Failed to approve user" };
  }
}

export async function rejectUser(userId: string) {
  try {
    await query(
      "UPDATE users SET status = 'rejected', is_active = false WHERE id = ?",
      [userId]
    );
    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("rejectUser error:", error);
    return { success: false, error: "Failed to reject user" };
  }
}
