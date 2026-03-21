"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface CustomerRow {
  id: string;
  store_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  is_active: boolean;
  created_at: string;
  users: { full_name: string } | null;
}

export interface CustomerStats {
  totalActive: number;
  newThisMonth: number;
}

export async function getCustomers(): Promise<CustomerRow[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, store_name, contact_person, phone, email, address, city, region, is_active, created_at, users:assigned_salesman_id(full_name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as any as CustomerRow[];
  } catch {
    return [];
  }
}

export async function getCustomerStats(): Promise<CustomerStats> {
  try {
    const { count: totalActive } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    return {
      totalActive: totalActive ?? 0,
      newThisMonth: newThisMonth ?? 0,
    };
  } catch {
    return { totalActive: 0, newThisMonth: 0 };
  }
}

export async function createCustomer(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const region = formData.get("region") as string;
  const assignedSalesmanId = formData.get("assignedSalesmanId") as string;

  if (!storeName) return { error: "Store name is required." };

  const { error } = await supabase.from("customers").insert([
    {
      store_name: storeName,
      contact_person: contactPerson || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      region: region || null,
      assigned_salesman_id: assignedSalesmanId || null,
    },
  ]);

  if (error) return { error: error.message };

  revalidatePath("/customers");
  return { success: true };
}

export async function getSalesmenForAssignment(): Promise<{ id: string; full_name: string }[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name");
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getSalesmanCustomers(salesmanId: string): Promise<CustomerRow[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, store_name, contact_person, phone, email, address, city, region, is_active, created_at, users:assigned_salesman_id(full_name)")
      .eq("assigned_salesman_id", salesmanId)
      .eq("is_active", true)
      .order("store_name", { ascending: true });

    if (error || !data) return [];
    return data as any as CustomerRow[];
  } catch {
    return [];
  }
}
