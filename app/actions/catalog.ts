"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Categories ──────────────────────────────────────────────
export interface CategoryRow { id: number; name: string; description: string | null; created_at: string; is_archived: boolean; }

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await (await createClient()).from("product_categories").select("*").eq("is_archived", false).order("name");
  if (error || !data) return [];
  return data;
}

export async function getArchivedCategories(): Promise<CategoryRow[]> {
  const { data, error } = await (await createClient()).from("product_categories").select("*").eq("is_archived", true).order("name");
  if (error || !data) return [];
  return data;
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("product_categories").insert([{ name, description: description || null }]);
  if (error) return { error: error.message };
  revalidatePath("/catalog/categories");
  return { success: true };
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("product_categories").update({ name, description: description || null }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/categories");
  return { success: true };
}

export async function archiveCategory(id: number) {
  const { error } = await (await createClient()).from("product_categories").update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/categories");
  return { success: true };
}

export async function restoreCategory(id: number) {
  const { error } = await (await createClient()).from("product_categories").update({ is_archived: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/catalog/categories");
  revalidatePath("/catalog/categories");
  revalidatePath("/admin/archives");
  revalidatePath("/archives");
  return { success: true };
}

export async function deleteCategory(id: number) {
  const { error } = await (await createClient()).from("product_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/categories");
  return { success: true };
}

// ── Brands ──────────────────────────────────────────────────
export interface BrandRow { id: number; name: string; description: string | null; created_at: string; is_archived: boolean; }

export async function getBrands(): Promise<BrandRow[]> {
  const { data, error } = await (await createClient()).from("brands").select("*").eq("is_archived", false).order("name");
  if (error || !data) return [];
  return data;
}

export async function getArchivedBrands(): Promise<BrandRow[]> {
  const { data, error } = await (await createClient()).from("brands").select("*").eq("is_archived", true).order("name");
  if (error || !data) return [];
  return data;
}

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("brands").insert([{ name, description: description || null }]);
  if (error) return { error: error.message };
  revalidatePath("/catalog/brands");
  return { success: true };
}

export async function updateBrand(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("brands").update({ name, description: description || null }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/brands");
  return { success: true };
}

export async function archiveBrand(id: number) {
  const { error } = await (await createClient()).from("brands").update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/brands");
  return { success: true };
}

export async function restoreBrand(id: number) {
  const { error } = await (await createClient()).from("brands").update({ is_archived: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/catalog/brands");
  revalidatePath("/catalog/brands");
  revalidatePath("/admin/archives");
  revalidatePath("/archives");
  return { success: true };
}

export async function deleteBrand(id: number) {
  const { error } = await (await createClient()).from("brands").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/brands");
  return { success: true };
}

// ── Units ──────────────────────────────────────────────────
export interface UnitRow { id: number; name: string; abbreviation: string | null; created_at: string; is_archived: boolean; }

export async function getUnits(): Promise<UnitRow[]> {
  const { data, error } = await (await createClient()).from("units").select("*").eq("is_archived", false).order("name");
  if (error || !data) return [];
  return data;
}

export async function getArchivedUnits(): Promise<UnitRow[]> {
  const { data, error } = await (await createClient()).from("units").select("*").eq("is_archived", true).order("name");
  if (error || !data) return [];
  return data;
}

export async function createUnit(formData: FormData) {
  const name = formData.get("name") as string;
  const abbreviation = formData.get("abbreviation") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("units").insert([{ name, abbreviation: abbreviation || null }]);
  if (error) return { error: error.message };
  revalidatePath("/catalog/units");
  return { success: true };
}

export async function updateUnit(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const abbreviation = formData.get("abbreviation") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("units").update({ name, abbreviation: abbreviation || null }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/units");
  return { success: true };
}

export async function archiveUnit(id: number) {
  const { error } = await (await createClient()).from("units").update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/units");
  return { success: true };
}

export async function restoreUnit(id: number) {
  const { error } = await (await createClient()).from("units").update({ is_archived: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/catalog/units");
  revalidatePath("/catalog/units");
  revalidatePath("/admin/archives");
  revalidatePath("/archives");
  return { success: true };
}

export async function deleteUnit(id: number) {
  const { error } = await (await createClient()).from("units").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/units");
  return { success: true };
}

// ── Packaging Types ────────────────────────────────────────
export interface PackagingRow { id: number; name: string; description: string | null; created_at: string; is_archived: boolean; }

export async function getPackagingTypes(): Promise<PackagingRow[]> {
  const { data, error } = await (await createClient()).from("packaging_types").select("*").eq("is_archived", false).order("name");
  if (error || !data) return [];
  return data;
}

export async function getArchivedPackagingTypes(): Promise<PackagingRow[]> {
  const { data, error } = await (await createClient()).from("packaging_types").select("*").eq("is_archived", true).order("name");
  if (error || !data) return [];
  return data;
}

export async function createPackagingType(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("packaging_types").insert([{ name, description: description || null }]);
  if (error) return { error: error.message };
  revalidatePath("/catalog/packaging");
  return { success: true };
}

export async function updatePackagingType(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name) return { error: "Name is required." };
  const { error } = await (await createClient()).from("packaging_types").update({ name, description: description || null }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/packaging");
  return { success: true };
}

export async function archivePackagingType(id: number) {
  const { error } = await (await createClient()).from("packaging_types").update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/packaging");
  return { success: true };
}

export async function restorePackagingType(id: number) {
  const { error } = await (await createClient()).from("packaging_types").update({ is_archived: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/catalog/packaging");
  revalidatePath("/catalog/packaging");
  revalidatePath("/admin/archives");
  revalidatePath("/archives");
  return { success: true };
}

export async function deletePackagingType(id: number) {
  const { error } = await (await createClient()).from("packaging_types").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog/packaging");
  return { success: true };
}
