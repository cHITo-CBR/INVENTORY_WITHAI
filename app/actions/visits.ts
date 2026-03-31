"use server";

import { query } from "@/lib/mysql";

export interface VisitRow {
  id: string;
  visit_date: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  customers: {
    store_name: string;
    address: string | null;
  } | null;
}

export interface VisitReportDetail {
  id: string;
  visit_date: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  customers: { store_name: string } | null;
  users: { full_name: string } | null;
  store_visit_skus: {
    id: string;
    notes: string | null;
    product_variants: { name: string; sku: string | null } | null;
  }[];
}

/**
 * Fetches all store visits for a specific salesman.
 */
export async function getSalesmanVisits(salesmanId: string): Promise<VisitRow[]> {
  try {
    const rows = await query<any[]>(
      `SELECT sv.*, c.store_name, c.address 
       FROM store_visits sv
       LEFT JOIN customers c ON sv.customer_id = c.id
       WHERE sv.salesman_id = ? 
       ORDER BY sv.visit_date DESC, sv.created_at DESC`,
      [salesmanId]
    );

    // Map to expected structure for frontend
    return rows.map(row => ({
      id: row.id,
      visit_date: row.visit_date,
      notes: row.notes,
      latitude: row.latitude,
      longitude: row.longitude,
      created_at: row.created_at,
      customers: {
        store_name: row.store_name,
        address: row.address
      }
    }));
  } catch (error) {
    console.error("getSalesmanVisits error:", error);
    return [];
  }
}

/**
 * Fetches detailed report of a single visit, including SKU data.
 */
export async function getVisitReport(id: string): Promise<VisitReportDetail | null> {
  try {
    const [visit] = await query<any[]>(
      `SELECT sv.*, c.store_name, u.full_name as salesman_name 
       FROM store_visits sv 
       LEFT JOIN customers c ON sv.customer_id = c.id 
       LEFT JOIN users u ON sv.salesman_id = u.id 
       WHERE sv.id = ?`,
      [id]
    );

    if (!visit) return null;

    const items = await query<any[]>(
      `SELECT svs.*, pv.name as variant_name, pv.sku as variant_sku 
       FROM store_visit_skus svs 
       LEFT JOIN product_variants pv ON svs.variant_id = pv.id 
       WHERE svs.visit_id = ?`,
      [id]
    );

    return {
      id: visit.id,
      visit_date: visit.visit_date,
      notes: visit.notes,
      latitude: visit.latitude,
      longitude: visit.longitude,
      customers: { store_name: visit.store_name },
      users: { full_name: visit.salesman_name },
      store_visit_skus: items.map(item => ({
        id: item.id,
        notes: item.notes,
        product_variants: {
          name: item.variant_name,
          sku: item.variant_sku
        }
      }))
    };
  } catch (error) {
    console.error("getVisitReport error:", error);
    return null;
  }
}
