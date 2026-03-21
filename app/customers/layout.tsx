import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Enforce buyer role
  if (user.role !== "buyer") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset className="bg-[#F4F7F6]">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
