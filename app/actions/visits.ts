"use server";

import { supabase } from "@/lib/supabase";

export interface StoreVisitRow {
  id: string;
  visit_date: string;
  notes: string | null;
  created_at: string;
  customers: { store_name: string } | null;
  users: { full_name: string } | null;
  store_visit_skus: { id: string }[];
}

export interface VisitReportDetail {
  id: string;
  visit_date: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  customers: { store_name: string } | null;
  users: { full_name: string } | null;
  store_visit_skus: {
    id: string;
    notes: string | null;
    product_variants: { name: string; sku: string | null } | null;
  }[];
}

export async function getStoreVisits(): Promise<StoreVisitRow[]> {
  try {
    const { data, error } = await supabase
      .from("store_visits")
      .select("id, visit_date, notes, created_at, customers:customer_id(store_name), users:salesman_id(full_name), store_visit_skus(id)")
      .order("visit_date", { ascending: false });

    if (error || !data) return [];
    return data as any as StoreVisitRow[];
  } catch {
    return [];
  }
}

export async function getVisitReport(id: string): Promise<VisitReportDetail | null> {
  try {
    const { data, error } = await supabase
      .from("store_visits")
      .select("id, visit_date, notes, latitude, longitude, customers:customer_id(store_name), users:salesman_id(full_name), store_visit_skus(id, notes, product_variants:variant_id(name, sku))")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as any as VisitReportDetail;
  } catch {
    return null;
  }
}
