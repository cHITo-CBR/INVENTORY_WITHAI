"use server";

import { supabase } from "@/lib/supabase";

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
