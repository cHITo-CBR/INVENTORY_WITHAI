"use server";

import pool from "@/lib/mysql";
import { revalidatePath } from "next/cache";

export interface SettingRow {
  id: number;
  key: string;
  value: string | null;
  updated_at: string;
}

export async function getSettings(): Promise<SettingRow[]> {
  try {
    const [rows] = await pool.execute("SELECT * FROM system_settings ORDER BY `key`") as any;
    return rows;
  } catch (err) {
    console.error("getSettings error:", err);
    return [];
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    const [rows] = await pool.execute("SELECT id FROM system_settings WHERE `key` = ?", [key]) as any;

    if (rows.length > 0) {
      await pool.execute(
        "UPDATE system_settings SET `value` = ? WHERE `key` = ?",
        [value, key]
      );
    } else {
      await pool.execute(
        "INSERT INTO system_settings (`key`, `value`) VALUES (?, ?)",
        [key, value]
      );
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err: any) {
    console.error("updateSetting error:", err);
    return { error: err.message };
  }
}
