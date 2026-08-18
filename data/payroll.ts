import type { PayrollEntry } from "@/types";
import { employees } from "./employees";

const BONUS_BY_ROLE: Record<string, number> = {
  "VP Engineering": 24000,
  "VP Marketing": 20000,
  "VP Sales": 32000,
  "VP Finance": 26000,
  "VP People": 18000,
  "VP Design": 16000,
  "Engineering Manager": 15000,
  "Marketing Manager": 12000,
  "Sales Manager": 18000,
  "Design Lead": 9000,
};

const RAISE_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
const RAISE_PERCENT = [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];

export function buildPayroll(): PayrollEntry[] {
  return employees.map((employee, index) => {
    const bonus = BONUS_BY_ROLE[employee.role] ?? Math.round((employee.salary * 8) / 100);
    const net = Math.round((employee.salary + bonus) * 0.77);
    const raiseMonth = RAISE_MONTHS[index % RAISE_MONTHS.length];
    const raiseYear = raiseMonth >= 9 ? 2025 : 2026;
    const raisePercent = RAISE_PERCENT[index % RAISE_PERCENT.length];

    return {
      id: `PAY-${employee.id}`,
      employeeId: employee.id,
      gross: employee.salary,
      bonus,
      net,
      lastRaise: `${raiseYear}-${String(raiseMonth).padStart(2, "0")}-01`,
      raisePercent,
    };
  });
}