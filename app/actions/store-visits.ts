"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface CreateStoreVisitInput {
  customer_id: string;
  salesman_id: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Records a new store visit.
 */
export async function createStoreVisit(input: CreateStoreVisitInput) {
  try {
    const { data, error } = await supabase
      .from("store_visits")
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/salesman/dashboard");
    revalidatePath("/salesman/visits");
    return { success: true, data };
  } catch (error: any) {
    console.error("createStoreVisit error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets visits for a specific salesman.
 */
export async function getSalesmanVisits(salesmanId: string) {
  try {
    const { data, error } = await supabase
      .from("store_visits")
      .select(`
        *,
        customers (store_name, address)
      `)
      .eq("salesman_id", salesmanId)
      .order("visit_date", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
