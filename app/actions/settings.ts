"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface SettingRow {
  id: number;
  key: string;
  value: string | null;
  updated_at: string;
}

export async function getSettings(): Promise<SettingRow[]> {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("key");

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function updateSetting(key: string, value: string) {
  const { data: existing } = await supabase
    .from("system_settings")
    .select("id")
    .eq("key", key)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("system_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("system_settings")
      .insert([{ key, value }]);
    if (error) return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}
