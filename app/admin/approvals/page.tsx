import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import AdminApprovalClient from "./AdminApprovalClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // Fetch pending users
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, phone_number, created_at, roles(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading users: {error.message}</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage pending user registrations</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve or reject new user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!users || users.length === 0) ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
              No pending approvals at this time.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <AdminApprovalClient key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
