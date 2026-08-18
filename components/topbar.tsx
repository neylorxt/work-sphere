"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Users,
  CalendarCheck2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/dashboard-shell";
import { useTheme } from "@/components/theme-provider";
import { useCommandMenu } from "@/components/command-menu";
import { formatRelativeTime } from "@/lib/format";

const NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Nouvelle demande de congé",
    description: "Jules Lambert demande un RTT le 21 août.",
    time: "2026-08-18T08:45:00",
    icon: CalendarCheck2,
    read: false,
  },
  {
    id: "notif-2",
    title: "Nouvel employé ajouté",
    description: "Oscar Colin a rejoint l'équipe RH.",
    time: "2026-08-18T09:12:00",
    icon: Users,
    read: false,
  },
  {
    id: "notif-3",
    title: "Document en attente",
    description: "Le contrat de Gabriel Garcia attend une signature.",
    time: "2026-08-17T14:40:00",
    icon: FileText,
    read: false,
  },
  {
    id: "notif-4",
    title: "Évaluation terminée",
    description: "L'évaluation de Nathan Fournier a été validée.",
    time: "2026-08-17T15:10:00",
    icon: FileText,
    read: true,
  },
];

export function Topbar() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { openMenu } = useCommandMenu();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </Button>

      <button
        type="button"
        onClick={openMenu}
        className="group flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Recherche globale"
      >
        <Search className="size-4" />
        <span className="hidden flex-1 text-left sm:inline">Rechercher…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-5" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="px-0 text-sm">Notifications</DropdownMenuLabel>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
              >
                Tout marquer comme lu
              </Button>
            </div>
            <DropdownMenuSeparator />
            {notifications.slice(0, 6).map((notif) => {
              const Icon = notif.icon;
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                  )}
                  className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{notif.title}</span>
                      {!notif.read ? (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {notif.description}
                    </span>
                    <span className="block text-[11px] text-muted-foreground/70">
                      {formatRelativeTime(notif.time)}
                    </span>
                  </span>
                </button>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {theme === "dark" ? (
            <Sun className="size-5 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="size-5 transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-md p-1 pr-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Menu utilisateur"
            >
              <Avatar name="Alex Dupont" firstName="Alex" lastName="Dupont" size="sm" />
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-semibold">Alex Dupont</span>
                <span className="block text-xs text-muted-foreground">Administrateur</span>
              </span>
              <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar name="Alex Dupont" firstName="Alex" lastName="Dupont" size="sm" />
              <span className="leading-tight">
                <span className="block font-semibold">Alex Dupont</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  admin@worksphere.fr
                </span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="size-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="size-4" />
                Paramètres
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                toast.success("Vous avez été déconnecté.");
              }}
            >
              <LogOut className="size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}