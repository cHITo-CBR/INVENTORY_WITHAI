"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export interface NotificationRow {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<NotificationRow[]> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, type, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllRead() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}
