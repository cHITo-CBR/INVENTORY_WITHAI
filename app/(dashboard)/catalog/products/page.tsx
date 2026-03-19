"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProductCatalogPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Product Master Catalog</h1>
          <p className="text-gray-500 text-sm">Manage products, their relationships to categories/brands, and product variants.</p>
        </div>
        <Button className="bg-[#005914] hover:bg-[#00420f]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <Card className="shadow-sm border-0 rounded-xl">
        <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between">
          <div className="flex gap-3 flex-1 max-w-md">
             <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search SKU, name, or brand..." className="pl-9 h-9 border-gray-200 bg-gray-50" />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Variants Count</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50/50">
                <TableCell>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <PackageOpen className="w-5 h-5 text-gray-400" />
                     </div>
                     <span className="font-semibold text-[#005914]">Century Tuna Flakes</span>
                   </div>
                </TableCell>
                <TableCell className="text-gray-500">Canned Seafood</TableCell>
                <TableCell className="text-gray-500 font-medium">Century</TableCell>
                <TableCell>
                   <span className="bg-gray-100 text-gray-700 px-2 py-1 flex items-center justify-center w-8 rounded text-xs font-bold">3</span>
                </TableCell>
                <TableCell className="text-right">
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">Active</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
