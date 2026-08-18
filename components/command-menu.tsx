"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Clock,
  Wallet,
  BarChart3,
  FileText,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const CommandMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  openMenu: () => void;
} | null>(null);

export function useCommandMenu() {
  const ctx = React.useContext(CommandMenuContext);
  if (!ctx) throw new Error("useCommandMenu must be used within CommandMenu");
  return ctx;
}

const PAGES = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, keywords: "accueil tableau de bord stats" },
  { href: "/employees", label: "Employés", icon: Users, keywords: "équipe personnel" },
  { href: "/departments", label: "Départements", icon: Building2, keywords: "services pôles" },
  { href: "/leaves", label: "Congés", icon: CalendarDays, keywords: "absences vacances rtt" },
  { href: "/attendance", label: "Présences", icon: Clock, keywords: "pointage temps" },
  { href: "/payroll", label: "Salaires", icon: Wallet, keywords: "paie masse salariale" },
  { href: "/evaluations", label: "Évaluations", icon: BarChart3, keywords: "performance objectifs" },
  { href: "/documents", label: "Documents", icon: FileText, keywords: "contrats fiches de paie" },
  { href: "/settings", label: "Paramètres", icon: Settings, keywords: "réglages configuration" },
];

interface CommandItem {
  type: "page" | "employee";
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  employeeId?: string;
}

export function CommandMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();
  const { state } = useStore();

  const openMenu = React.useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setActiveIndex(0);
          }
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const pageItems: CommandItem[] = PAGES.filter((p) =>
      `${p.label} ${p.keywords}`.toLowerCase().includes(normalized)
    ).map((p) => ({
      type: "page" as const,
      label: p.label,
      href: p.href,
      icon: p.icon,
      keywords: p.keywords,
    }));

    const employeeItems: CommandItem[] = state.employees
      .filter((e) => {
        const name = `${e.firstName} ${e.lastName} ${e.role} ${e.department}`.toLowerCase();
        return name.includes(normalized);
      })
      .slice(0, 6)
      .map((e) => ({
        type: "employee" as const,
        label: `${e.firstName} ${e.lastName}`,
        sublabel: e.role,
        href: `/employees/${e.id}`,
        icon: User,
        employeeId: e.id,
      }));

    return [...pageItems, ...employeeItems];
  }, [query, state.employees]);

  const run = React.useCallback(
    (item: CommandItem) => {
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && items[activeIndex]) {
      e.preventDefault();
      run(items[activeIndex]);
    }
  };

  return (
    <CommandMenuContext.Provider value={{ open, setOpen, openMenu }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-xl p-0">
          <DialogTitle className="sr-only">Recherche globale</DialogTitle>
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Rechercher une page ou un employé…"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Rechercher"
            />
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          <ScrollArea className="max-h-[340px]">
            <div className="p-2">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Aucun résultat pour «&nbsp;{query}&nbsp;»
                </p>
              ) : (
                <ul role="listbox">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const active = index === activeIndex;
                    return (
                      <li key={`${item.type}-${item.href}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => run(item)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                            active ? "bg-accent text-accent-foreground" : "text-foreground"
                          )}
                        >
                          {item.type === "employee" && item.employeeId ? (
                            <Avatar
                              name={`${item.label}`}
                              size="sm"
                              className="ring-1 ring-border"
                            />
                          ) : (
                            <span
                              className={cn(
                                "flex size-7 items-center justify-center rounded-md",
                                active ? "bg-primary/15 text-primary" : "bg-muted"
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                          )}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.sublabel ? (
                            <Badge variant="secondary" className="hidden sm:inline-flex">
                              {item.sublabel}
                            </Badge>
                          ) : null}
                          <ChevronRight
                            className={cn("size-4", active ? "opacity-100" : "opacity-0")}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </CommandMenuContext.Provider>
  );
}