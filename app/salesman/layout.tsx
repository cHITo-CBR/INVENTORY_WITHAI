import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function SalesmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Enforce salesman role
  if (user.role !== "salesman") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar basePath="/salesman" />
      <SidebarInset className="bg-[#F4F7F6]">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
