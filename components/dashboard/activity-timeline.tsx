"use client";

import { UserPlus, CalendarCheck2, Wallet, FilePlus2, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityType } from "@/types";
import { cn } from "@/lib/utils";

const ACTIVITY_STYLE: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  employee_added: { icon: UserPlus, className: "bg-indigo-500/15 text-indigo-500" },
  leave_approved: { icon: CalendarCheck2, className: "bg-emerald-500/15 text-emerald-500" },
  salary_updated: { icon: Wallet, className: "bg-amber-500/15 text-amber-500" },
  document_added: { icon: FilePlus2, className: "bg-sky-500/15 text-sky-500" },
  evaluation_completed: { icon: Star, className: "bg-fuchsia-500/15 text-fuchsia-500" },
};

export function ActivityTimeline() {
  const { state } = useStore();
  const items = state.activity.slice(0, 8);

  return (
    <div className="relative space-y-5 pl-1" aria-label="Activité récente">
      <div className="absolute bottom-2 left-[19px] top-2 w-px bg-border" aria-hidden="true" />
      {items.map((item) => {
        const config = ACTIVITY_STYLE[item.type] ?? ACTIVITY_STYLE.document_added;
        const Icon = config.icon;
        return (
          <div key={item.id} className="relative flex items-start gap-3">
            <span
              className={cn(
                "z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                config.className
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm leading-snug">{item.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(item.time)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}