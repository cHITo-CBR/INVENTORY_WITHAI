"use server";

import pool from "@/lib/mysql";

export interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  metadata: any;
  created_at: string;
  full_name: string | null;
}

export async function getAuditLogs(): Promise<AuditLogRow[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT al.*, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 50
    `) as any;
    return rows;
  } catch (err) {
    console.error("getAuditLogs error:", err);
    return [];
  }
}
