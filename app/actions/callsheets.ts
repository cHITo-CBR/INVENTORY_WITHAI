"use server";

import { query } from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export type CallsheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface CallsheetItemInput {
  product_id: string;
  packing?: string;
  p3?: number;
  ig?: number;
  inventory_cs?: number;
  inventory_pcs?: number;
  suggested_order?: number;
  final_order?: number;
  actual?: number;
}

export interface CreateCallsheetInput {
  salesman_id: string;
  customer_id: string;
  visit_date: string;
  period_start?: string;
  period_end?: string;
  round_number?: number;
  remarks?: string;
  items: CallsheetItemInput[];
}

/**
 * Creates a new callsheet and its associated items.
 */
export async function createCallsheet(input: CreateCallsheetInput) {
  const callsheetId = randomUUID();
  try {
    const { salesman_id, customer_id, visit_date, period_start, period_end, round_number, remarks, items } = input;

    // 1. Create the callsheet header
    await query(
      `INSERT INTO callsheets (id, salesman_id, customer_id, visit_date, period_start, period_end, round_number, remarks, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [callsheetId, salesman_id, customer_id, visit_date, period_start, period_end, round_number, remarks]
    );

    // 2. Insert items
    if (items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO callsheet_items (id, callsheet_id, product_id, packing, p3, ig, inventory_cs, inventory_pcs, suggested_order, final_order, actual) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(), callsheetId, item.product_id, item.packing, 
            item.p3 || 0, item.ig || 0, item.inventory_cs || 0, item.inventory_pcs || 0, 
            item.suggested_order || 0, item.final_order || 0, item.actual || 0
          ]
        );
      }
    }

    revalidatePath("/salesman/callsheets");
    return { success: true, data: { id: callsheetId } };
  } catch (error: any) {
    console.error("createCallsheet error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Submits a draft callsheet for approval.
 */
export async function submitCallsheet(callsheetId: string) {
  try {
    await query(
      "UPDATE callsheets SET status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [callsheetId]
    );

    revalidatePath("/salesman/dashboard");
    revalidatePath("/salesman/callsheets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches callsheets for a specific salesman.
 */
export async function getSalesmanCallsheets(salesmanId: string) {
  try {
    const data = await query<any[]>(
      `SELECT cs.*, c.store_name 
       FROM callsheets cs
       LEFT JOIN customers c ON cs.customer_id = c.id
       WHERE cs.salesman_id = ? 
       ORDER BY cs.created_at DESC`,
      [salesmanId]
    );

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches a single callsheet with its items.
 */
export async function getCallsheetWithItems(callsheetId: string) {
  try {
    const [callsheet] = await query<any[]>(
      `SELECT cs.*, c.store_name 
       FROM callsheets cs
       LEFT JOIN customers c ON cs.customer_id = c.id
       WHERE cs.id = ?`,
      [callsheetId]
    );

    if (!callsheet) return { success: false, error: "Callsheet not found" };

    const items = await query<any[]>(
      "SELECT * FROM callsheet_items WHERE callsheet_id = ?",
      [callsheetId]
    );

    return { success: true, data: { ...callsheet, callsheet_items: items } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════

/**
 * Fetches ALL callsheets for admin review (with salesman and customer info).
 */
export async function getAllCallsheets() {
  try {
    const data = await query<any[]>(
      `SELECT cs.*, c.store_name, u.full_name as salesman_name
       FROM callsheets cs
       LEFT JOIN customers c ON cs.customer_id = c.id
       LEFT JOIN users u ON cs.salesman_id = u.id
       ORDER BY cs.created_at DESC`
    );

    return data || [];
  } catch (error: any) {
    console.error("getAllCallsheets error:", error);
    return [];
  }
}

/**
 * Updates a callsheet's status (approve/reject).
 */
export async function updateCallsheetStatus(callsheetId: string, status: CallsheetStatus) {
  try {
    await query(
      "UPDATE callsheets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, callsheetId]
    );

    revalidatePath("/callsheets");
    revalidatePath("/salesman/callsheets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
