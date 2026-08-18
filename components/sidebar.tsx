"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Clock3,
  Wallet,
  BarChart3,
  FileText,
  Settings,
  Workflow,
  ChevronsLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/dashboard-shell";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employés", icon: Users },
  { href: "/departments", label: "Départements", icon: Building2 },
  { href: "/leaves", label: "Congés", icon: CalendarDays },
  { href: "/attendance", label: "Présences", icon: Clock3 },
  { href: "/payroll", label: "Salaires", icon: Wallet },
  { href: "/evaluations", label: "Évaluations", icon: BarChart3 },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
        <Workflow className="size-5" />
      </div>
      {!collapsed ? (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">WorkSphere</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Gestion RH
          </p>
        </div>
      ) : null}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(href, pathname);

  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary dark:bg-primary/15"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed ? <span className="truncate">{label}</span> : null}
      {active ? (
        <span className="absolute -left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      ) : null}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function SidebarContent({
  collapsed,
  mobile = false,
  onNavigate,
}: {
  collapsed: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          collapsed && !mobile && "justify-center px-0"
        )}
      >
        <Logo collapsed={collapsed && !mobile} />
      </div>
      <nav
        aria-label="Navigation principale"
        className={cn("flex-1 space-y-1 overflow-y-auto px-3 py-3", collapsed && !mobile && "px-2")}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed && !mobile}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="border-t p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-muted/60 p-2.5",
            collapsed && !mobile && "justify-center p-2"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            AD
          </div>
          {!collapsed || mobile ? (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold">Alex Dupont</p>
              <p className="truncate text-[11px] text-muted-foreground">Administrateur</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden border-r bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out lg:block",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Barre latérale"
    >
      <div className="flex h-full flex-col">
        <SidebarContent collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute bottom-4 right-2 text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
        >
          <ChevronsLeft
            className={cn("size-4 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </Button>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <div className={cn("lg:hidden", mobileOpen && "fixed inset-0 z-40")}>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Barre latérale mobile"
      >
        <SidebarContent
          collapsed={false}
          mobile
          onNavigate={() => setMobileOpen(false)}
        />
        <Separator className="sr-only" />
      </aside>
    </div>
  );
}