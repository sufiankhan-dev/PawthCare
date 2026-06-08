"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  PawPrint,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { LogoMark } from "@/components/logo";
import { AssistantWidget } from "@/components/ai/assistant-widget";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const OWNER_NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/app/pets", label: "My pets", icon: <PawPrint /> },
  { href: "/app/appointments", label: "Appointments", icon: <Calendar /> },
];

const CLINIC_NAV: NavItem[] = [
  { href: "/clinic", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/clinic/patients", label: "Patients", icon: <Users /> },
  { href: "/clinic/appointments", label: "Appointments", icon: <Calendar /> },
  { href: "/clinic/billing", label: "Billing", icon: <Receipt /> },
];

export function AppShell({
  portal,
  user,
  children,
}: {
  portal: "owner" | "clinic";
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const nav = portal === "clinic" ? CLINIC_NAV : OWNER_NAV;
  const root = portal === "clinic" ? "/clinic" : "/app";

  const isActive = (href: string) =>
    href === root ? pathname === href : pathname.startsWith(href);

  const activeLabel =
    nav.find((i) => isActive(i.href))?.label ?? "Dashboard";

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={root}>
                  <LogoMark className="size-8 shrink-0" />
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold">PawthCare</span>
                    <span className="text-xs text-muted-foreground">
                      {portal === "clinic" ? "Clinic" : "Pet owner"}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setAssistantOpen(true)}
                    tooltip="AI Assistant"
                    className="bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-active:bg-primary"
                  >
                    <Sparkles />
                    <span>Ask AI</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs">
                        {initials || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 overflow-hidden text-left leading-none">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-full" />
          <span className="font-medium">{activeLabel}</span>
        </header>
        <div className="p-4 md:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>

      <AssistantWidget open={assistantOpen} onOpenChange={setAssistantOpen} />
    </SidebarProvider>
  );
}
