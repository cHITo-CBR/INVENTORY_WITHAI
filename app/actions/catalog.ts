"use server";

import pool from "@/lib/mysql";
import { revalidatePath } from "next/cache";

// ── Categories ──────────────────────────────────────────────
export interface CategoryRow { 
  id: number; 
  name: string; 
  description: string | null; 
  created_at: string; 
  is_archived: boolean; 
}

export async function getCategories(): Promise<CategoryRow[]> {
  const [rows] = await pool.execute("SELECT * FROM product_categories WHERE is_archived = false ORDER BY name") as any;
  return rows;
}

export async function getArchivedCategories(): Promise<CategoryRow[]> {
  const [rows] = await pool.execute("SELECT * FROM product_categories WHERE is_archived = true ORDER BY name") as any;
  return rows;
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  
  try {
    await pool.execute(
      "INSERT INTO product_categories (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    revalidatePath("/catalog/categories");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };

  try {
    await pool.execute(
      "UPDATE product_categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );
    revalidatePath("/catalog/categories");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function archiveCategory(id: number) {
  try {
    await pool.execute("UPDATE product_categories SET is_archived = true WHERE id = ?", [id]);
    revalidatePath("/catalog/categories");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function restoreCategory(id: number) {
  try {
    await pool.execute("UPDATE product_categories SET is_archived = false WHERE id = ?", [id]);
    revalidatePath("/admin/catalog/categories");
    revalidatePath("/catalog/categories");
    revalidatePath("/admin/archives");
    revalidatePath("/archives");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteCategory(id: number) {
  try {
    await pool.execute("DELETE FROM product_categories WHERE id = ?", [id]);
    revalidatePath("/catalog/categories");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Brands ──────────────────────────────────────────────────
export interface BrandRow { 
  id: number; 
  name: string; 
  description: string | null; 
  created_at: string; 
  is_archived: boolean; 
}

export async function getBrands(): Promise<BrandRow[]> {
  const [rows] = await pool.execute("SELECT * FROM brands WHERE is_archived = false ORDER BY name") as any;
  return rows;
}

export async function getArchivedBrands(): Promise<BrandRow[]> {
  const [rows] = await pool.execute("SELECT * FROM brands WHERE is_archived = true ORDER BY name") as any;
  return rows;
}

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  
  try {
    await pool.execute(
      "INSERT INTO brands (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    revalidatePath("/catalog/brands");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateBrand(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };

  try {
    await pool.execute(
      "UPDATE brands SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );
    revalidatePath("/catalog/brands");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function archiveBrand(id: number) {
  try {
    await pool.execute("UPDATE brands SET is_archived = true WHERE id = ?", [id]);
    revalidatePath("/catalog/brands");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function restoreBrand(id: number) {
  try {
    await pool.execute("UPDATE brands SET is_archived = false WHERE id = ?", [id]);
    revalidatePath("/admin/catalog/brands");
    revalidatePath("/catalog/brands");
    revalidatePath("/admin/archives");
    revalidatePath("/archives");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteBrand(id: number) {
  try {
    await pool.execute("DELETE FROM brands WHERE id = ?", [id]);
    revalidatePath("/catalog/brands");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Units ──────────────────────────────────────────────────
export interface UnitRow { 
  id: number; 
  name: string; 
  abbreviation: string | null; 
  created_at: string; 
  is_archived: boolean; 
}

export async function getUnits(): Promise<UnitRow[]> {
  const [rows] = await pool.execute("SELECT * FROM units WHERE is_archived = false ORDER BY name") as any;
  return rows;
}

export async function getArchivedUnits(): Promise<UnitRow[]> {
  const [rows] = await pool.execute("SELECT * FROM units WHERE is_archived = true ORDER BY name") as any;
  return rows;
}

export async function createUnit(formData: FormData) {
  const name = formData.get("name") as string;
  const abbreviation = formData.get("abbreviation") as string;
  if (!name) return { error: "Name is required." };
  
  try {
    await pool.execute(
      "INSERT INTO units (name, abbreviation) VALUES (?, ?)",
      [name, abbreviation || null]
    );
    revalidatePath("/catalog/units");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateUnit(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const abbreviation = formData.get("abbreviation") as string;
  if (!name) return { error: "Name is required." };

  try {
    await pool.execute(
      "UPDATE units SET name = ?, abbreviation = ? WHERE id = ?",
      [name, abbreviation || null, id]
    );
    revalidatePath("/catalog/units");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function archiveUnit(id: number) {
  try {
    await pool.execute("UPDATE units SET is_archived = true WHERE id = ?", [id]);
    revalidatePath("/catalog/units");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function restoreUnit(id: number) {
  try {
    await pool.execute("UPDATE units SET is_archived = false WHERE id = ?", [id]);
    revalidatePath("/admin/catalog/units");
    revalidatePath("/catalog/units");
    revalidatePath("/admin/archives");
    revalidatePath("/archives");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteUnit(id: number) {
  try {
    await pool.execute("DELETE FROM units WHERE id = ?", [id]);
    revalidatePath("/catalog/units");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Packaging Types ────────────────────────────────────────
export interface PackagingRow { 
  id: number; 
  name: string; 
  description: string | null; 
  created_at: string; 
  is_archived: boolean; 
}

export async function getPackagingTypes(): Promise<PackagingRow[]> {
  const [rows] = await pool.execute("SELECT * FROM packaging_types WHERE is_archived = false ORDER BY name") as any;
  return rows;
}

export async function getArchivedPackagingTypes(): Promise<PackagingRow[]> {
  const [rows] = await pool.execute("SELECT * FROM packaging_types WHERE is_archived = true ORDER BY name") as any;
  return rows;
}

export async function createPackagingType(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  
  try {
    await pool.execute(
      "INSERT INTO packaging_types (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    revalidatePath("/catalog/packaging");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePackagingType(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };

  try {
    await pool.execute(
      "UPDATE packaging_types SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );
    revalidatePath("/catalog/packaging");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function archivePackagingType(id: number) {
  try {
    await pool.execute("UPDATE packaging_types SET is_archived = true WHERE id = ?", [id]);
    revalidatePath("/catalog/packaging");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function restorePackagingType(id: number) {
  try {
    await pool.execute("UPDATE packaging_types SET is_archived = false WHERE id = ?", [id]);
    revalidatePath("/admin/catalog/packaging");
    revalidatePath("/catalog/packaging");
    revalidatePath("/admin/archives");
    revalidatePath("/archives");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deletePackagingType(id: number) {
  try {
    await pool.execute("DELETE FROM packaging_types WHERE id = ?", [id]);
    revalidatePath("/catalog/packaging");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
