"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, Phone, MapPin } from "lucide-react";

export default function CustomersManagementPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customer Records</h1>
          <p className="text-gray-500 text-sm">Manage all clients, store locations, and tracking tied to the store_visits and sales tables.</p>
        </div>
        <Button className="bg-[#005914] hover:bg-[#00420f]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-0 rounded-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 bg-[#005914] w-24 h-24 rounded-bl-full" />
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Active Customers</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-gray-900">4,129</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-0 rounded-xl">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">New This Month</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-[#005914]">+142</div>
           </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0 rounded-xl">
        <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
           <CardTitle className="text-lg font-semibold text-gray-800">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Store / Customer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned Rep (User)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell>
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                     </div>
                     <span className="font-medium text-gray-900">Mega Mart Grocery</span>
                   </div>
                </TableCell>
                <TableCell className="text-gray-500 flex items-center gap-2"><Phone className="w-3 h-3"/> +1 234 567 890</TableCell>
                <TableCell className="text-gray-500">
                   <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Downtown Branch</div>
                </TableCell>
                <TableCell className="text-gray-900 font-medium">Jane Smith</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8">View Records</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
