"use server";

import { query } from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export interface CreateStoreVisitInput {
  customer_id: string;
  salesman_id: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Records a new store visit.
 */
export async function createStoreVisit(input: CreateStoreVisitInput) {
  const visitId = randomUUID();
  const today = new Date().toISOString().split('T')[0];

  try {
    await query(
      `INSERT INTO store_visits (id, customer_id, salesman_id, visit_date, notes, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [visitId, input.customer_id, input.salesman_id, today, input.notes, input.latitude, input.longitude]
    );

    revalidatePath("/salesman/dashboard");
    revalidatePath("/salesman/visits");
    return { success: true, data: { id: visitId } };
  } catch (error: any) {
    console.error("createStoreVisit error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets visits for a specific salesman.
 */
export async function getSalesmanVisits(salesmanId: string) {
  try {
    const data = await query<any[]>(
      `SELECT sv.*, c.store_name, c.address 
       FROM store_visits sv
       LEFT JOIN customers c ON sv.customer_id = c.id
       WHERE sv.salesman_id = ? 
       ORDER BY sv.visit_date DESC`,
      [salesmanId]
    );

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
