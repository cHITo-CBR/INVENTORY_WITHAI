"use server";

import { supabase } from "@/lib/supabase";

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
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [
    { count: activeSalesmen },
    { count: visitsToday },
    { count: submittedCallsheets },
    { count: pendingCallsheetReviews },
    { count: pendingRequests },
    { count: pendingBookings },
    salesData,
    { count: lowStockItems },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role_id", 3).eq("is_active", true),
    supabase.from("store_visits").select("*", { count: "exact", head: true }).gte("visit_date", today),
    supabase.from("callsheets").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("callsheets").select("*", { count: "exact", head: true }).in("status", ["submitted"]),
    supabase.from("buyer_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("sales_transactions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("sales_transactions").select("total_amount").gte("created_at", monthStart),
    supabase.from("inventory_ledger").select("*", { count: "exact", head: true }).lt("balance", 10),
  ]);

  const monthlySalesTotal = (salesData.data || []).reduce((sum: number, t: any) => sum + (parseFloat(t.total_amount) || 0), 0);

  return {
    activeSalesmen: activeSalesmen ?? 0,
    visitsToday: visitsToday ?? 0,
    submittedCallsheets: submittedCallsheets ?? 0,
    pendingCallsheetReviews: pendingCallsheetReviews ?? 0,
    pendingRequests: pendingRequests ?? 0,
    pendingBookings: pendingBookings ?? 0,
    monthlySalesTotal,
    lowStockItems: lowStockItems ?? 0,
  };
}

// ══════════════════════════════════════════════════════════════
// TEAM MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamSalesmen(): Promise<TeamSalesman[]> {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { data: salesmen, error } = await supabase
    .from("users")
    .select("id, full_name, email, status, is_active")
    .eq("role_id", 3)
    .order("full_name");

  if (error || !salesmen) return [];

  const results: TeamSalesman[] = await Promise.all(
    salesmen.map(async (s) => {
      const [
        { count: visitsToday },
        { count: totalCallsheets },
        { count: pendingRequests },
        { count: confirmedBookings },
        salesData,
      ] = await Promise.all([
        supabase.from("store_visits").select("*", { count: "exact", head: true }).eq("salesman_id", s.id).gte("visit_date", today),
        supabase.from("callsheets").select("*", { count: "exact", head: true }).eq("salesman_id", s.id),
        supabase.from("buyer_requests").select("*", { count: "exact", head: true }).eq("salesman_id", s.id).eq("status", "pending"),
        supabase.from("sales_transactions").select("*", { count: "exact", head: true }).eq("salesman_id", s.id).neq("status", "cancelled"),
        supabase.from("sales_transactions").select("total_amount").eq("salesman_id", s.id).gte("created_at", monthStart),
      ]);

      return {
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        status: s.is_active ? "active" : "inactive",
        visitsToday: visitsToday ?? 0,
        totalCallsheets: totalCallsheets ?? 0,
        pendingRequests: pendingRequests ?? 0,
        confirmedBookings: confirmedBookings ?? 0,
        monthlySales: (salesData.data || []).reduce((sum: number, t: any) => sum + (parseFloat(t.total_amount) || 0), 0),
      };
    })
  );

  return results;
}

export async function getSalesmanDetail(salesmanId: string) {
  const [
    { data: profile },
    { data: visits },
    { data: callsheets },
    { data: requests },
    { data: bookings },
  ] = await Promise.all([
    supabase.from("users").select("id, full_name, email, phone_number, status, created_at").eq("id", salesmanId).single(),
    supabase.from("store_visits").select("*, customers(store_name)").eq("salesman_id", salesmanId).order("visit_date", { ascending: false }).limit(20),
    supabase.from("callsheets").select("*, customers(store_name)").eq("salesman_id", salesmanId).order("created_at", { ascending: false }).limit(20),
    supabase.from("buyer_requests").select("*, customers(store_name), buyer_request_items(*, products(name))").eq("salesman_id", salesmanId).order("created_at", { ascending: false }).limit(20),
    supabase.from("sales_transactions").select("*, customers(store_name)").eq("salesman_id", salesmanId).order("created_at", { ascending: false }).limit(20),
  ]);

  return { profile, visits: visits || [], callsheets: callsheets || [], requests: requests || [], bookings: bookings || [] };
}

// ══════════════════════════════════════════════════════════════
// CUSTOMERS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*, users:assigned_salesman_id(full_name)")
    .eq("is_active", true)
    .order("store_name");

  if (error || !data) return [];
  return data;
}

// ══════════════════════════════════════════════════════════════
// VISITS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamVisits() {
  const { data, error } = await supabase
    .from("store_visits")
    .select("*, customers(store_name), users:salesman_id(full_name)")
    .order("visit_date", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data;
}

// ══════════════════════════════════════════════════════════════
// CALLSHEETS (reuses getAllCallsheets but adds detail fetch)
// ══════════════════════════════════════════════════════════════

export async function getCallsheetDetail(callsheetId: string) {
  const { data, error } = await supabase
    .from("callsheets")
    .select(`
      *,
      customers(store_name, address),
      users:salesman_id(full_name, email),
      callsheet_items(*, products(name, total_packaging, net_weight))
    `)
    .eq("id", callsheetId)
    .single();

  if (error) return null;
  return data;
}

export async function reviewCallsheet(callsheetId: string, status: "approved" | "rejected", supervisorNote?: string) {
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (supervisorNote) updateData.remarks = supervisorNote;

  const { error } = await supabase.from("callsheets").update(updateData).eq("id", callsheetId);
  if (error) return { error: error.message };
  return { success: true };
}

// ══════════════════════════════════════════════════════════════
// BUYER REQUESTS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamBuyerRequests() {
  const { data, error } = await supabase
    .from("buyer_requests")
    .select("*, customers(store_name), users:salesman_id(full_name), buyer_request_items(*, products(name))")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data;
}

// ══════════════════════════════════════════════════════════════
// BOOKINGS / ORDERS MONITORING
// ══════════════════════════════════════════════════════════════

export async function getTeamBookings() {
  const { data, error } = await supabase
    .from("sales_transactions")
    .select("*, customers(store_name), users:salesman_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data;
}

// ══════════════════════════════════════════════════════════════
// INVENTORY IMPACT VIEW
// ══════════════════════════════════════════════════════════════

export async function getInventoryImpact() {
  const { data: lowStock } = await supabase
    .from("inventory_ledger")
    .select("*, product_variants(name, sku, products:product_id(name))")
    .lt("balance", 10)
    .order("balance", { ascending: true })
    .limit(20);

  const { data: recentMovements } = await supabase
    .from("inventory_ledger")
    .select("*, product_variants(name, sku, products:product_id(name)), inventory_movement_types(name, direction)")
    .order("created_at", { ascending: false })
    .limit(20);

  return { lowStock: lowStock || [], recentMovements: recentMovements || [] };
}

// ══════════════════════════════════════════════════════════════
// RECENT ACTIVITY (for dashboard feed)
// ══════════════════════════════════════════════════════════════

export async function getRecentTeamActivity() {
  const [{ data: visits }, { data: callsheets }, { data: requests }] = await Promise.all([
    supabase.from("store_visits").select("id, visit_date, created_at, customers(store_name), users:salesman_id(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("callsheets").select("id, status, created_at, customers(store_name), users:salesman_id(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("buyer_requests").select("id, status, created_at, customers(store_name), users:salesman_id(full_name)").order("created_at", { ascending: false }).limit(5),
  ]);

  return { visits: visits || [], callsheets: callsheets || [], requests: requests || [] };
}
