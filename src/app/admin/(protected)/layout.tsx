import type { ReactNode } from "react";
import { verifyAdminSession } from "@/lib/admin/dal";
import { LogoutButton } from "./LogoutButton";
import { AdminSidebar } from "./AdminSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { adminUser } = await verifyAdminSession();

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{adminUser.email ?? adminUser.name ?? "Admin"}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
