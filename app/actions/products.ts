"use server";

import pool from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  category_name: string | null;
  brand_name: string | null;
  total_packaging: string | null;
  net_weight: string | null;
}

export async function getProducts(search?: string): Promise<ProductRow[]> {
  try {
    let sql = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_archived = false
    `;
    const params: any[] = [];

    if (search && search.trim()) {
      sql += " AND p.name LIKE ?";
      params.push(`%${search}%`);
    }

    sql += " ORDER BY p.created_at DESC";

    const [rows] = await pool.execute(sql, params) as any;
    return rows;
  } catch (err) {
    console.error("getProducts error:", err);
    return [];
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const totalPackaging = formData.get("totalPackaging") as string;
  const netWeight = formData.get("netWeight") as string;

  if (!name) return { error: "Product name is required." };

  const id = uuidv4();

  try {
    await pool.execute(
      "INSERT INTO products (id, name, description, category_id, brand_id, total_packaging, net_weight) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        name,
        description || null,
        categoryId ? parseInt(categoryId) : null,
        brandId ? parseInt(brandId) : null,
        totalPackaging || null,
        netWeight || null,
      ]
    );

    // Automatically create a default variant for the new product
    await pool.execute(
      "INSERT INTO product_variants (id, product_id, name, sku, unit_price, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        id,
        "Standard",
        `SKU-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        0,
        true,
      ]
    );

    revalidatePath("/catalog/products");
    revalidatePath("/admin/catalog/products");
    return { success: true };
  } catch (err: any) {
    console.error("createProduct error:", err);
    return { error: err.message };
  }
}

export async function getArchivedProducts(): Promise<ProductRow[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_archived = true
      ORDER BY p.created_at DESC
    `) as any;
    return rows;
  } catch (err) {
    console.error("getArchivedProducts error:", err);
    return [];
  }
}

export async function archiveProduct(id: string) {
  try {
    await pool.execute("UPDATE products SET is_archived = true WHERE id = ?", [id]);
    revalidatePath("/catalog/products");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function restoreProduct(id: string) {
  try {
    await pool.execute("UPDATE products SET is_archived = false WHERE id = ?", [id]);
    revalidatePath("/archives");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const totalPackaging = formData.get("totalPackaging") as string;
  const netWeight = formData.get("netWeight") as string;

  if (!name) return { error: "Product name is required." };

  try {
    await pool.execute(
      "UPDATE products SET name = ?, description = ?, category_id = ?, brand_id = ?, total_packaging = ?, net_weight = ? WHERE id = ?",
      [
        name,
        description || null,
        categoryId ? parseInt(categoryId) : null,
        brandId ? parseInt(brandId) : null,
        totalPackaging || null,
        netWeight || null,
        id,
      ]
    );
    revalidatePath("/catalog/products");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getProductVariants(): Promise<{ id: string; name: string; unit_price: number; sku: string | null }[]> {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, unit_price, sku FROM product_variants WHERE is_active = true ORDER BY name ASC"
    ) as any;
    return rows;
  } catch (err) {
    console.error("getProductVariants error:", err);
    return [];
  }
}
