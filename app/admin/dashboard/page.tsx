"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Package, AlertTriangle, ShieldCheck, DollarSign, Loader2, Inbox } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getDashboardKPIs,
  getRecentTransactions,
  getLowStockItems,
  type DashboardKPIs,
  type RecentTransaction,
  type LowStockItem,
} from "@/app/actions/dashboard";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <Inbox className="w-10 h-10 mb-2" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, txData, stockData] = await Promise.all([
          getDashboardKPIs(),
          getRecentTransactions(),
          getLowStockItems(),
        ]);
        setKpis(kpiData);
        setTransactions(txData);
        setLowStock(stockData);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#005914]" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Users",
      value: kpis?.totalUsers ?? 0,
      icon: Users,
      color: "text-gray-900",
      bg: "",
    },
    {
      label: "Pending Approvals",
      value: kpis?.pendingApprovals ?? 0,
      icon: ShieldCheck,
      color: kpis?.pendingApprovals ? "text-yellow-600" : "text-gray-900",
      bg: "",
    },
    {
      label: "Total Customers",
      value: kpis?.totalCustomers ?? 0,
      icon: ShoppingCart,
      color: "text-gray-900",
      bg: "",
    },
    {
      label: "Total Products",
      value: kpis?.totalProducts ?? 0,
      icon: Package,
      color: "text-gray-900",
      bg: "",
    },
    {
      label: "Low Stock Items",
      value: kpis?.lowStockItems ?? 0,
      icon: AlertTriangle,
      color: kpis?.lowStockItems ? "text-red-700" : "text-gray-900",
      bg: kpis?.lowStockItems ? "bg-red-50/50" : "",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enterprise Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back. Here is the daily summary of operations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label} className={`shadow-sm border-0 rounded-xl relative overflow-hidden ${card.bg}`}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className={`text-xs font-medium uppercase flex items-center gap-2 ${card.value > 0 && card.label === "Low Stock Items" ? "text-red-600" : "text-gray-500"}`}>
                <card.icon className="w-4 h-4" /> {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="shadow-sm border-0 rounded-xl">
          <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-gray-800">Recent Sales Transactions</CardTitle>
            <Link href="/admin/sales">
              <Button variant="ghost" size="sm" className="text-[#005914]">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <EmptyState message="No sales transactions yet" />
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.customer_name}</TableCell>
                      <TableCell className="text-right font-bold">₱{tx.total_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                          tx.status === "completed" ? "bg-green-50 text-green-700" :
                          tx.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="shadow-sm border-0 rounded-xl">
          <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-gray-800">Low Stock Alerts</CardTitle>
            <Link href="/admin/inventory">
              <Button variant="ghost" size="sm" className="text-[#005914]">View Inventory</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {lowStock.length === 0 ? (
              <EmptyState message="No low stock alerts" />
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>SKU Variant</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-gray-900">{item.variant_name}</TableCell>
                      <TableCell className="text-right font-bold text-red-600">{item.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
