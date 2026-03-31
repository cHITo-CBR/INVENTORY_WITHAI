"use server";

import pool from "@/lib/mysql";

export interface SalesTrendPoint {
  date: string;
  total: number;
}

export interface CategorySalesPoint {
  category: string;
  total: number;
}

export async function getSalesTrends(): Promise<SalesTrendPoint[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [rows] = await pool.execute(`
      SELECT total_amount, created_at 
      FROM sales_transactions 
      WHERE created_at >= ? 
      ORDER BY created_at ASC
    `, [thirtyDaysAgo]) as any;

    if (!rows || rows.length === 0) return [];

    // Group by date
    const grouped: Record<string, number> = {};
    rows.forEach((t: any) => {
      const date = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[date] = (grouped[date] || 0) + Number(t.total_amount ?? 0);
    });

    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
  } catch (err) {
    console.error("getSalesTrends error:", err);
    return [];
  }
}

export async function getTopCategories(): Promise<CategorySalesPoint[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT pc.name as category, SUM(sti.subtotal) as total
      FROM sales_transaction_items sti
      JOIN product_variants pv ON sti.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN product_categories pc ON p.category_id = pc.id
      GROUP BY pc.name
      ORDER BY total DESC
      LIMIT 5
    `) as any;

    return rows.map((r: any) => ({
      category: r.category,
      total: Number(r.total)
    }));
  } catch (err) {
    console.error("getTopCategories error:", err);
    return [];
  }
}
