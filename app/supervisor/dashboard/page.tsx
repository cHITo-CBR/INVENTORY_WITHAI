"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, FileText, Clock, ShoppingBag, AlertTriangle, DollarSign, Loader2, Inbox, TrendingUp, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSupervisorKPIs, getTeamSalesmen, getRecentTeamActivity, type SupervisorKPIs, type TeamSalesman } from "@/app/actions/supervisor-actions";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <Inbox className="w-10 h-10 mb-2" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default function SupervisorDashboardPage() {
  const [kpis, setKpis] = useState<SupervisorKPIs | null>(null);
  const [salesmen, setSalesmen] = useState<TeamSalesman[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, teamData, activityData] = await Promise.all([
          getSupervisorKPIs(),
          getTeamSalesmen(),
          getRecentTeamActivity(),
        ]);
        setKpis(kpiData);
        setSalesmen(teamData);
        setActivity(activityData);
      } catch (err) {
        console.error("Supervisor dashboard error:", err);
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
    { label: "Active Salesmen", value: kpis?.activeSalesmen ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50/50" },
    { label: "Visits Today", value: kpis?.visitsToday ?? 0, icon: MapPin, color: "text-teal-600", bg: "bg-teal-50/50" },
    { label: "Submitted Callsheets", value: kpis?.submittedCallsheets ?? 0, icon: FileText, color: "text-amber-600", bg: "bg-amber-50/50" },
    { label: "Pending Reviews", value: kpis?.pendingCallsheetReviews ?? 0, icon: Clock, color: kpis?.pendingCallsheetReviews ? "text-orange-600" : "text-gray-900", bg: kpis?.pendingCallsheetReviews ? "bg-orange-50/50" : "" },
    { label: "Pending Requests", value: kpis?.pendingRequests ?? 0, icon: ShoppingBag, color: kpis?.pendingRequests ? "text-purple-600" : "text-gray-900", bg: kpis?.pendingRequests ? "bg-purple-50/50" : "" },
    { label: "Pending Bookings", value: kpis?.pendingBookings ?? 0, icon: ShoppingBag, color: kpis?.pendingBookings ? "text-indigo-600" : "text-gray-900", bg: "" },
    { label: "Monthly Sales", value: `₱${(kpis?.monthlySalesTotal ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50/50", isText: true },
    { label: "Low Stock Items", value: kpis?.lowStockItems ?? 0, icon: AlertTriangle, color: kpis?.lowStockItems ? "text-red-600" : "text-gray-900", bg: kpis?.lowStockItems ? "bg-red-50/50" : "" },
  ];

  const topSalesmen = [...salesmen].sort((a, b) => b.monthlySales - a.monthlySales).slice(0, 5);

  const allActivity = [
    ...(activity?.visits || []).map((v: any) => ({ type: "visit", label: `${v.users?.full_name} visited ${v.customers?.store_name}`, date: v.created_at })),
    ...(activity?.callsheets || []).map((c: any) => ({ type: "callsheet", label: `${c.users?.full_name} — callsheet ${c.status}`, date: c.created_at })),
    ...(activity?.requests || []).map((r: any) => ({ type: "request", label: `${r.users?.full_name} — request for ${r.customers?.store_name}`, date: r.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Supervisor Dashboard</h1>
        <p className="text-gray-500 text-sm">Monitor your team's field operations and performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label} className={`shadow-sm border-0 rounded-xl overflow-hidden ${card.bg}`}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className={`text-xs font-medium uppercase flex items-center gap-2 ${card.color}`}>
                <card.icon className="w-4 h-4" /> {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className={`text-2xl font-bold ${card.color}`}>
                {(card as any).isText ? card.value : (card.value as number).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Salesmen */}
        <Card className="shadow-sm border-0 rounded-xl">
          <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#005914]" /> Top Salesmen
            </CardTitle>
            <Link href="/supervisor/team">
              <Button variant="ghost" size="sm" className="text-[#005914]">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {topSalesmen.length === 0 ? (
              <EmptyState message="No salesmen data" />
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSalesmen.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell className="text-right">{s.visitsToday}</TableCell>
                      <TableCell className="text-right font-bold text-[#005914]">₱{s.monthlySales.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Team Activity */}
        <Card className="shadow-sm border-0 rounded-xl">
          <CardHeader className="py-4 border-b border-gray-100 bg-white rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-gray-800">Recent Team Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {allActivity.length === 0 ? (
              <EmptyState message="No recent activity" />
            ) : (
              <div className="space-y-2">
                {allActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.type === "visit" ? "bg-teal-50 text-teal-600" :
                      item.type === "callsheet" ? "bg-amber-50 text-amber-600" :
                      "bg-purple-50 text-purple-600"
                    }`}>
                      {item.type === "visit" ? <MapPin className="w-4 h-4" /> :
                       item.type === "callsheet" ? <FileText className="w-4 h-4" /> :
                       <ShoppingBag className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
