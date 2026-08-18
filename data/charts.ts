export interface TrendPoint {
  month: string;
  count: number;
}

export const employeeTrend: TrendPoint[] = [
  { month: "Sep 25", count: 28 },
  { month: "Oct 25", count: 29 },
  { month: "Nov 25", count: 30 },
  { month: "Déc 25", count: 31 },
  { month: "Jan 26", count: 32 },
  { month: "Fév 26", count: 33 },
  { month: "Mar 26", count: 34 },
  { month: "Avr 26", count: 35 },
  { month: "Mai 26", count: 36 },
  { month: "Juin 26", count: 37 },
  { month: "Juil 26", count: 39 },
  { month: "Août 26", count: 42 },
];

export const departmentBreakdown = [
  { name: "Engineering", value: 12, color: "#6366f1" },
  { name: "Marketing", value: 7, color: "#ec4899" },
  { name: "Sales", value: 7, color: "#f59e0b" },
  { name: "Finance", value: 5, color: "#10b981" },
  { name: "HR", value: 5, color: "#06b6d4" },
  { name: "Design", value: 6, color: "#a855f7" },
];

export const attendanceBreakdown = [
  { name: "Présents", value: 34, color: "#10b981" },
  { name: "Absents", value: 2, color: "#f43f5e" },
  { name: "Télétravail", value: 3, color: "#3b82f6" },
  { name: "En congé", value: 3, color: "#f59e0b" },
];

export const payrollTrend = [
  { month: "Sep 25", value: 412000 },
  { month: "Oct 25", value: 425000 },
  { month: "Nov 25", value: 430000 },
  { month: "Déc 25", value: 448000 },
  { month: "Jan 26", value: 452000 },
  { month: "Fév 26", value: 461000 },
  { month: "Mar 26", value: 468000 },
  { month: "Avr 26", value: 475000 },
  { month: "Mai 26", value: 479000 },
  { month: "Juin 26", value: 486000 },
  { month: "Juil 26", value: 491000 },
  { month: "Août 26", value: 498000 },
];

export const performanceTrend = [
  { month: "S1 2024", score: 68 },
  { month: "S2 2024", score: 71 },
  { month: "S1 2025", score: 74 },
  { month: "S2 2025", score: 78 },
  { month: "S1 2026", score: 81 },
];