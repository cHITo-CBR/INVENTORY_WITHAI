"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Utility Server action to approve user
export async function approveUser(userId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      status: "approved",
      is_active: true,
      approved_by: session.user.id,
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
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
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
