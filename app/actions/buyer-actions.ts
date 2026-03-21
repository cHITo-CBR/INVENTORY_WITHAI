"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ══════════════════════════════════════════════════════════════
// BUYER DASHBOARD
// ══════════════════════════════════════════════════════════════

export async function getBuyerDashboard(userId: string) {
  const [
    { data: recentRequests },
    { data: recentOrders },
    { data: featuredProducts },
  ] = await Promise.all([
    supabase.from("buyer_requests").select("*, buyer_request_items(*, products(name))").eq("salesman_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("sales_transactions").select("*, customers(store_name)").eq("salesman_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("*, product_categories(name), brands(name), product_images(image_url, is_primary)").eq("is_active", true).eq("is_archived", false).order("created_at", { ascending: false }).limit(6),
  ]);

  return {
    recentRequests: recentRequests || [],
    recentOrders: recentOrders || [],
    featuredProducts: featuredProducts || [],
  };
}

// ══════════════════════════════════════════════════════════════
// PRODUCT BROWSING
// ══════════════════════════════════════════════════════════════

export async function getBuyerProducts(search?: string, categoryId?: number, brandId?: number) {
  let query = supabase
    .from("products")
    .select("*, product_categories(name), brands(name), product_images(image_url, is_primary), product_variants(id, name, sku, unit_price)")
    .eq("is_active", true)
    .eq("is_archived", false)
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (brandId) query = query.eq("brand_id", brandId);

  const { data, error } = await query;
  return data || [];
}

export async function getProductDetail(productId: string) {
  const { data } = await supabase
    .from("products")
    .select("*, product_categories(name), brands(name), product_images(image_url, is_primary), product_variants(id, name, sku, unit_price, packaging_types(name), units(name))")
    .eq("id", productId)
    .single();

  return data;
}

export async function getProductFilters() {
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("product_categories").select("id, name").eq("is_archived", false).order("name"),
    supabase.from("brands").select("id, name").eq("is_archived", false).order("name"),
  ]);

  return { categories: categories || [], brands: brands || [] };
}

// ══════════════════════════════════════════════════════════════
// BUYER REQUESTS (buyer's own)
// ══════════════════════════════════════════════════════════════

export async function getBuyerOwnRequests(userId: string) {
  const { data } = await supabase
    .from("buyer_requests")
    .select("*, customers(store_name), users:salesman_id(full_name), buyer_request_items(*, products(name))")
    .eq("salesman_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function createBuyerRequestFromBuyer(input: { customer_id: string; notes?: string; items: { product_id: string; quantity: number; notes?: string }[]; userId: string }) {
  const { data: request, error: reqErr } = await supabase
    .from("buyer_requests")
    .insert({ salesman_id: input.userId, customer_id: input.customer_id, notes: input.notes, status: "pending" })
    .select()
    .single();

  if (reqErr || !request) return { success: false, error: reqErr?.message || "Failed to create request" };

  if (input.items.length > 0) {
    const { error: itemErr } = await supabase
      .from("buyer_request_items")
      .insert(input.items.map(i => ({ request_id: request.id, ...i })));

    if (itemErr) return { success: false, error: itemErr.message };
  }

  revalidatePath("/customers/buyer-requests");
  return { success: true, data: request };
}

// ══════════════════════════════════════════════════════════════
// BUYER ORDERS
// ══════════════════════════════════════════════════════════════

export async function getBuyerOrders(userId: string) {
  const { data } = await supabase
    .from("sales_transactions")
    .select("*, customers(store_name), sales_transaction_items(*, product_variants(name, sku, products:product_id(name)))")
    .eq("salesman_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getOrderDetail(orderId: string) {
  const { data } = await supabase
    .from("sales_transactions")
    .select("*, customers(store_name), users:salesman_id(full_name), sales_transaction_items(*, product_variants(name, sku, unit_price, products:product_id(name)))")
    .eq("id", orderId)
    .single();

  return data;
}

// ══════════════════════════════════════════════════════════════
// BUYER NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

export async function getBuyerNotifications(userId: string) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}

// ══════════════════════════════════════════════════════════════
// BUYER PROFILE
// ══════════════════════════════════════════════════════════════

export async function getBuyerProfile(userId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("assigned_salesman_id", userId)
    .single();

  return { user, customer };
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

export async function getCustomersForBuyer() {
  const { data } = await supabase
    .from("customers")
    .select("id, store_name")
    .eq("is_active", true)
    .order("store_name");

  return data || [];
}
