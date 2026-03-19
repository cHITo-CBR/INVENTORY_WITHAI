import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  // Protect route
  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  // Let's double check latest database status to ensure they are still active
  const { data: dbUser, error } = await supabase
    .from("users")
    .select("status, is_active")
    .eq("id", user.id)
    .single();

  if (error || !dbUser || !dbUser.is_active || dbUser.status !== "approved") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            FlowStock <span className="text-blue-600 capitalize">{user.role}</span> Portal
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome, {user.full_name}</span>
            <form action="/api/logout" method="post">
              <button className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-gray-200 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Dashboard Link (if applicable) */}
          {user.role === "admin" && (
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Admin Approvals</h2>
              <p className="text-gray-600 mb-4 text-sm">Manage new user registrations and system settings.</p>
              <Link href="/admin/approvals" className="text-purple-600 hover:underline text-sm font-medium">
                Go to Approvals &rarr;
              </Link>
            </div>
          )}

          {/* Supervisor Tools */}
          {(user.role === "admin" || user.role === "supervisor") && (
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold text-gray-900 mb-2">User & Reports Monitoring</h2>
              <p className="text-gray-600 mb-4 text-sm">Monitor system users, generate inventory reports, and track overall application metrics.</p>
              <button className="text-blue-600 hover:underline text-sm font-medium">View Reports &rarr;</button>
            </div>
          )}

          {/* Salesman Tools */}
          {(user.role === "admin" || user.role === "salesman" || user.role === "supervisor") && (
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Customer & Transaction Management</h2>
              <p className="text-gray-600 mb-4 text-sm">Manage your customers, view recent transactions, and process new sales.</p>
              <button className="text-green-600 hover:underline text-sm font-medium">Manage Sales &rarr;</button>
            </div>
          )}

          {/* Buyer Tools */}
          {(user.role === "admin" || user.role === "buyer") && (
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Order & Booking Creation</h2>
              <p className="text-gray-600 mb-4 text-sm">Browse the catalog, create new stock bookings, and track your active orders.</p>
              <button className="text-orange-600 hover:underline text-sm font-medium">Create Order &rarr;</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
