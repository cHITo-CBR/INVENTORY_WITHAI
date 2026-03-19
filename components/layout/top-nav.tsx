"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, SunMoon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 shadow-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-2 text-gray-500 hover:text-[#005914]" />
        
        {/* Global Search */}
        <div className="hidden sm:flex relative max-w-md w-full ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search products, customers, transactions..." 
            className="pl-10 bg-gray-50 border-gray-200 h-10 rounded-full focus-visible:ring-[#005914] w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#005914] hover:bg-gray-50 rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#005914] hover:bg-gray-50 rounded-full">
          <SunMoon className="h-5 w-5" />
        </Button>
        
        <form action="/login" method="GET">
           <Button type="submit" variant="outline" className="ml-2 font-semibold text-[#005914] border-[#005914] rounded-full hover:bg-[#E2EBE5]">
              Log Out
           </Button>
        </form>
      </div>
    </header>
  );
}
