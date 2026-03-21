"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface SalesTransactionRow {
  id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  customers: { store_name: string } | null;
  users: { full_name: string } | null;
}

export interface SaleDetailItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_variants: { name: string; sku: string | null } | null;
}

export interface SaleDetail {
  id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  customers: { store_name: string } | null;
  users: { full_name: string } | null;
  sales_transaction_items: SaleDetailItem[];
}

export async function getSalesTransactions(): Promise<SalesTransactionRow[]> {
  try {
    const { data, error } = await supabase
      .from("sales_transactions")
      .select("id, status, total_amount, notes, created_at, customers:customer_id(store_name), users:salesman_id(full_name)")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as any as SalesTransactionRow[];
  } catch {
    return [];
  }
}

export async function getSaleDetails(id: string): Promise<SaleDetail | null> {
  try {
    const { data, error } = await supabase
      .from("sales_transactions")
      .select("id, status, total_amount, notes, created_at, customers:customer_id(store_name), users:salesman_id(full_name), sales_transaction_items(id, quantity, unit_price, subtotal, product_variants:variant_id(name, sku))")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as any as SaleDetail;
  } catch {
    return null;
  }
}

export async function exportSalesCSV(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("sales_transactions")
      .select("id, status, total_amount, created_at, customers:customer_id(store_name), users:salesman_id(full_name)")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return "";

    const headers = ["Transaction ID", "Date", "Customer", "Sales Rep", "Total Amount", "Status"];
    const rows = data.map((t: any) => [
      t.id,
      new Date(t.created_at).toLocaleDateString(),
      t.customers?.store_name ?? "N/A",
      t.users?.full_name ?? "N/A",
      t.total_amount ?? 0,
      t.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    return csv;
  } catch {
    return "";
  }
}

export interface BookingItemInput {
  variant_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateBookingInput {
  customer_id: string;
  salesman_id: string;
  notes?: string;
  items: BookingItemInput[];
}

/**
 * Creates a new booking (sales transaction) and its items.
 */
export async function createBooking(input: CreateBookingInput) {
  try {
    const { customer_id, salesman_id, notes, items } = input;
    
    // Calculate total
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // 1. Insert transaction header
    const { data: transaction, error: txError } = await supabase
      .from("sales_transactions")
      .insert({
        customer_id,
        salesman_id,
        total_amount,
        notes,
        status: "pending"
      })
      .select()
      .single();

    if (txError) throw txError;

    // 2. Insert transaction items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        transaction_id: transaction.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from("sales_transaction_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    revalidatePath("/salesman/dashboard");
    revalidatePath("/sales"); // For admin dashboard
    return { success: true, data: transaction };
  } catch (error: any) {
    console.error("createBooking error:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════

/**
 * Fetches ALL bookings for admin management.
 */
export async function getAllBookings() {
  try {
    const { data, error } = await supabase
      .from("sales_transactions")
      .select(`
        *,
        customers:customer_id (store_name),
        users:salesman_id (full_name),
        sales_transaction_items (
          *,
          product_variants:variant_id (name, sku)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("getAllBookings error:", error);
    return [];
  }
}

/**
 * Updates a booking/transaction status.
 */
export async function updateBookingStatus(transactionId: string, status: string) {
  try {
    const { error } = await supabase
      .from("sales_transactions")
      .update({ status })
      .eq("id", transactionId);

    if (error) throw error;

    revalidatePath("/bookings");
    revalidatePath("/sales");
    revalidatePath("/salesman/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
