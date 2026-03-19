"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, UserCheck, Settings, ShieldAlert } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 text-sm">Security, activity, and compliance trail mapped to the audit_logs table.</p>
        </div>
      </div>

      <Card className="shadow-sm border-0 rounded-xl">
        <CardHeader className="py-4 border-b border-gray-100 bg-white rounded-t-xl">
           <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 bg-white">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User / Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Affected</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500 text-xs">2024-10-24 14:32:01</TableCell>
                <TableCell className="font-medium">System Admin</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">Account Approved</span>
                </TableCell>
                <TableCell className="text-gray-600 font-mono text-xs">users (ID: 4192)</TableCell>
                <TableCell className="text-gray-400 text-xs">192.168.1.45</TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500 text-xs">2024-10-24 14:15:22</TableCell>
                <TableCell className="font-medium">Jane Smith</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">Created Order</span>
                </TableCell>
                <TableCell className="text-gray-600 font-mono text-xs">sales_transactions (ID: 10029)</TableCell>
                <TableCell className="text-gray-400 text-xs">Phone IP (Mobile)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
