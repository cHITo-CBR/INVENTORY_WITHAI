import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";

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
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            FlowStock <span className="text-primary capitalize">{user.role}</span> Portal
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">Welcome, <span className="font-medium text-foreground">{user.full_name}</span></span>
            <form action="/api/logout" method="post">
              <Button variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Dashboard Link (if applicable) */}
          {user.role === "admin" && (
            <Card className="flex flex-col border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Admin Approvals</CardTitle>
                <CardDescription>Manage new user registrations and system settings.</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/approvals">
                    Go to Approvals <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Supervisor Tools */}
          {(user.role === "admin" || user.role === "supervisor") && (
            <Card className="flex flex-col border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>User & Reports Monitoring</CardTitle>
                <CardDescription>Monitor system users, generate inventory reports, and track overall application metrics.</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full text-blue-600 hover:text-blue-700">
                  View Reports <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Salesman Tools */}
          {(user.role === "admin" || user.role === "salesman" || user.role === "supervisor") && (
            <Card className="flex flex-col border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Customer & Transaction</CardTitle>
                <CardDescription>Manage your customers, view recent transactions, and process new sales.</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full text-green-600 hover:text-green-700">
                  Manage Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Buyer Tools */}
          {(user.role === "admin" || user.role === "buyer") && (
            <Card className="flex flex-col border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Order & Booking</CardTitle>
                <CardDescription>Browse the catalog, create new stock bookings, and track your active orders.</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full text-orange-600 hover:text-orange-700">
                  Create Order <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
