"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIInsightsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#005914]" />
            AI Insights & Forecasting
          </h1>
          <p className="text-gray-500 text-sm">Leverage the ai_insights table to predict restock needs and analyze salesman performance.</p>
        </div>
        <Button className="bg-[#005914] hover:bg-[#00420f]">
          Generate New Insight
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-0 rounded-xl bg-gradient-to-br from-green-50 to-white">
           <CardHeader className="py-4 border-b border-green-100/50 flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-semibold text-[#005914] flex items-center gap-2">
               <TrendingUp className="w-5 h-5"/>
               Restock Prediction
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Based on current sales velocity from the <strong>sales_transactions</strong> table, 
                <span className="font-semibold text-gray-900"> Century Tuna Flakes 155g</span> will 
                run out of stock in exactly <span className="text-red-600 font-bold">4 days</span>. 
                We recommend a purchase order of 250 cases to maintain optimal buffer levels.
              </p>
              <Button variant="outline" className="mt-4 border-[#005914] text-[#005914] hover:bg-[#E2EBE5]">Approve Restock</Button>
           </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-xl bg-gradient-to-br from-blue-50 to-white">
           <CardHeader className="py-4 border-b border-blue-100/50 flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
               <Lightbulb className="w-5 h-5"/>
               Performance Anomaly
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Sales rep <strong>Michael Sales</strong> has logged 45% fewer <strong>store_visits</strong> this week 
                compared to his 30-day moving average. However, his total sales value increased by 12% 
                suggesting deeper engagement per visit or larger bulk orders.
              </p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
