"use server";

import pool from "@/lib/mysql";

export type SearchResult = {
  id: string;
  type: "product" | "customer" | "user" | "transaction";
  title: string;
  subtitle: string;
  url: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const searchTerm = `%${query.trim()}%`;
  const results: SearchResult[] = [];

  try {
    // Search Product Variants
    const [products] = await pool.execute(`
      SELECT id, name, sku 
      FROM product_variants 
      WHERE name LIKE ? OR sku LIKE ?
      LIMIT 3
    `, [searchTerm, searchTerm]) as any;
    
    if (products) {
      products.forEach((p: any) => {
        results.push({
          id: `prod_${p.id}`,
          type: "product",
          title: p.name,
          subtitle: `SKU: ${p.sku || "N/A"}`,
          url: `/catalog/products`,
        });
      });
    }

    // Search Customers
    const [customers] = await pool.execute(`
      SELECT id, store_name, contact_person 
      FROM customers 
      WHERE store_name LIKE ? 
      LIMIT 3
    `, [searchTerm]) as any;

    if (customers) {
      customers.forEach((c: any) => {
        results.push({
          id: `cust_${c.id}`,
          type: "customer",
          title: c.store_name,
          subtitle: `Contact: ${c.contact_person || "N/A"}`,
          url: `/customers`,
        });
      });
    }

    // Search Users
    const [users] = await pool.execute(`
      SELECT id, full_name, email 
      FROM users 
      WHERE full_name LIKE ? 
      LIMIT 3
    `, [searchTerm]) as any;

    if (users) {
      users.forEach((u: any) => {
        results.push({
          id: `user_${u.id}`,
          type: "user",
          title: u.full_name,
          subtitle: u.email,
          url: `/users`,
        });
      });
    }
  } catch (err) {
    console.error("globalSearch error:", err);
  }

  return results;
}
