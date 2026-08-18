"use client";

import * as React from "react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    fill?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  formatter?: (value: number | string, name: string) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg">
      {label !== undefined && label !== "" ? (
        <p className="mb-1 text-xs font-semibold text-popover-foreground">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const value = entry.value ?? 0;
          const name = entry.name ?? entry.dataKey ?? "";
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? entry.fill ?? "#6366f1" }}
              />
              <span className="text-muted-foreground">{name}</span>
              <span className="ml-auto pl-4 font-semibold text-popover-foreground">
                {formatter ? formatter(value, String(name)) : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}