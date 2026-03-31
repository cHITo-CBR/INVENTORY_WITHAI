"use server";

import { query } from "@/lib/mysql";

export interface SalesmanKPIs {
  todayVisits: number;
  pendingCallsheets: number;
  submittedCallsheets: number;
  pendingBuyerRequests: number;
  confirmedBookings: number;
}

/**
 * Fetches KPIs for the salesman dashboard.
 */
export async function getSalesmanKPIs(userId: string): Promise<SalesmanKPIs> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Running scalar counts in parallel
    const [
      visitsResult,
      pendingCSResult,
      submittedCSResult,
      buyerReqsResult,
      bookingsResult
    ] = await Promise.all([
      query<any[]>("SELECT COUNT(*) as count FROM store_visits WHERE salesman_id = ? AND visit_date >= ?", [userId, today]),
      query<any[]>("SELECT COUNT(*) as count FROM callsheets WHERE salesman_id = ? AND status = 'draft'", [userId]),
      query<any[]>("SELECT COUNT(*) as count FROM callsheets WHERE salesman_id = ? AND status = 'submitted'", [userId]),
      query<any[]>("SELECT COUNT(*) as count FROM buyer_requests WHERE salesman_id = ? AND status = 'pending'", [userId]),
      query<any[]>("SELECT COUNT(*) as count FROM sales_transactions WHERE salesman_id = ? AND status = 'completed'", [userId]),
    ]);

    return {
      todayVisits: visitsResult[0]?.count ?? 0,
      pendingCallsheets: pendingCSResult[0]?.count ?? 0,
      submittedCallsheets: submittedCSResult[0]?.count ?? 0,
      pendingBuyerRequests: buyerReqsResult[0]?.count ?? 0,
      confirmedBookings: bookingsResult[0]?.count ?? 0
    };
  } catch (error) {
    console.error("Salesman KPI error:", error);
    return {
      todayVisits: 0,
      pendingCallsheets: 0,
      submittedCallsheets: 0,
      pendingBuyerRequests: 0,
      confirmedBookings: 0
    };
  }
}

/**
 * Gets recent activity for the salesman.
 */
export async function getSalesmanRecentActivity(userId: string) {
  try {
    const [visits, callsheets] = await Promise.all([
      query<any[]>(
        `SELECT sv.*, c.store_name 
         FROM store_visits sv 
         LEFT JOIN customers c ON sv.customer_id = c.id 
         WHERE sv.salesman_id = ? 
         ORDER BY sv.created_at DESC LIMIT 3`,
        [userId]
      ),
      query<any[]>(
        `SELECT cs.*, c.store_name 
         FROM callsheets cs 
         LEFT JOIN customers c ON cs.customer_id = c.id 
         WHERE cs.salesman_id = ? 
         ORDER BY cs.updated_at DESC LIMIT 3`,
        [userId]
      ),
    ]);

    return {
      visits: visits || [],
      callsheets: callsheets || []
    };
  } catch (error) {
    console.error("getSalesmanRecentActivity error:", error);
    return { visits: [], callsheets: [] };
  }
}

/**
 * Gets all bookings (sales transactions) for a salesman.
 */
export async function getSalesmanBookings(userId: string) {
  try {
    const bookings = await query<any[]>(
      `SELECT st.*, c.store_name 
       FROM sales_transactions st
       LEFT JOIN customers c ON st.customer_id = c.id
       WHERE st.salesman_id = ?
       ORDER BY st.created_at DESC`,
      [userId]
    );

    // Map to expected format (customers: { store_name })
    return bookings.map(b => ({
      ...b,
      customers: { store_name: b.store_name }
    }));
  } catch (error) {
    console.error("getSalesmanBookings error:", error);
    return [];
  }
}
