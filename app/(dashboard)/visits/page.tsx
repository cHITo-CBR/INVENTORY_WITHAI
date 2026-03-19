"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Navigation } from "lucide-react";

export default function StoreVisitsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Store Visits Log</h1>
          <p className="text-gray-500 text-sm">Track field salesman visits, location check-ins, and discussed SKUs.</p>
        </div>
        <Button className="bg-[#005914] hover:bg-[#00420f]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Log a Visit
        </Button>
      </div>

      <Card className="shadow-sm border-0 rounded-xl">
        <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between">
           <CardTitle className="text-lg font-semibold text-gray-800">Visit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Visit Date</TableHead>
                <TableHead>Customer / Store</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Discussed SKUs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">Oct 24, 2024 10:30 AM</TableCell>
                <TableCell className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#005914]" /> Mega Mart Grocery
                </TableCell>
                <TableCell className="text-gray-500">Jane Smith</TableCell>
                <TableCell>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold w-fit">4 SKUs</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8">View Report</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
