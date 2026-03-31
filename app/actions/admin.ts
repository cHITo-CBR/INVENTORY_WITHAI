"use server";

import { query } from "@/lib/mysql";
import { getCurrentUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

// Utility Server action to approve user
export async function approveUser(userId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await query(
      `UPDATE users 
       SET status = 'approved', 
           is_active = TRUE, 
           approved_by = ?, 
           approved_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [user.id, userId]
    );

    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Utility Server action to reject user
export async function rejectUser(userId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await query(
      `UPDATE users 
       SET status = 'rejected', 
           is_active = FALSE, 
           rejection_reason = ? 
       WHERE id = ?`,
      [reason, userId]
    );

    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
