"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  Bell,
  ShoppingBag,
  LogOut
} from "lucide-react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

interface SalesmanLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/salesman/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/salesman/customers", icon: Users, label: "Stores" },
  { href: "/salesman/callsheets", icon: FileText, label: "Rounds" },
  { href: "/salesman/bookings", icon: ShoppingBag, label: "Orders" },
  { href: "/salesman/visits", icon: MapPin, label: "Visits" },
];

const sideLinks = [
  { href: "/salesman/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/salesman/customers", icon: Users, label: "Stores" },
  { href: "/salesman/visits", icon: MapPin, label: "Store Visits" },
  { href: "/salesman/callsheets", icon: FileText, label: "Callsheets" },
  { href: "/salesman/bookings", icon: ShoppingBag, label: "Bookings" },
  { href: "/salesman/requests", icon: FileText, label: "Requests" },
  { href: "/salesman/notifications", icon: Bell, label: "Notifications" },
];

export default function SalesmanLayout({ children }: SalesmanLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then((session) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  const initials = user?.full_name ? user.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "FP";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 pb-24 lg:pb-0 lg:pl-72">

      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex-col z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005914] to-[#00802b] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-green-900/20">
              SP
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">SalesPortal</h2>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Field Operations</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sideLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-[#005914] to-[#00802b] text-white shadow-lg shadow-green-900/20 scale-[1.02]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005914] to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name ?? "Field Partner"}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">{user?.email ?? "Loading..."}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ Mobile Header ═══ */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#005914] to-[#00802b] flex items-center justify-center text-white font-black text-[10px] shadow-md lg:hidden">
            SP
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 lg:text-base">Field View</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/salesman/notifications" className="relative p-2.5 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005914] to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-md">
            {initials}
          </div>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 p-5 lg:p-8 animate-in fade-in duration-300">
        {children}
      </main>

      {/* ═══ Mobile Bottom Nav ═══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-gray-100/50 lg:hidden safe-area-bottom">
        <div className="flex h-20 items-end pb-2 px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 rounded-2xl transition-all duration-200 ${isActive
                    ? "text-[#005914]"
                    : "text-gray-400"
                  }`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-green-50 shadow-sm scale-110" : ""
                  }`}>
                  <link.icon className={`w-5 h-5 transition-all ${isActive ? "stroke-[2.5px]" : ""}`} />
                </div>
                <span className={`text-[10px] font-bold transition-all ${isActive ? "text-[#005914]" : "text-gray-400"}`}>
                  {link.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#005914] animate-in zoom-in duration-200" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
