export type EmployeeStatus = "active" | "on-leave" | "inactive";

export type ContractType = "CDI" | "CDD" | "Freelance" | "Stage";

export type DepartmentId =
  | "engineering"
  | "marketing"
  | "sales"
  | "finance"
  | "hr"
  | "design";

export type LeaveType = "paid" | "rtt" | "sick" | "personal" | "remote";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type AttendanceStatus = "present" | "absent" | "remote" | "leave";

export type DocumentType =
  | "contract"
  | "payslip"
  | "certificate"
  | "administrative";

export type DocumentStatus = "valid" | "pending" | "expired";

export type EvaluationStatus = "done" | "scheduled";

export type ActivityType =
  | "employee_added"
  | "leave_approved"
  | "salary_updated"
  | "document_added"
  | "evaluation_completed";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: DepartmentId;
  manager: string | null;
  hireDate: string;
  salary: number;
  location: string;
  contractType: ContractType;
  status: EmployeeStatus;
}

export interface Department {
  id: DepartmentId;
  name: string;
  head: string;
  budget: number;
  color: string;
  progression: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string;
  days: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  gross: number;
  bonus: number;
  net: number;
  lastRaise: string;
  raisePercent: number;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  score: number;
  period: string;
  status: EvaluationStatus;
  lastEvaluated: string;
  nextEvaluation: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  employeeId: string;
  date: string;
  size: string;
  status: DocumentStatus;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  time: string;
}

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: DepartmentId;
  manager: string;
  hireDate: string;
  salary: number;
  location: string;
  contractType: ContractType;
  status: EmployeeStatus;
  avatar: string;
}

export type EmployeeSortField =
  | "name"
  | "role"
  | "department"
  | "hireDate"
  | "salary"
  | "status";