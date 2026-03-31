"use server";

import { query } from "@/lib/mysql";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface SupervisorKPIs {
  activeSalesmen: number;
  visitsToday: number;
  submittedCallsheets: number;
  pendingCallsheetReviews: number;
  pendingRequests: number;
  pendingBookings: number;
  monthlySalesTotal: number;
  lowStockItems: number;
}

export interface TeamSalesman {
  id: string;
  full_name: string;
  email: string;
  status: string;
  visitsToday: number;
  totalCallsheets: number;
  pendingRequests: number;
  confirmedBookings: number;
  monthlySales: number;
}

// ══════════════════════════════════════════════════════════════
// SUPERVISOR DASHBOARD
// ══════════════════════════════════════════════════════════════

export async function getSupervisorKPIs(): Promise<SupervisorKPIs> {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  try {
    const [
      activeSalesmen,
      visitsToday,
      submittedCallsheets,
      pendingRequests,
      pendingBookings,
      salesData,
      lowStockItems,
    ] = await Promise.all([
      query<any[]>("SELECT COUNT(*) as count FROM users WHERE role_id = 3 AND is_active = TRUE"),
      query<any[]>("SELECT COUNT(*) as count FROM store_visits WHERE visit_date >= ?", [today]),
      query<any[]>("SELECT COUNT(*) as count FROM callsheets WHERE status = 'submitted'"),
      query<any[]>("SELECT COUNT(*) as count FROM buyer_requests WHERE status = 'pending'"),
      query<any[]>("SELECT COUNT(*) as count FROM sales_transactions WHERE status = 'pending'"),
      query<any[]>("SELECT SUM(total_amount) as total FROM sales_transactions WHERE created_at >= ?", [monthStart]),
      query<any[]>("SELECT COUNT(*) as count FROM inventory_ledger WHERE balance < 10"),
    ]);

    return {
      activeSalesmen: activeSalesmen[0]?.count ?? 0,
      visitsToday: visitsToday[0]?.count ?? 0,
      submittedCallsheets: submittedCallsheets[0]?.count ?? 0,
      pendingCallsheetReviews: submittedCallsheets[0]?.count ?? 0,
      pendingRequests: pendingRequests[0]?.count ?? 0,
      pendingBookings: pendingBookings[0]?.count ?? 0,
      monthlySalesTotal: parseFloat(salesData[0]?.total) || 0,
      lowStockItems: lowStockItems[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("getSupervisorKPIs error:", error);
    return {
      activeSalesmen: 0,
      visitsToday: 0,
      submittedCallsheets: 0,
      pendingCallsheetReviews: 0,
      pendingRequests: 0,
      pendingBookings: 0,
      monthlySalesTotal: 0,
      lowStockItems: 0,
    };
  }
}

// ══════════════════════════════════════════════════════════════
// TEAM MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamSalesmen(): Promise<TeamSalesman[]> {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  try {
    const salesmen = await query<any[]>(
      "SELECT id, full_name, email, status, is_active FROM users WHERE role_id = 3 ORDER BY full_name"
    );

    const results = await Promise.all(
      salesmen.map(async (s) => {
        const [stats] = await query<any[]>(
          `SELECT 
            (SELECT COUNT(*) FROM store_visits WHERE salesman_id = ? AND visit_date >= ?) as visitsToday,
            (SELECT COUNT(*) FROM callsheets WHERE salesman_id = ?) as totalCallsheets,
            (SELECT COUNT(*) FROM buyer_requests WHERE salesman_id = ? AND status = 'pending') as pendingRequests,
            (SELECT COUNT(*) FROM sales_transactions WHERE salesman_id = ? AND status != 'cancelled') as confirmedBookings,
            (SELECT SUM(total_amount) FROM sales_transactions WHERE salesman_id = ? AND created_at >= ?) as monthlySales`,
          [s.id, today, s.id, s.id, s.id, s.id, monthStart]
        );

        return {
          id: s.id,
          full_name: s.full_name,
          email: s.email,
          status: s.is_active ? "active" : "inactive",
          visitsToday: stats.visitsToday || 0,
          totalCallsheets: stats.totalCallsheets || 0,
          pendingRequests: stats.pendingRequests || 0,
          confirmedBookings: stats.confirmedBookings || 0,
          monthlySales: parseFloat(stats.monthlySales) || 0,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("getTeamSalesmen error:", error);
    return [];
  }
}

export async function getSalesmanDetail(salesmanId: string) {
  try {
    const [profile] = await query<any[]>(
      "SELECT id, full_name, email, phone_number, status, created_at FROM users WHERE id = ?",
      [salesmanId]
    );

    const [visits, callsheets, requests, bookings] = await Promise.all([
      query<any[]>(
        `SELECT sv.*, c.store_name FROM store_visits sv 
         LEFT JOIN customers c ON sv.customer_id = c.id 
         WHERE sv.salesman_id = ? ORDER BY sv.visit_date DESC LIMIT 20`,
        [salesmanId]
      ),
      query<any[]>(
        `SELECT cs.*, c.store_name FROM callsheets cs 
         LEFT JOIN customers c ON cs.customer_id = c.id 
         WHERE cs.salesman_id = ? ORDER BY cs.created_at DESC LIMIT 20`,
        [salesmanId]
      ),
      query<any[]>(
        `SELECT br.*, c.store_name FROM buyer_requests br 
         LEFT JOIN customers c ON br.customer_id = c.id 
         WHERE br.salesman_id = ? ORDER BY br.created_at DESC LIMIT 20`,
        [salesmanId]
      ),
      query<any[]>(
        `SELECT st.*, c.store_name FROM sales_transactions st 
         LEFT JOIN customers c ON st.customer_id = c.id 
         WHERE st.salesman_id = ? ORDER BY st.created_at DESC LIMIT 20`,
        [salesmanId]
      ),
    ]);

    // Fetch items for requests
    const requestsWithItems = await Promise.all((requests || []).map(async (r) => {
      const items = await query<any[]>(
        "SELECT bri.*, p.name as product_name FROM buyer_request_items bri LEFT JOIN products p ON bri.product_id = p.id WHERE bri.request_id = ?",
        [r.id]
      );
      return { ...r, buyer_request_items: items };
    }));

    return { profile, visits: visits || [], callsheets: callsheets || [], requests: requestsWithItems, bookings: bookings || [] };
  } catch (error) {
    console.error("getSalesmanDetail error:", error);
    return { profile: null, visits: [], callsheets: [], requests: [], bookings: [] };
  }
}

// ══════════════════════════════════════════════════════════════
// CUSTOMERS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamCustomers() {
  try {
    const data = await query<any[]>(
      `SELECT c.*, u.full_name as salesman_name 
       FROM customers c 
       LEFT JOIN users u ON c.assigned_salesman_id = u.id 
       WHERE c.is_active = TRUE ORDER BY c.store_name`
    );
    return data || [];
  } catch (error) {
    console.error("getTeamCustomers error:", error);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// VISITS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamVisits() {
  try {
    const data = await query<any[]>(
      `SELECT sv.*, c.store_name, u.full_name as salesman_name 
       FROM store_visits sv 
       LEFT JOIN customers c ON sv.customer_id = c.id 
       LEFT JOIN users u ON sv.salesman_id = u.id 
       ORDER BY sv.visit_date DESC LIMIT 100`
    );
    return data || [];
  } catch (error) {
    console.error("getTeamVisits error:", error);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// CALLSHEETS
// ══════════════════════════════════════════════════════════════

export async function getCallsheetDetail(callsheetId: string) {
  try {
    const [callsheet] = await query<any[]>(
      `SELECT cs.*, c.store_name, c.address, u.full_name as salesman_name, u.email as salesman_email 
       FROM callsheets cs 
       LEFT JOIN customers c ON cs.customer_id = c.id 
       LEFT JOIN users u ON cs.salesman_id = u.id 
       WHERE cs.id = ?`,
      [callsheetId]
    );

    if (!callsheet) return null;

    const items = await query<any[]>(
      `SELECT ci.*, p.name as product_name, p.total_packaging, p.net_weight 
       FROM callsheet_items ci 
       LEFT JOIN products p ON ci.product_id = p.id 
       WHERE ci.callsheet_id = ?`,
      [callsheetId]
    );

    return { ...callsheet, callsheet_items: items };
  } catch (error) {
    console.error("getCallsheetDetail error:", error);
    return null;
  }
}

export async function reviewCallsheet(callsheetId: string, status: "approved" | "rejected", supervisorNote?: string) {
  try {
    await query(
      "UPDATE callsheets SET status = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, supervisorNote || null, callsheetId]
    );
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ══════════════════════════════════════════════════════════════
// BUYER REQUESTS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamBuyerRequests() {
  try {
    const requests = await query<any[]>(
      `SELECT br.*, c.store_name, u.full_name as salesman_name 
       FROM buyer_requests br 
       LEFT JOIN customers c ON br.customer_id = c.id 
       LEFT JOIN users u ON br.salesman_id = u.id 
       ORDER BY br.created_at DESC LIMIT 100`
    );

    const results = await Promise.all((requests || []).map(async (r) => {
      const items = await query<any[]>(
        "SELECT bri.*, p.name as product_name FROM buyer_request_items bri LEFT JOIN products p ON bri.product_id = p.id WHERE bri.request_id = ?",
        [r.id]
      );
      return { ...r, buyer_request_items: items };
    }));

    return results;
  } catch (error) {
    console.error("getTeamBuyerRequests error:", error);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// BOOKINGS / ORDERS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamBookings() {
  try {
    const data = await query<any[]>(
      `SELECT st.*, c.store_name, u.full_name as salesman_name 
       FROM sales_transactions st 
       LEFT JOIN customers c ON st.customer_id = c.id 
       LEFT JOIN users u ON st.salesman_id = u.id 
       ORDER BY st.created_at DESC LIMIT 100`
    );
    return data || [];
  } catch (error) {
    console.error("getTeamBookings error:", error);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// INVENTORY IMPACT VIEW
// ══════════════════════════════════════════════════════════════

export async function getInventoryImpact() {
  try {
    const lowStock = await query<any[]>(
      `SELECT il.*, pv.name as variant_name, pv.sku, p.name as product_name 
       FROM inventory_ledger il 
       LEFT JOIN product_variants pv ON il.variant_id = pv.id 
       LEFT JOIN products p ON pv.product_id = p.id 
       WHERE il.balance < 10 ORDER BY il.balance ASC LIMIT 20`
    );

    const recentMovements = await query<any[]>(
      `SELECT il.*, pv.name as variant_name, pv.sku, p.name as product_name, imt.name as movement_name, imt.direction 
       FROM inventory_ledger il 
       LEFT JOIN product_variants pv ON il.variant_id = pv.id 
       LEFT JOIN products p ON pv.product_id = p.id 
       LEFT JOIN inventory_movement_types imt ON il.movement_type_id = imt.id 
       ORDER BY il.created_at DESC LIMIT 20`
    );

    return { lowStock: lowStock || [], recentMovements: recentMovements || [] };
  } catch (error) {
    console.error("getInventoryImpact error:", error);
    return { lowStock: [], recentMovements: [] };
  }
}

// ══════════════════════════════════════════════════════════════
// RECENT ACTIVITY
// ══════════════════════════════════════════════════════════════

export async function getRecentTeamActivity() {
  try {
    const [visits, callsheets, requests] = await Promise.all([
      query<any[]>(`SELECT sv.id, sv.visit_date, sv.created_at, c.store_name, u.full_name as salesman_name FROM store_visits sv LEFT JOIN customers c ON sv.customer_id = c.id LEFT JOIN users u ON sv.salesman_id = u.id ORDER BY sv.created_at DESC LIMIT 5`),
      query<any[]>(`SELECT cs.id, cs.status, cs.created_at, c.store_name, u.full_name as salesman_name FROM callsheets cs LEFT JOIN customers c ON cs.customer_id = c.id LEFT JOIN users u ON cs.salesman_id = u.id ORDER BY cs.created_at DESC LIMIT 5`),
      query<any[]>(`SELECT br.id, br.status, br.created_at, c.store_name, u.full_name as salesman_name FROM buyer_requests br LEFT JOIN customers c ON br.customer_id = c.id LEFT JOIN users u ON br.salesman_id = u.id ORDER BY br.created_at DESC LIMIT 5`),
    ]);

    return { visits: visits || [], callsheets: callsheets || [], requests: requests || [] };
  } catch (error) {
    console.error("getRecentTeamActivity error:", error);
    return { visits: [], callsheets: [], requests: [] };
  }
}
