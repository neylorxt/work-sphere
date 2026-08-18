import type { Evaluation } from "@/types";
import { employees } from "./employees";

const SCORES = [72, 78, 83, 85, 68, 74, 88, 76, 81, 69, 79, 86, 75, 73, 82, 70, 80, 87, 77, 71, 84, 66, 89, 75, 78, 69, 82, 73, 76, 85, 74, 68, 81, 72, 79, 86, 70, 77, 84, 75, 83, 71];

export function buildEvaluations(): Evaluation[] {
  return employees.map((employee, index) => {
    const score = SCORES[index % SCORES.length];
    const scheduled = index % 7 === 0;
    const lastMonth = 3 + (index % 9);
    const lastYear = lastMonth >= 9 ? 2025 : 2026;
    const nextMonth = (lastMonth % 12) + 1;

    return {
      id: `EVAL-${employee.id}`,
      employeeId: employee.id,
      score,
      period: scheduled ? "S1 2026" : "S2 2026",
      status: scheduled ? "scheduled" : "done",
      lastEvaluated: `${lastYear}-${String(lastMonth).padStart(2, "0")}-15`,
      nextEvaluation: `${nextMonth >= 9 ? 2026 : 2026}-${String(nextMonth).padStart(2, "0")}-01`,
    };
  });
}