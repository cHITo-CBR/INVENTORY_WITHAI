"use server";

import pool from "@/lib/mysql";
import { getCurrentUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
  variant_name: string | null;
  sku: string | null;
  movement_name: string | null;
  direction: string | null;
  recorded_by_name: string | null;
}

export async function getInventoryKPIs(): Promise<InventoryKPIs> {
  try {
    // Total distinct SKUs
    const [skuRows] = await pool.execute("SELECT COUNT(*) as count FROM product_variants WHERE is_active = true") as any;
    const totalSKUs = skuRows[0]?.count ?? 0;

    // Low stock: get count of variants whose latest balance is < 10
    // This query finds the latest record for each variant and checks the balance
    const [lowStockRows] = await pool.execute(`
      SELECT COUNT(*) as count FROM (
        SELECT balance FROM inventory_ledger il1
        WHERE created_at = (
          SELECT MAX(created_at) FROM inventory_ledger il2 
          WHERE il2.variant_id = il1.variant_id
        )
        AND balance < 10
      ) as sub
    `) as any;
    
    return {
      totalSKUs,
      lowStockAlerts: lowStockRows[0]?.count ?? 0,
    };
  } catch (err) {
    console.error("getInventoryKPIs error:", err);
    return { totalSKUs: 0, lowStockAlerts: 0 };
  }
}

export async function getRecentMovements(): Promise<MovementRow[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        il.id, il.quantity, il.balance, il.notes, il.created_at,
        pv.name as variant_name, pv.sku,
        imt.name as movement_name, imt.direction,
        u.full_name as recorded_by_name
      FROM inventory_ledger il
      JOIN product_variants pv ON il.variant_id = pv.id
      JOIN inventory_movement_types imt ON il.movement_type_id = imt.id
      JOIN users u ON il.recorded_by = u.id
      ORDER BY il.created_at DESC
      LIMIT 20
    `) as any;
    return rows;
  } catch (err) {
    console.error("getRecentMovements error:", err);
    return [];
  }
}

export async function getMovementTypes(): Promise<{ id: number; name: string; direction: string }[]> {
  const [rows] = await pool.execute("SELECT * FROM inventory_movement_types ORDER BY name") as any;
  return rows;
}

export async function getVariantsForAdjustment(): Promise<{ id: string; name: string; sku: string | null }[]> {
  const [rows] = await pool.execute(`
    SELECT pv.id, pv.name, pv.sku, p.name as product_name
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    WHERE pv.is_active = true
    ORDER BY pv.name
  `) as any;
    
  return rows.map((v: any) => ({
    id: v.id,
    name: `${v.product_name} - ${v.name}`,
    sku: v.sku,
  }));
}

export async function createStockAdjustment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const variantId = formData.get("variantId") as string;
  const movementTypeId = formData.get("movementTypeId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const notes = formData.get("notes") as string;

  if (!variantId || !movementTypeId || !quantity) {
    return { error: "Missing required fields." };
  }

  try {
    // Get current balance for this variant
    const [lastEntries] = await pool.execute(
      "SELECT balance FROM inventory_ledger WHERE variant_id = ? ORDER BY created_at DESC LIMIT 1",
      [variantId]
    ) as any;

    const currentBalance = lastEntries[0]?.balance ?? 0;

    // Get movement type direction
    const [movTypes] = await pool.execute(
      "SELECT direction FROM inventory_movement_types WHERE id = ?",
      [parseInt(movementTypeId)]
    ) as any;

    const direction = movTypes[0]?.direction ?? "in";
    const newBalance = direction === "out" ? currentBalance - quantity : currentBalance + quantity;

    await pool.execute(
      "INSERT INTO inventory_ledger (id, variant_id, movement_type_id, quantity, balance, notes, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        variantId,
        parseInt(movementTypeId),
        direction === "out" ? -quantity : quantity,
        newBalance,
        notes || null,
        user.id,
      ]
    );

    revalidatePath("/admin/inventory");
    revalidatePath("/supervisor/inventory");
    revalidatePath("/inventory");
    return { success: true };
  } catch (err: any) {
    console.error("createStockAdjustment error:", err);
    return { error: err.message };
  }
}
