"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type StatTone = "positive" | "negative" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  delta?: number;
  deltaSuffix?: string;
  comparison?: string;
  tone?: StatTone;
  loading?: boolean;
}

const toneStyles: Record<StatTone, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  delta,
  deltaSuffix = "%",
  comparison,
  tone = "neutral",
  loading,
}: StatCardProps) {
  const DeltaIcon = !delta
    ? Minus
    : delta > 0
      ? ArrowUpRight
      : ArrowDownRight;

  const deltaLabel = delta === undefined
    ? null
    : delta > 0
      ? `+${delta.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}${deltaSuffix}`
      : `${delta.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}${deltaSuffix}`;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110",
              iconClassName
            )}
          >
            <Icon className="size-4.5" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
          {delta !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                toneStyles[tone]
              )}
            >
              <DeltaIcon className="size-3.5" />
              {deltaLabel}
            </span>
          ) : null}
          {comparison ? (
            <span className="text-muted-foreground">{comparison}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}