"use server";

import { supabase } from "@/lib/supabase";
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
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const totalPackaging = formData.get("totalPackaging") as string;
  const netWeight = formData.get("netWeight") as string;

  if (!name) return { error: "Product name is required." };

  const { error } = await supabase.from("products").insert([
    {
      name,
      description: description || null,
      category_id: categoryId ? parseInt(categoryId) : null,
      brand_id: brandId ? parseInt(brandId) : null,
      total_packaging: totalPackaging || null,
      net_weight: netWeight || null,
    },
  ]);

  if (error) return { error: error.message };

  revalidatePath("/catalog/products");
  return { success: true };
}

export async function getArchivedProducts(): Promise<ProductRow[]> {
  try {
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
  const { error } = await supabase.from("products").update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/products");
  return { success: true };
}

export async function restoreProduct(id: string) {
  const { error } = await supabase.from("products").update({ is_archived: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/archives");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
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
