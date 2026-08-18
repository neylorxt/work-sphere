"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DesktopSidebar, MobileSidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CommandMenu } from "@/components/command-menu";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within DashboardShell");
  return ctx;
}

const SIDEBAR_KEY = "worksphere-sidebar-collapsed";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      // Syncing sidebar state with persisted localStorage on mount (external system).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsedState(window.localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const setCollapsed = React.useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, setCollapsed, mobileOpen]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="min-h-screen">
        <DesktopSidebar />
        <MobileSidebar />
        <CommandMenu>
          <div
            className={cn(
              "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
              collapsed ? "lg:pl-16" : "lg:pl-64"
            )}
          >
            <Topbar />
            <main className="flex-1 overflow-x-clip p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-[1400px] animate-fade-in-up">
                {children}
              </div>
            </main>
            <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
              WorkSphere — Application de gestion RH &amp; employés · Données de démonstration
            </footer>
          </div>
        </CommandMenu>
      </div>
    </SidebarContext.Provider>
  );
}