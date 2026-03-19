"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Box, 
  CheckSquare, 
  ClipboardList, 
  FileText, 
  Home, 
  LayoutDashboard, 
  MapPin, 
  Package, 
  Package2, 
  Settings, 
  ShieldAlert, 
  ShoppingCart, 
  Sparkles, 
  Tags, 
  Users, 
  Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Account Approvals",
    url: "/admin/approvals",
    icon: CheckSquare,
  },
  {
    title: "User Management",
    url: "/users",
    icon: ShieldAlert,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
];

const catalogItems = [
  { title: "Products", url: "/catalog/products", icon: Package },
  { title: "Categories", url: "/catalog/categories", icon: Box },
  { title: "Brands", url: "/catalog/brands", icon: Tags },
  { title: "Units", url: "/catalog/units", icon: Scale }, // Note: Scale is not imported, use something else? 
  // Let's use Package2 for units
  { title: "Packaging Types", url: "/catalog/packaging", icon: Box },
];
// Fix icon imports
import { Scale } from "lucide-react"; 

const operationsItems = [
  { title: "Inventory", url: "/inventory", icon: ClipboardList },
  { title: "Sales Transactions", url: "/sales", icon: ShoppingCart },
  { title: "Store Visits", url: "/visits", icon: MapPin },
];

const analyticsItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "AI Insights", url: "/reports/ai-insights", icon: Sparkles },
];

const systemItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Audit Logs", url: "/audit", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" className="border-r border-gray-200">
      <SidebarHeader className="bg-white px-4 py-4 md:py-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Century Pacific Food" width={140} height={32} className="h-8 w-auto object-contain" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#005914] font-semibold text-xs tracking-wider uppercase mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  className="font-medium text-gray-700 data-[active=true]:bg-[#E2EBE5] data-[active=true]:text-[#005914] data-[active=true]:font-bold hover:bg-gray-50"
                >
                  <Link href={item.url}>
                    <item.icon className="w-5 h-5 mr-1" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#005914] font-semibold text-xs tracking-wider uppercase mb-1">
            Product Catalog
          </SidebarGroupLabel>
          <SidebarMenu>
            {catalogItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  className="font-medium text-gray-700 data-[active=true]:bg-[#E2EBE5] data-[active=true]:text-[#005914] data-[active=true]:font-bold hover:bg-gray-50"
                >
                  <Link href={item.url}>
                    <item.icon className="w-5 h-5 mr-1" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#005914] font-semibold text-xs tracking-wider uppercase mb-1">
            Operations
          </SidebarGroupLabel>
          <SidebarMenu>
            {operationsItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  className="font-medium text-gray-700 data-[active=true]:bg-[#E2EBE5] data-[active=true]:text-[#005914] data-[active=true]:font-bold hover:bg-gray-50"
                >
                  <Link href={item.url}>
                    <item.icon className="w-5 h-5 mr-1" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#005914] font-semibold text-xs tracking-wider uppercase mb-1">
            Analytics & System
          </SidebarGroupLabel>
          <SidebarMenu>
            {[...analyticsItems, ...systemItems].map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  className="font-medium text-gray-700 data-[active=true]:bg-[#E2EBE5] data-[active=true]:text-[#005914] data-[active=true]:font-bold hover:bg-gray-50"
                >
                  <Link href={item.url}>
                    <item.icon className="w-5 h-5 mr-1" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#005914] flex items-center justify-center text-white font-bold text-xs">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">Admin User</span>
            <span className="text-xs text-gray-500 font-medium">admin@century.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
