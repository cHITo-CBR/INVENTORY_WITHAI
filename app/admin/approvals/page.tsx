import { getCurrentUser } from "@/app/actions/auth";
import { getPendingUsers } from "@/app/actions/admin-actions";
import { redirect } from "next/navigation";
import AdminApprovalClient from "./AdminApprovalClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // Fetch pending users via MySQL action
  const users = await getPendingUsers();

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
