"use server";

import { query } from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

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
  const requestId = randomUUID();
  
  try {
    const { salesman_id, customer_id, notes, items } = input;

    // 1. Create request header
    await query(
      `INSERT INTO buyer_requests (id, salesman_id, customer_id, notes, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [requestId, salesman_id, customer_id, notes]
    );

    // 2. Insert items
    if (items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO buyer_request_items (id, request_id, product_id, quantity, notes) 
           VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), requestId, item.product_id, item.quantity, item.notes]
        );
      }
    }

    revalidatePath("/salesman/dashboard");
    revalidatePath("/salesman/requests");
    return { success: true, data: { id: requestId } };
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
    const requests = await query<any[]>(
      `SELECT br.*, c.store_name 
       FROM buyer_requests br
       LEFT JOIN customers c ON br.customer_id = c.id
       WHERE br.salesman_id = ? 
       ORDER BY br.created_at DESC`,
      [salesmanId]
    );

    // Fetch items for each request
    const results = await Promise.all(
      requests.map(async (req) => {
        const items = await query<any[]>(
          `SELECT bri.*, p.name as product_name
           FROM buyer_request_items bri
           LEFT JOIN products p ON bri.product_id = p.id
           WHERE bri.request_id = ?`,
          [req.id]
        );
        return { ...req, buyer_request_items: items };
      })
    );

    return { success: true, data: results };
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
    const requests = await query<any[]>(
      `SELECT br.*, c.store_name, u.full_name as salesman_name
       FROM buyer_requests br
       LEFT JOIN customers c ON br.customer_id = c.id
       LEFT JOIN users u ON br.salesman_id = u.id
       ORDER BY br.created_at DESC`
    );

    // Fetch items for each request
    const results = await Promise.all(
      requests.map(async (req) => {
        const items = await query<any[]>(
          `SELECT bri.*, p.name as product_name
           FROM buyer_request_items bri
           LEFT JOIN products p ON bri.product_id = p.id
           WHERE bri.request_id = ?`,
          [req.id]
        );
        return { ...req, buyer_request_items: items };
      })
    );

    return results || [];
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
    await query(
      "UPDATE buyer_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, requestId]
    );

    revalidatePath("/buyer-requests");
    revalidatePath("/salesman/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
