export { employees, employeeById, employeeFullName } from "./employees";
export { departments, departmentById, departmentName, departmentColor } from "./departments";
export { leaves, leaveTypeLabel } from "./leaves";
export { buildAttendance } from "./attendance";
export { buildPayroll } from "./payroll";
export { buildEvaluations } from "./evaluations";
export { documents } from "./documents";
export { activity } from "./activity";
export {
  employeeTrend,
  departmentBreakdown,
  attendanceBreakdown,
  payrollTrend,
  performanceTrend,
} from "./charts";

export type { TrendPoint } from "./charts";