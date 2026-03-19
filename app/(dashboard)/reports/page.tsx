"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export default function ReportsAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm">Generate visual representations of sales_reports and ai_insights tables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-0 rounded-xl lg:col-span-2">
           <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
             <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#005914]"/>
                Sales Trends (Last 30 Days)
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6 h-80 flex items-center justify-center bg-gray-50/50">
              <p className="text-gray-400 font-medium">Chart visualization will render here</p>
           </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-xl">
           <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
             <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
               <PieChart className="w-5 h-5 text-[#005914]"/>
               Top Categories
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6 h-80 flex items-center justify-center bg-gray-50/50">
              <p className="text-gray-400 font-medium">Distribution chart will render here</p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
