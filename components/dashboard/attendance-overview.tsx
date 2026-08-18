"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

const SEGMENTS = [
  { key: "present", label: "Présents", color: "#10b981" },
  { key: "remote", label: "Télétravail", color: "#3b82f6" },
  { key: "leave", label: "En congé", color: "#f59e0b" },
  { key: "absent", label: "Absents", color: "#f43f5e" },
] as const;

export function AttendanceOverview() {
  const { state } = useStore();
  const records = state.attendance;

  const counts = React.useMemo(() => {
    const result: Record<(typeof SEGMENTS)[number]["key"], number> = {
      present: 0,
      remote: 0,
      leave: 0,
      absent: 0,
    };
    for (const record of records) {
      if (record.status === "present") result.present += 1;
      else if (record.status === "remote") result.remote += 1;
      else if (record.status === "leave") result.leave += 1;
      else result.absent += 1;
    }
    return result;
  }, [records]);

  const total = Math.max(1, records.length);
  const percent = (value: number) => (value / total) * 100;

  return (
    <div className="space-y-5">
      <div className="flex h-4 w-full overflow-hidden rounded-full" role="img" aria-label="Répartition des présences du jour">
        {SEGMENTS.map((segment) => (
          <div
            key={segment.key}
            className="h-full transition-all duration-700"
            style={{
              width: `${percent(counts[segment.key])}%`,
              backgroundColor: segment.color,
            }}
            title={`${segment.label} : ${counts[segment.key]}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SEGMENTS.map((segment) => (
          <div
            key={segment.key}
            className="flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/40"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </span>
            <span className="text-right">
              <span className="block text-sm font-semibold">{counts[segment.key]}</span>
              <span
                className={cn(
                  "block text-[11px]",
                  counts[segment.key] === 0 ? "text-muted-foreground/50" : "text-muted-foreground"
                )}
              >
                {formatPercent(percent(counts[segment.key]), 0)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}