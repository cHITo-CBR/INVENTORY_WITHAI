"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Package, AlertTriangle, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enterprise Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back. Here is the daily summary of operations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm border-0 rounded-xl relative overflow-hidden">
           <CardHeader className="p-4 pb-2">
             <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2"><Users className="w-4 h-4" /> Total Users</CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0">
             <div className="text-2xl font-bold text-gray-900">42</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-0 rounded-xl">
           <CardHeader className="p-4 pb-2">
             <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Pending Approvals</CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0">
             <div className="text-2xl font-bold text-yellow-600">6</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-0 rounded-xl">
           <CardHeader className="p-4 pb-2">
             <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Total Customers</CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0">
             <div className="text-2xl font-bold text-gray-900">4,129</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-0 rounded-xl">
           <CardHeader className="p-4 pb-2">
             <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2"><Package className="w-4 h-4" /> Total Products</CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0">
             <div className="text-2xl font-bold text-gray-900">142</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-0 rounded-xl bg-red-50/50">
           <CardHeader className="p-4 pb-2">
             <CardTitle className="text-xs font-medium text-red-600 uppercase flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Low Stock Items</CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0">
             <div className="text-2xl font-bold text-red-700">12</div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="shadow-sm border-0 rounded-xl">
          <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
             <CardTitle className="text-lg font-semibold text-gray-800">Recent Sales Transactions</CardTitle>
             <Button variant="ghost" size="sm" className="text-[#005914]">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Mega Mart Grocery</TableCell>
                  <TableCell className="text-right font-bold">₱45,200.00</TableCell>
                  <TableCell className="text-right"><span className="text-xs text-green-700 font-medium">Completed</span></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="shadow-sm border-0 rounded-xl">
          <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
             <CardTitle className="text-lg font-semibold text-gray-800">Low Stock Alerts</CardTitle>
             <Button variant="ghost" size="sm" className="text-[#005914]">Restock</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>SKU Variant</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mediumtext-gray-900">Argentina Corned Beef 175g</TableCell>
                  <TableCell className="text-right font-bold text-red-600">5 cs</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
