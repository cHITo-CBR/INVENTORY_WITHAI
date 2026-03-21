"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
  try {
    const { salesman_id, customer_id, visit_date, period_start, period_end, round_number, remarks, items } = input;

    // 1. Create the callsheet header
    const { data: callsheet, error: callsheetError } = await supabase
      .from("callsheets")
      .insert({
        salesman_id,
        customer_id,
        visit_date,
        period_start,
        period_end,
        round_number,
        remarks,
        status: "draft",
      })
      .select()
      .single();

    if (callsheetError) throw callsheetError;

    // 2. Insert items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        callsheet_id: callsheet.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from("callsheet_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    revalidatePath("/salesman/callsheets");
    return { success: true, data: callsheet };
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
    const { error } = await supabase
      .from("callsheets")
      .update({ status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", callsheetId);

    if (error) throw error;

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
    const { data, error } = await supabase
      .from("callsheets")
      .select(`
        *,
        customers (store_name)
      `)
      .eq("salesman_id", salesmanId)
      .order("created_at", { ascending: false });

    if (error) throw error;
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
    const { data: callsheet, error: callsheetError } = await supabase
      .from("callsheets")
      .select(`
        *,
        customers (store_name),
        callsheet_items (*)
      `)
      .eq("id", callsheetId)
      .single();

    if (callsheetError) throw callsheetError;
    return { success: true, data: callsheet };
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
    const { data, error } = await supabase
      .from("callsheets")
      .select(`
        *,
        customers (store_name),
        users:salesman_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
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
    const { error } = await supabase
      .from("callsheets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", callsheetId);

    if (error) throw error;

    revalidatePath("/callsheets");
    revalidatePath("/salesman/callsheets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
