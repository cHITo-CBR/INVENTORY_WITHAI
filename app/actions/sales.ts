"use server";

import pool from "@/lib/mysql";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export interface SalesTransactionRow {
  id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  store_name: string | null;
  salesman_name: string | null;
}

export interface SaleDetailItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  variant_name: string | null;
  sku: string | null;
}

export interface SaleDetail {
  id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  store_name: string | null;
  salesman_name: string | null;
  sales_transaction_items: SaleDetailItem[];
}

export async function getSalesTransactions(): Promise<SalesTransactionRow[]> {
  try {
    const [rows] = await pool.execute(`
      SELECT st.*, c.store_name, u.full_name as salesman_name
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.id
      JOIN users u ON st.salesman_id = u.id
      ORDER BY st.created_at DESC
    `) as any;
    return rows;
  } catch (err) {
    console.error("getSalesTransactions error:", err);
    return [];
  }
}

export async function getSaleDetails(id: string): Promise<SaleDetail | null> {
  try {
    const [transactions] = await pool.execute(`
      SELECT st.*, c.store_name, u.full_name as salesman_name
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.id
      JOIN users u ON st.salesman_id = u.id
      WHERE st.id = ?
    `, [id]) as any;

    if (!transactions[0]) return null;

    const [items] = await pool.execute(`
      SELECT sti.*, pv.name as variant_name, pv.sku
      FROM sales_transaction_items sti
      JOIN product_variants pv ON sti.variant_id = pv.id
      WHERE sti.transaction_id = ?
    `, [id]) as any;

    return {
      ...transactions[0],
      sales_transaction_items: items
    };
  } catch (err) {
    console.error("getSaleDetails error:", err);
    return null;
  }
}

export async function exportSalesCSV(): Promise<string> {
  try {
    const [data] = await pool.execute(`
      SELECT st.*, c.store_name, u.full_name as salesman_name
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.id
      JOIN users u ON st.salesman_id = u.id
      ORDER BY st.created_at DESC
    `) as any;

    if (!data || data.length === 0) return "";

    const headers = ["Transaction ID", "Date", "Customer", "Sales Rep", "Total Amount", "Status"];
    const rows = data.map((t: any) => [
      t.id,
      new Date(t.created_at).toLocaleDateString(),
      t.store_name ?? "N/A",
      t.salesman_name ?? "N/A",
      t.total_amount ?? 0,
      t.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    return csv;
  } catch (err) {
    console.error("exportSalesCSV error:", err);
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { customer_id, salesman_id, notes, items } = input;
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const transaction_id = uuidv4();

    // 1. Insert transaction header
    await connection.execute(
      "INSERT INTO sales_transactions (id, customer_id, salesman_id, total_amount, notes, status) VALUES (?, ?, ?, ?, ?, ?)",
      [transaction_id, customer_id, salesman_id, total_amount, notes || null, "pending"]
    );

    // 2. Insert transaction items
    if (items.length > 0) {
      for (const item of items) {
        await connection.execute(
          "INSERT INTO sales_transaction_items (id, transaction_id, variant_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
          [
            uuidv4(),
            transaction_id,
            item.variant_id,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price
          ]
        );
      }
    }

    await connection.commit();

    revalidatePath("/salesman/dashboard");
    revalidatePath("/sales");
    return { success: true, data: { id: transaction_id } };
  } catch (error: any) {
    await connection.rollback();
    console.error("createBooking error:", error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

/**
 * Fetches ALL bookings for admin management.
 */
export async function getAllBookings() {
  try {
    const [rows] = await pool.execute(`
      SELECT st.*, c.store_name, u.full_name as salesman_name
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.id
      JOIN users u ON st.salesman_id = u.id
      ORDER BY st.created_at DESC
    `) as any;

    const bookingsWithItems = [];
    for (const row of rows) {
      const [items] = await pool.execute(`
        SELECT sti.*, pv.name as variant_name, pv.sku
        FROM sales_transaction_items sti
        JOIN product_variants pv ON sti.variant_id = pv.id
        WHERE sti.transaction_id = ?
      `, [row.id]) as any;
      
      bookingsWithItems.push({
        ...row,
        sales_transaction_items: items
      });
    }

    return bookingsWithItems;
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
    await pool.execute("UPDATE sales_transactions SET status = ? WHERE id = ?", [status, transactionId]);

    revalidatePath("/bookings");
    revalidatePath("/sales");
    revalidatePath("/salesman/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
