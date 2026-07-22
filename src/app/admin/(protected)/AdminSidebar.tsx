"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Users,
  MessageSquare,
  Trophy,
  BookOpen,
  Briefcase,
  BarChart3,
  Lock,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
};

// Intel is the first real module. Everything below it is the future-proofed
// module list from the spec — shown so the admin's shape is visible, but
// disabled rather than linking to pages that don't exist yet.
const MODULES: NavItem[] = [
  {
    label: "Intel",
    href: "/admin/intel",
    icon: Newspaper,
    children: [
      { label: "All articles", href: "/admin/intel" },
      { label: "New article", href: "/admin/intel/new" },
      { label: "Categories", href: "/admin/intel/categories" },
      { label: "Tags", href: "/admin/intel/tags" },
    ],
  },
  {
    label: "Toolkit",
    href: "/admin/toolkit/pillars",
    icon: FolderTree,
    children: [
      { label: "Pillars", href: "/admin/toolkit/pillars" },
    ],
  },
  {
    label: "Career Hub",
    href: "/admin/career-hub/job-resources",
    icon: Briefcase,
    children: [
      { label: "Job Resources", href: "/admin/career-hub/job-resources" },
      { label: "Small Wins", href: "/admin/career-hub/small-wins" },
    ],
  },
  {
    label: "Automation",
    href: "/admin/automation",
    icon: Zap,
    children: [
      { label: "Dashboard", href: "/admin/automation" },
      { label: "Content queue", href: "/admin/automation/queue" },
      { label: "History", href: "/admin/automation/history" },
      { label: "Settings", href: "/admin/automation/settings" },
      { label: "Logs", href: "/admin/automation/logs" },
    ],
  },
];

// Toolkit's only real page so far is Pillars — Guides (the selfHelpGuides
// authoring UI) is the natural next addition here, not part of this
// phase (see MIGRATION_PLAN.md 4.3). Career Hub above covers Job
// Resources and Small Wins only — Resume Builder, Application Tracker,
// and Courses are real product surfaces still being scoped, not started.
const FUTURE_MODULES: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Stories", icon: BookOpen },
  { label: "Community", icon: MessageSquare },
  { label: "Challenges", icon: Trophy },
  { label: "Resources", icon: FolderTree },
  { label: "Users", icon: Users },
  { label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/admin">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  M
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold">MenWhoFeel</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                  <Link href="/admin">
                    <LayoutDashboard />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULES.map((mod) => {
                const isActiveParent = pathname.startsWith(mod.href);
                return (
                  <SidebarMenuItem key={mod.href}>
                    <SidebarMenuButton asChild isActive={pathname === mod.href}>
                      <Link href={mod.href}>
                        <mod.icon />
                        <span>{mod.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {mod.children && isActiveParent && (
                      <SidebarMenuSub>
                        {mod.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                              <Link href={child.href}>{child.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FUTURE_MODULES.map((mod) => (
                <SidebarMenuItem key={mod.label}>
                  <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                    <mod.icon />
                    <span>{mod.label}</span>
                    <Lock className="ml-auto size-3.5" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
