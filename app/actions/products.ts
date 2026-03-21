"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  product_categories: { name: string } | null;
  brands: { name: string } | null;
  total_packaging: string | null;
  net_weight: string | null;
}

export async function getProducts(search?: string): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("id, name, description, total_packaging, net_weight, is_active, created_at, product_categories:category_id(name), brands:brand_id(name)")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as any as ProductRow[];
  } catch {
    return [];
  }
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const totalPackaging = formData.get("totalPackaging") as string;
  const netWeight = formData.get("netWeight") as string;

  if (!name) return { error: "Product name is required." };

  const { data, error } = await supabase.from("products").insert([
    {
      name,
      description: description || null,
      category_id: categoryId ? parseInt(categoryId) : null,
      brand_id: brandId ? parseInt(brandId) : null,
      total_packaging: totalPackaging || null,
      net_weight: netWeight || null,
    },
  ]).select("id").single();

  if (error) return { error: error.message };

  // Automatically create a default variant for the new product
  await supabase.from("product_variants").insert([
    {
      product_id: data.id,
      name: "Standard",
      sku: `SKU-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      unit_price: 0,
      is_active: true,
    },
  ]);

  revalidatePath("/catalog/products");
  revalidatePath("/admin/catalog/products");
  return { success: true };
}

export async function getArchivedProducts(): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, total_packaging, net_weight, is_active, created_at, product_categories:category_id(name), brands:brand_id(name)")
      .eq("is_archived", true)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as any as ProductRow[];
  } catch {
    return [];
  }
}

export async function archiveProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/products");
  return { success: true };
}

export async function restoreProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_archived: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/archives");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const totalPackaging = formData.get("totalPackaging") as string;
  const netWeight = formData.get("netWeight") as string;

  if (!name) return { error: "Product name is required." };

  const { error } = await supabase.from("products").update({
    name,
    description: description || null,
    category_id: categoryId ? parseInt(categoryId) : null,
    brand_id: brandId ? parseInt(brandId) : null,
    total_packaging: totalPackaging || null,
    net_weight: netWeight || null,
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/catalog/products");
  return { success: true };
}

export async function getProductVariants(): Promise<{ id: string; name: string; unit_price: number; sku: string | null }[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, name, unit_price, sku")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
