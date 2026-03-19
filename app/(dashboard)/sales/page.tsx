"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SalesTransactionsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sales Transactions</h1>
          <p className="text-gray-500 text-sm">View sales records, invoice totals, customer references, and line items.</p>
        </div>
        <Button className="bg-[#005914] hover:bg-[#00420f]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>

      <Card className="shadow-sm border-0 rounded-xl">
        <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between">
           <CardTitle className="text-lg font-semibold text-gray-800">Transaction History</CardTitle>
           <Button variant="outline" size="sm" className="h-8"><Download className="w-4 h-4 mr-2"/> Export CSV</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="font-semibold text-gray-900">TXN-10029</TableCell>
                <TableCell className="text-gray-500">Oct 24, 2024</TableCell>
                <TableCell className="font-medium">Mega Mart Grocery</TableCell>
                <TableCell className="text-gray-500">Jane Smith</TableCell>
                <TableCell className="text-right font-bold text-gray-900">₱ 45,200.00</TableCell>
                <TableCell className="text-right">
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">Completed</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 text-[#005914]">View Details</Button>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="font-semibold text-gray-900">TXN-10030</TableCell>
                <TableCell className="text-gray-500">Oct 24, 2024</TableCell>
                <TableCell className="font-medium">Corner Store Branch 2</TableCell>
                <TableCell className="text-gray-500">Michael Sales</TableCell>
                <TableCell className="text-right font-bold text-gray-900">₱ 12,450.00</TableCell>
                <TableCell className="text-right">
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">Pending</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 text-[#005914]">View Details</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
