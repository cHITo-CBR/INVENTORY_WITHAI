"use server";

import { supabase } from "@/lib/supabase";

export interface DashboardKPIs {
  totalUsers: number;
  pendingApprovals: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
}

export interface RecentTransaction {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface LowStockItem {
  variant_name: string;
  balance: number;
}

async function safeCount(table: string, filter?: { column: string; value: string | number }): Promise<number> {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) {
      query = query.eq(filter.column, filter.value);
    }
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const [totalUsers, pendingApprovals, totalCustomers, totalProducts] = await Promise.all([
    safeCount("users"),
    safeCount("users", { column: "status", value: "pending" }),
    safeCount("users", { column: "role_id", value: 4 }), // Role ID 4 is for 'buyer'
    safeCount("products"),
  ]);

  // These require tables that may not exist yet
  const lowStockItems = 0;
  const totalSales = 0;

  return {
    totalUsers,
    pendingApprovals,
    totalCustomers,
    totalProducts,
    lowStockItems,
    totalSales,
  };
}

export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  try {
    const { data, error } = await supabase
      .from("sales_transactions")
      .select("id, total_amount, status, created_at, customers(store_name)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      customer_name: t.customers?.store_name ?? "Unknown",
      total_amount: t.total_amount ?? 0,
      status: t.status ?? "unknown",
      created_at: t.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  // This will return empty until inventory_ledger table exists
  try {
    const { data, error } = await supabase
      .from("inventory_ledger")
      .select("balance, product_variants(name)")
      .lt("balance", 10)
      .order("balance", { ascending: true })
      .limit(5);

    if (error || !data) return [];

    return data.map((item: any) => ({
      variant_name: item.product_variants?.name ?? "Unknown SKU",
      balance: item.balance ?? 0,
    }));
  } catch {
    return [];
  }
}
