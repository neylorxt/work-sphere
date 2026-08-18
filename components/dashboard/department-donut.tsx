"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useStore } from "@/lib/store";
import { departments } from "@/data";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { formatNumber } from "@/lib/format";

export function DepartmentDonut() {
  const { state } = useStore();

  const data = React.useMemo(() => {
    return departments.map((dept) => {
      const count = state.employees.filter((e) => e.department === dept.id).length;
      return { name: dept.name, value: count, color: dept.color };
    });
  }, [state.employees]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative h-[280px] w-full" role="img" aria-label="Répartition des employés par département">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="86%"
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--card)"
            isAnimationActive
            animationDuration={700}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold tracking-tight">{total}</p>
        <p className="text-xs text-muted-foreground">Employés</p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name}
            <span className="font-medium text-foreground">{formatNumber(d.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}