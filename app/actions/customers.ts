"use server";

import pool from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
  salesman_name: string | null;
}

export interface CustomerStats {
  totalActive: number;
  newThisMonth: number;
}

export async function getCustomers(): Promise<CustomerRow[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, u.full_name as salesman_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_salesman_id = u.id
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
    `) as any;
    return rows;
  } catch (err) {
    console.error("getCustomers error:", err);
    return [];
  }
}

export async function getCustomerStats(): Promise<CustomerStats> {
  try {
    const [totalActiveRows] = await pool.execute("SELECT COUNT(*) as count FROM customers WHERE is_active = true") as any;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [newThisMonthRows] = await pool.execute("SELECT COUNT(*) as count FROM customers WHERE created_at >= ?", [startOfMonth]) as any;

    return {
      totalActive: totalActiveRows[0]?.count ?? 0,
      newThisMonth: newThisMonthRows[0]?.count ?? 0,
    };
  } catch (err) {
    console.error("getCustomerStats error:", err);
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

  try {
    await pool.execute(
      "INSERT INTO customers (id, store_name, contact_person, phone, email, address, city, region, assigned_salesman_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        storeName,
        contactPerson || null,
        phone || null,
        email || null,
        address || null,
        city || null,
        region || null,
        assignedSalesmanId || null,
      ]
    );

    revalidatePath("/customers");
    return { success: true };
  } catch (err: any) {
    console.error("createCustomer error:", err);
    return { error: err.message };
  }
}

export async function getSalesmenForAssignment(): Promise<{ id: string; full_name: string }[]> {
  try {
    const [rows] = await pool.execute("SELECT id, full_name FROM users WHERE is_active = true ORDER BY full_name") as any;
    return rows;
  } catch (err) {
    console.error("getSalesmenForAssignment error:", err);
    return [];
  }
}

export async function getSalesmanCustomers(salesmanId: string): Promise<CustomerRow[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, u.full_name as salesman_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_salesman_id = u.id
      WHERE c.assigned_salesman_id = ?
      AND c.is_active = true
      ORDER BY c.store_name ASC
    `, [salesmanId]) as any;
    return rows;
  } catch (err) {
    console.error("getSalesmanCustomers error:", err);
    return [];
  }
}
