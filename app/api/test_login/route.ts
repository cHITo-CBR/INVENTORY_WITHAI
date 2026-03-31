import pool from "@/lib/mysql";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [users] = await pool.execute(
      "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?",
      ["admin@flowstock.com"]
    );
    const user = (users as any[])[0] || null;
    return Response.json({ user, error: null });
  } catch (error: any) {
    return Response.json({ user: null, error: error.message });
  }
}
