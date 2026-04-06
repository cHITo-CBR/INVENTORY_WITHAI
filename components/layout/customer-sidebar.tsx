"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Box,
  Tags,
  ShoppingBag,
  FileText,
  Bell,
  Settings,
  LogOut,
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
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Scale } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

const browseItems = [
  { title: "Products", path: "/customers/catalog/products", icon: Package },
  { title: "Categories", path: "/customers/catalog/categories", icon: Box },
  { title: "Brands", path: "/customers/catalog/brands", icon: Tags },
  { title: "Units", path: "/customers/catalog/units", icon: Scale },
  { title: "Packaging", path: "/customers/catalog/packaging", icon: Box },
];

const orderItems = [
  { title: "My Requests", path: "/customers/buyer-requests", icon: FileText },
  { title: "My Bookings", path: "/customers/bookings", icon: ShoppingBag },
];

const accountItems = [
  { title: "Notifications", path: "/customers/notifications", icon: Bell },
  { title: "Settings", path: "/customers/settings", icon: Settings },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<{ full_name?: string; email?: string; role?: string } | null>(null);

  React.useEffect(() => {
    getCurrentUser().then((session) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  const renderMenuItems = (items: typeof browseItems) =>
    items.map((item) => {
      const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className="font-medium text-gray-700 data-[active=true]:bg-[#E2EBE5] data-[active=true]:text-[#005914] data-[active=true]:font-bold hover:bg-gray-50 h-[clamp(1.75rem,4vh,2.25rem)] text-[clamp(13px,1.5vh,14px)]"
          >
            <Link href={item.path}>
              <item.icon className="w-4.5 h-4.5 mr-1 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar variant="inset" className="border-r border-gray-200">
      <SidebarHeader className="bg-white px-4 py-[clamp(0.5rem,2.5vh,1.5rem)] transition-all duration-300">
        <Link href="/customers/catalog/products" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Century Pacific Food" 
            width={140} 
            height={32} 
            className="h-[clamp(1.25rem,4vh,2rem)] min-h-[20px] w-auto object-contain transition-all duration-300" 
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup className="p-[clamp(0.25rem,1vh,0.5rem)]">
          <SidebarGroupLabel className="text-[#005914] font-semibold text-[clamp(10px,1.3vh,12px)] tracking-wider uppercase mb-0.5 h-[clamp(1.5rem,3.5vh,2rem)]">
            Browse Catalog
          </SidebarGroupLabel>
          <SidebarMenu>{renderMenuItems(browseItems)}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="p-[clamp(0.25rem,1vh,0.5rem)]">
          <SidebarGroupLabel className="text-[#005914] font-semibold text-[clamp(10px,1.3vh,12px)] tracking-wider uppercase mb-0.5 h-[clamp(1.5rem,3.5vh,2rem)]">
            My Orders
          </SidebarGroupLabel>
          <SidebarMenu>{renderMenuItems(orderItems)}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="p-[clamp(0.25rem,1vh,0.5rem)]">
          <SidebarGroupLabel className="text-[#005914] font-semibold text-[clamp(10px,1.3vh,12px)] tracking-wider uppercase mb-0.5 h-[clamp(1.5rem,3.5vh,2rem)]">
            Account
          </SidebarGroupLabel>
          <SidebarMenu>{renderMenuItems(accountItems)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#005914] flex items-center justify-center text-white font-bold text-xs">
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : "CU"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">{user?.full_name ?? "Customer"}</span>
            <span className="text-xs text-gray-500 font-medium">{user?.email ?? "Loading..."}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
