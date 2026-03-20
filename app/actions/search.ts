"use server";

import { supabase } from "@/lib/supabase";

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

  // Search Products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku")
    .ilike("name", searchTerm)
    .limit(3);
    
  if (products) {
    products.forEach((p) => {
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
  const { data: customers } = await supabase
    .from("customers")
    .select("id, store_name, contact_person")
    .ilike("store_name", searchTerm)
    .limit(3);

  if (customers) {
    customers.forEach((c) => {
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
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .ilike("full_name", searchTerm)
    .limit(3);

  if (users) {
    users.forEach((u) => {
      results.push({
        id: `user_${u.id}`,
        type: "user",
        title: u.full_name,
        subtitle: u.email,
        url: `/users`,
      });
    });
  }

  return results;
}
