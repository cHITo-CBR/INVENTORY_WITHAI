"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface BuyerRequestItemInput {
  product_id: string;
  quantity: number;
  notes?: string;
}

export interface CreateBuyerRequestInput {
  salesman_id: string;
  customer_id: string;
  notes?: string;
  items: BuyerRequestItemInput[];
}

/**
 * Creates a new buyer request and its items.
 */
export async function createBuyerRequest(input: CreateBuyerRequestInput) {
  try {
    const { salesman_id, customer_id, notes, items } = input;

    // 1. Create request header
    const { data: request, error: requestError } = await supabase
      .from("buyer_requests")
      .insert({
        salesman_id,
        customer_id,
        notes,
        status: "pending"
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // 2. Insert items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        request_id: request.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from("buyer_request_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    revalidatePath("/salesman/dashboard");
    revalidatePath("/salesman/requests");
    return { success: true, data: request };
  } catch (error: any) {
    console.error("createBuyerRequest error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches buyer requests for a salesman.
 */
export async function getSalesmanBuyerRequests(salesmanId: string) {
  try {
    const { data, error } = await supabase
      .from("buyer_requests")
      .select(`
        *,
        customers (store_name),
        buyer_request_items (
           *,
           products (name)
        )
      `)
      .eq("salesman_id", salesmanId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════

/**
 * Fetches ALL buyer requests for admin review.
 */
export async function getAllBuyerRequests() {
  try {
    const { data, error } = await supabase
      .from("buyer_requests")
      .select(`
        *,
        customers (store_name),
        users:salesman_id (full_name),
        buyer_request_items (
          *,
          products (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("getAllBuyerRequests error:", error);
    return [];
  }
}

/**
 * Updates a buyer request status (fulfill/reject).
 */
export async function updateBuyerRequestStatus(requestId: string, status: string) {
  try {
    const { error } = await supabase
      .from("buyer_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) throw error;

    revalidatePath("/buyer-requests");
    revalidatePath("/salesman/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
