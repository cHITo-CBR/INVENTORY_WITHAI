"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

// Utility Server action to approve user
export async function approveUser(userId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      status: "approved",
      is_active: true,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/approvals");
  return { success: true };
}

// Utility Server action to reject user
export async function rejectUser(userId: string, reason: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      status: "rejected",
      is_active: false,
      rejection_reason: reason,
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/approvals");
  return { success: true };
}
