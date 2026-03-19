"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inventory Ledger</h1>
          <p className="text-gray-500 text-sm">Monitor stock balances and track movements (receipts, sales, adjustments).</p>
        </div>
        <Button className="bg-[#005914] hover:bg-[#00420f]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Stock Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-0 rounded-xl">
           <CardHeader className="pb-2 flex flex-row items-center justify-between">
             <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total SKUs in Stock</CardTitle>
             <PackageIcon className="w-4 h-4 text-gray-400" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-gray-900">1,245</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-0 rounded-xl bg-red-50/50">
           <CardHeader className="pb-2 flex flex-row items-center justify-between">
             <CardTitle className="text-sm font-medium text-red-600 uppercase tracking-wider">Low Stock Alerts</CardTitle>
             <AlertTriangleIcon className="w-4 h-4 text-red-500" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-red-700">12</div>
             <p className="text-xs text-red-600 mt-1 font-medium">Items below minimum threshold</p>
           </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0 rounded-xl">
        <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
           <CardTitle className="text-lg font-semibold text-gray-800">Recent Movements</CardTitle>
           <Button variant="outline" size="sm" className="h-8">View Full Ledger</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Product Variant (SKU)</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500 font-medium whitespace-nowrap">Today, 10:42 AM</TableCell>
                <TableCell>
                   <span className="font-semibold text-gray-900 block">Century Tuna Flakes - Spicy</span>
                   <span className="text-xs text-gray-500">155g Canned • Case of 48</span>
                </TableCell>
                <TableCell>
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                     <ArrowDownRight className="w-3 h-3 mr-1" />
                     Restock (In)
                   </span>
                </TableCell>
                <TableCell className="text-right font-bold text-green-700">+100</TableCell>
                <TableCell className="text-right font-semibold text-gray-900">450</TableCell>
                <TableCell className="text-right text-gray-500">Admin User</TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500 font-medium whitespace-nowrap">Today, 09:15 AM</TableCell>
                <TableCell>
                   <span className="font-semibold text-gray-900 block">Argentina Corned Beef</span>
                   <span className="text-xs text-gray-500">175g Canned • Case of 48</span>
                </TableCell>
                <TableCell>
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                     <ArrowUpRight className="w-3 h-3 mr-1" />
                     Sale (Out)
                   </span>
                </TableCell>
                <TableCell className="text-right font-bold text-blue-700">-5</TableCell>
                <TableCell className="text-right font-semibold text-gray-900">120</TableCell>
                <TableCell className="text-right text-gray-500">System (TXN-1002)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Icons needed that might not be imported at top level
function PackageIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
}
function AlertTriangleIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
