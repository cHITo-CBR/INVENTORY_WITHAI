"use server";

import pool from "@/lib/mysql";

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

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    const [[userCount]] = await pool.execute("SELECT COUNT(*) as count FROM users") as any;
    const [[pendingCount]] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE status = 'pending'") as any;
    const [[customerCount]] = await pool.execute("SELECT COUNT(*) as count FROM customers") as any;
    const [[productCount]] = await pool.execute("SELECT COUNT(*) as count FROM products") as any;
    
    // Low stock: count variants whose latest balance is < 10
    const [lowStockRows] = await pool.execute(`
      SELECT COUNT(*) as count FROM (
        SELECT balance FROM inventory_ledger il1
        WHERE created_at = (
          SELECT MAX(created_at) FROM inventory_ledger il2 
          WHERE il2.variant_id = il1.variant_id
        )
        AND balance < 10
      ) as sub
    `) as any;

    // Total sales: sum of total_amount from completed/approved transactions
    const [[salesSum]] = await pool.execute("SELECT SUM(total_amount) as total FROM sales_transactions WHERE status = 'completed' OR status = 'approved'") as any;

    return {
      totalUsers: userCount?.count ?? 0,
      pendingApprovals: pendingCount?.count ?? 0,
      totalCustomers: customerCount?.count ?? 0,
      totalProducts: productCount?.count ?? 0,
      lowStockItems: lowStockRows[0]?.count ?? 0,
      totalSales: salesSum?.total ?? 0,
    };
  } catch (err) {
    console.error("getDashboardKPIs error:", err);
    return {
      totalUsers: 0,
      pendingApprovals: 0,
      totalCustomers: 0,
      totalProducts: 0,
      lowStockItems: 0,
      totalSales: 0,
    };
  }
}

export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT st.id, st.total_amount, st.status, st.created_at, c.store_name as customer_name
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.id
      ORDER BY st.created_at DESC
      LIMIT 5
    `) as any;

    return rows;
  } catch (err) {
    console.error("getRecentTransactions error:", err);
    return [];
  }
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT pv.name as variant_name, il.balance
      FROM inventory_ledger il
      JOIN product_variants pv ON il.variant_id = pv.id
      WHERE il.created_at = (
        SELECT MAX(created_at) FROM inventory_ledger il2 
        WHERE il2.variant_id = il.variant_id
      )
      AND il.balance < 10
      ORDER BY il.balance ASC
      LIMIT 5
    `) as any;

    return rows;
  } catch (err) {
    console.error("getLowStockItems error:", err);
    return [];
  }
}
