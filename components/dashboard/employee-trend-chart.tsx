"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { employeeTrend } from "@/data";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

export function EmployeeTrendChart() {
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Évolution des effectifs sur 12 mois">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={employeeTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="employeeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            dy={8}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Employés"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="url(#employeeFill)"
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}