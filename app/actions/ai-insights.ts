"use server";

import { query } from "@/lib/mysql";

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
    const rows = await query<AIInsightRow[]>(
      "SELECT * FROM ai_insights ORDER BY created_at DESC"
    );

    return rows || [];
  } catch (error) {
    console.error("getAIInsights error:", error);
    return [];
  }
}
