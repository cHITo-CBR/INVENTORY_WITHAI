"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  category_id: number | null;
  brand_id: number | null;
  product_categories: { name: string } | null;
  brands: { name: string } | null;
  total_packaging: string | null;
  net_weight: string | null;
}

export interface ProductVariantRow {
  id?: string;
  product_id?: string;
  name: string;
  sku: string | null;
  unit_price: number;
  packaging_id?: number | null;
  unit_id?: number | null;
  is_active: boolean;
}

export async function getProducts(search?: string): Promise<ProductRow[]> {
  try {
    let query = supabase
      .from("products")
      .select("*, category_id, brand_id, product_categories:category_id(name), brands:brand_id(name)")
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
  const variantsJSON = formData.get("variants") as string;

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

  // Handle variants
  let variants: ProductVariantRow[] = [];
  try {
    if (variantsJSON) {
      variants = JSON.parse(variantsJSON);
    }
  } catch (e) {
    console.error("Failed to parse variants JSON", e);
  }

  if (variants.length > 0) {
    const { error: variantError } = await supabase.from("product_variants").insert(
      variants.map(v => ({
        product_id: data.id,
        name: v.name,
        sku: v.sku || `SKU-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        unit_price: Number(v.unit_price) || 0,
        packaging_id: v.packaging_id || null,
        unit_id: v.unit_id || null,
        is_active: true,
      }))
    );
    if (variantError) return { error: variantError.message };
  } else {
    // Automatically create a default variant if none provided
    await supabase.from("product_variants").insert([
      {
        product_id: data.id,
        name: "Standard",
        sku: `SKU-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        unit_price: 0,
        is_active: true,
      },
    ]);
  }

  revalidatePath("/catalog/products");
  revalidatePath("/admin/catalog/products");
  return { success: true };
}

export async function getArchivedProducts(): Promise<ProductRow[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, category_id, brand_id, product_categories:category_id(name), brands:brand_id(name)")
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
  const variantsJSON = formData.get("variants") as string;

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

  // Handle variants synchronization
  if (variantsJSON) {
    try {
      const variants: ProductVariantRow[] = JSON.parse(variantsJSON);
      
      // 1. Get existing variants for this product
      const { data: existingVariants } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", id);
      
      const existingIds = (existingVariants || []).map(v => v.id);
      const incomingIds = variants.map(v => v.id).filter(Boolean);
      
      // 2. Delete variants that are no longer in the list
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await supabase.from("product_variants").delete().in("id", toDelete);
      }
      
      // 3. Update or Insert variants
      for (const v of variants) {
        const variantData = {
          product_id: id,
          name: v.name,
          sku: v.sku,
          unit_price: Number(v.unit_price) || 0,
          packaging_id: v.packaging_id || null,
          unit_id: v.unit_id || null,
          is_active: true,
        };
        
        if (v.id) {
          await supabase.from("product_variants").update(variantData).eq("id", v.id);
        } else {
          await supabase.from("product_variants").insert([variantData]);
        }
      }
    } catch (e) {
      console.error("Failed to sync variants", e);
    }
  }

  revalidatePath("/catalog/products");
  revalidatePath("/admin/catalog/products");
  return { success: true };
}

export async function getProductVariantsByProductId(productId: string): Promise<ProductVariantRow[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("unit_price", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getProductVariants(): Promise<{ id: string; name: string; unit_price: number; sku: string | null }[]> {
  try {
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
