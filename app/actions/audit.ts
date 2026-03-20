"use server";

import { supabase } from "@/lib/supabase";

export interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  metadata: any;
  created_at: string;
  users: { full_name: string } | null;
}

export async function getAuditLogs(): Promise<AuditLogRow[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, ip_address, metadata, created_at, users:user_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as any as AuditLogRow[];
  } catch {
    return [];
  }
}
