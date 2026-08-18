import type { AppState } from "./store";
import { employeeTrend, payrollTrend } from "@/data";

export interface DashboardStats {
  total: number;
  totalDelta: number;
  active: number;
  activeDelta: number;
  onLeave: number;
  onLeaveDelta: number;
  newHires: number;
  newHiresDelta: number;
  monthlyPayroll: number;
  payrollDelta: number;
}

const DAY_MS = 86_400_000;

export function computeDashboardStats(state: AppState): DashboardStats {
  const total = state.employees.length;
  const active = state.employees.filter((e) => e.status === "active").length;
  const onLeave = state.employees.filter((e) => e.status === "on-leave").length;

  const threshold = Date.now() - 90 * DAY_MS;
  const newHires = state.employees.filter(
    (e) => new Date(e.hireDate).getTime() >= threshold
  ).length;

  const monthlyPayroll = Math.round(
    state.employees.reduce((sum, e) => sum + e.salary, 0) / 12
  );

  const last = employeeTrend[employeeTrend.length - 1];
  const prev = employeeTrend[employeeTrend.length - 2];
  const totalDelta = ((last.count - prev.count) / prev.count) * 100;

  const payrollLast = payrollTrend[payrollTrend.length - 1];
  const payrollPrev = payrollTrend[payrollTrend.length - 2];
  const payrollDelta =
    ((payrollLast.value - payrollPrev.value) / payrollPrev.value) * 100;

  return {
    total,
    totalDelta,
    active,
    activeDelta: totalDelta,
    onLeave,
    onLeaveDelta: onLeave - 2,
    newHires,
    newHiresDelta: newHires - 3,
    monthlyPayroll,
    payrollDelta,
  };
}