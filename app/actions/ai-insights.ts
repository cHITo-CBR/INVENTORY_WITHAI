"use server";

import { supabase } from "@/lib/supabase";

export interface AIInsightRow {
  id: string;
  insight_type: string;
  title: string;
  description: string | null;
  severity: string;
  data: any;
  created_at: string;
}

export async function getAIInsights(): Promise<AIInsightRow[]> {
  try {
    const { data, error } = await supabase
      .from("ai_insights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
