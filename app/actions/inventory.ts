"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface InventoryKPIs {
  totalSKUs: number;
  lowStockAlerts: number;
}

export interface MovementRow {
  id: string;
  quantity: number;
  balance: number;
  notes: string | null;
  created_at: string;
  product_variants: { name: string; sku: string | null } | null;
  inventory_movement_types: { name: string; direction: string } | null;
  users: { full_name: string } | null;
}

export async function getInventoryKPIs(): Promise<InventoryKPIs> {
  try {
    // Total distinct SKUs that have ledger entries
    const { count: totalSKUs } = await supabase
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Low stock: get the latest balance per variant and count those below 10
    const { data: lowStockData } = await supabase
      .from("inventory_ledger")
      .select("balance")
      .lt("balance", 10)
      .order("created_at", { ascending: false })
      .limit(100);

    return {
      totalSKUs: totalSKUs ?? 0,
      lowStockAlerts: lowStockData?.length ?? 0,
    };
  } catch {
    return { totalSKUs: 0, lowStockAlerts: 0 };
  }
}

export async function getRecentMovements(): Promise<MovementRow[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_ledger")
      .select("id, quantity, balance, notes, created_at, product_variants:variant_id(name, sku), inventory_movement_types:movement_type_id(name, direction), users:recorded_by(full_name)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data as any as MovementRow[];
  } catch {
    return [];
  }
}

export async function getMovementTypes(): Promise<{ id: number; name: string; direction: string }[]> {
  const { data, error } = await supabase.from("inventory_movement_types").select("*").order("name");
  if (error || !data) return [];
  return data;
}

export async function getVariantsForAdjustment(): Promise<{ id: string; name: string; sku: string | null }[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, name, sku, products:product_id(name)")
    .eq("is_active", true)
    .order("name");
    
  if (error || !data) return [];
  
  return data.map((v: any) => ({
    id: v.id,
    name: v.products ? `${v.products.name} - ${v.name}` : v.name,
    sku: v.sku,
  }));
}

export async function createStockAdjustment(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const variantId = formData.get("variantId") as string;
  const movementTypeId = formData.get("movementTypeId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const notes = formData.get("notes") as string;

  if (!variantId || !movementTypeId || !quantity) {
    return { error: "Missing required fields." };
  }

  // Get current balance for this variant
  const { data: lastEntry } = await supabase
    .from("inventory_ledger")
    .select("balance")
    .eq("variant_id", variantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const currentBalance = lastEntry?.balance ?? 0;

  // Get movement type direction
  const { data: movType } = await supabase
    .from("inventory_movement_types")
    .select("direction")
    .eq("id", parseInt(movementTypeId))
    .single();

  const direction = movType?.direction ?? "in";
  const newBalance = direction === "out" ? currentBalance - quantity : currentBalance + quantity;

  const { error } = await supabase.from("inventory_ledger").insert([
    {
      variant_id: variantId,
      movement_type_id: parseInt(movementTypeId),
      quantity: direction === "out" ? -quantity : quantity,
      balance: newBalance,
      notes: notes || null,
      recorded_by: session.user.id,
    },
  ]);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/inventory");
  revalidatePath("/supervisor/inventory");
  revalidatePath("/inventory");
  return { success: true };
}
