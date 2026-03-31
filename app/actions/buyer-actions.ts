"use server";

import { query } from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// ══════════════════════════════════════════════════════════════
// BUYER DASHBOARD
// ══════════════════════════════════════════════════════════════

export async function getBuyerDashboard(userId: string) {
  const [recentRequests, recentOrders, featuredProducts] = await Promise.all([
    query<any[]>(
      `SELECT br.*, c.store_name 
       FROM buyer_requests br
       LEFT JOIN customers c ON br.customer_id = c.id
       WHERE br.salesman_id = ? 
       ORDER BY br.created_at DESC LIMIT 5`,
      [userId]
    ),
    query<any[]>(
      `SELECT st.*, c.store_name 
       FROM sales_transactions st
       LEFT JOIN customers c ON st.customer_id = c.id
       WHERE st.salesman_id = ? 
       ORDER BY st.created_at DESC LIMIT 5`,
      [userId]
    ),
    query<any[]>(
      `SELECT p.*, pc.name as category_name, b.name as brand_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = TRUE AND p.is_archived = FALSE
       ORDER BY p.created_at DESC LIMIT 6`,
      []
    ),
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
  let sql = `
    SELECT p.*, pc.name as category_name, b.name as brand_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = TRUE AND p.is_archived = FALSE
  `;
  const params: any[] = [];

  if (search) {
    sql += " AND p.name LIKE ?";
    params.push(`%${search}%`);
  }
  if (categoryId) {
    sql += " AND p.category_id = ?";
    params.push(categoryId);
  }
  if (brandId) {
    sql += " AND p.brand_id = ?";
    params.push(brandId);
  }

  sql += " ORDER BY p.name ASC";

  const data = await query<any[]>(sql, params);
  return data || [];
}

export async function getProductDetail(productId: string) {
  const [product] = await query<any[]>(
    `SELECT p.*, pc.name as category_name, b.name as brand_name
     FROM products p
     LEFT JOIN product_categories pc ON p.category_id = pc.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.id = ?`,
    [productId]
  );

  if (!product) return null;

  const [variants, images] = await Promise.all([
    query<any[]>(
      `SELECT pv.*, pt.name as packaging_name, u.name as unit_name
       FROM product_variants pv
       LEFT JOIN packaging_types pt ON pv.id = pt.id -- Assuming connection via some field or table
       LEFT JOIN units u ON pv.id = u.id -- Adjust based on actual mapping in schema
       WHERE pv.product_id = ? AND pv.is_active = TRUE`,
      [productId]
    ),
    query<any[]>(
      `SELECT image_url, is_primary FROM product_images WHERE product_id = ?`,
      [productId]
    ),
  ]);

  return { ...product, product_variants: variants, product_images: images };
}

export async function getProductFilters() {
  const [categories, brands] = await Promise.all([
    query<any[]>("SELECT id, name FROM product_categories WHERE is_archived = FALSE ORDER BY name", []),
    query<any[]>("SELECT id, name FROM brands WHERE is_archived = FALSE ORDER BY name", []),
  ]);

  return { categories: categories || [], brands: brands || [] };
}

// ══════════════════════════════════════════════════════════════
// BUYER REQUESTS
// ══════════════════════════════════════════════════════════════

export async function getBuyerOwnRequests(userId: string) {
  const data = await query<any[]>(
    `SELECT br.*, c.store_name, u.full_name as salesman_name
     FROM buyer_requests br
     LEFT JOIN customers c ON br.customer_id = c.id
     LEFT JOIN users u ON br.salesman_id = u.id
     WHERE br.salesman_id = ? 
     ORDER BY br.created_at DESC`,
    [userId]
  );

  return data || [];
}

export async function createBuyerRequestFromBuyer(input: { 
  customer_id: string; 
  notes?: string; 
  items: { product_id: string; quantity: number; notes?: string }[]; 
  userId: string 
}) {
  const requestId = randomUUID();
  
  try {
    // 1. Create request header
    await query(
      `INSERT INTO buyer_requests (id, salesman_id, customer_id, notes, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [requestId, input.userId, input.customer_id, input.notes]
    );

    // 2. Insert items
    if (input.items.length > 0) {
      for (const item of input.items) {
        await query(
          `INSERT INTO buyer_request_items (id, request_id, product_id, quantity, notes) 
           VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), requestId, item.product_id, item.quantity, item.notes]
        );
      }
    }

    revalidatePath("/customers/buyer-requests");
    return { success: true, data: { id: requestId } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════════════════
// BUYER ORDERS
// ══════════════════════════════════════════════════════════════

export async function getBuyerOrders(userId: string) {
  const data = await query<any[]>(
    `SELECT st.*, c.store_name 
     FROM sales_transactions st
     LEFT JOIN customers c ON st.customer_id = c.id
     WHERE st.salesman_id = ? 
     ORDER BY st.created_at DESC`,
    [userId]
  );

  return data || [];
}

export async function getOrderDetail(orderId: string) {
  const [order] = await query<any[]>(
    `SELECT st.*, c.store_name, u.full_name as salesman_name
     FROM sales_transactions st
     LEFT JOIN customers c ON st.customer_id = c.id
     LEFT JOIN users u ON st.salesman_id = u.id
     WHERE st.id = ?`,
    [orderId]
  );

  if (!order) return null;

  const items = await query<any[]>(
    `SELECT sti.*, pv.name as variant_name, pv.sku, p.name as product_name
     FROM sales_transaction_items sti
     LEFT JOIN product_variants pv ON sti.variant_id = pv.id
     LEFT JOIN products p ON pv.product_id = p.id
     WHERE sti.transaction_id = ?`,
    [orderId]
  );

  return { ...order, sales_transaction_items: items };
}

// ══════════════════════════════════════════════════════════════
// BUYER NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

export async function getBuyerNotifications(userId: string) {
  const data = await query<any[]>(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );

  return data || [];
}

// ══════════════════════════════════════════════════════════════
// BUYER PROFILE
// ══════════════════════════════════════════════════════════════

export async function getBuyerProfile(userId: string) {
  const [user] = await query<any[]>("SELECT * FROM users WHERE id = ?", [userId]);
  const [customer] = await query<any[]>("SELECT * FROM customers WHERE assigned_salesman_id = ?", [userId]);

  return { user, customer };
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

export async function getCustomersForBuyer() {
  const data = await query<any[]>(
    "SELECT id, store_name FROM customers WHERE is_active = TRUE ORDER BY store_name",
    []
  );

  return data || [];
}
