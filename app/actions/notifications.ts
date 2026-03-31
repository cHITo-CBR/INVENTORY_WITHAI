"use server";

import { query } from "@/lib/mysql";
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
    const user = await getCurrentUser();
    if (!user) return [];

    const rows = await query<NotificationRow[]>(
      "SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );

    return rows || [];
  } catch (error) {
    console.error("getNotifications error:", error);
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const [result] = await query<any[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [user.id]
    );

    return result?.count ?? 0;
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return 0;
  }
}

export async function markNotificationRead(id: string) {
  try {
    await query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ?",
      [id]
    );

    revalidatePath("/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markAllRead() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    await query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [user.id]
    );

    revalidatePath("/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
