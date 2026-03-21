"use server";

import { supabase } from "@/lib/supabase";

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

    // Parallel counts
    const [visits, pendingCS, submittedCS, buyerReqs, bookings] = await Promise.all([
      // Today's visits
      supabase.from("store_visits")
        .select("*", { count: "exact", head: true })
        .eq("salesman_id", userId)
        .gte("visit_date", `${today}T00:00:00Z`),

      // Pending (Draft) Callsheets
      supabase.from("callsheets")
        .select("*", { count: "exact", head: true })
        .eq("salesman_id", userId)
        .eq("status", "draft"),

      // Submitted Callsheets
      supabase.from("callsheets")
        .select("*", { count: "exact", head: true })
        .eq("salesman_id", userId)
        .eq("status", "submitted"),

      // Pending Buyer Requests
      supabase.from("buyer_requests")
        .select("*", { count: "exact", head: true })
        .eq("salesman_id", userId)
        .eq("status", "pending"),

      // Confirmed Bookings (Sales Transactions)
      supabase.from("sales_transactions")
        .select("*", { count: "exact", head: true })
        .eq("salesman_id", userId)
        .eq("status", "completed")
    ]);

    return {
      todayVisits: visits.count ?? 0,
      pendingCallsheets: pendingCS.count ?? 0,
      submittedCallsheets: submittedCS.count ?? 0,
      pendingBuyerRequests: buyerReqs.count ?? 0,
      confirmedBookings: bookings.count ?? 0
    };
  } catch (err) {
    console.error("Salesman KPI error:", err);
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
    const { data: visits } = await supabase
      .from("store_visits")
      .select("*, customers(store_name)")
      .eq("salesman_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: callsheets } = await supabase
      .from("callsheets")
      .select("*, customers(store_name)")
      .eq("salesman_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3);

    return {
      visits: visits ?? [],
      callsheets: callsheets ?? []
    };
  } catch {
    return { visits: [], callsheets: [] };
  }
}
