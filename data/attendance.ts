import type { AttendanceRecord, AttendanceStatus, Employee } from "@/types";
import { employees } from "./employees";

const TODAY = "2026-08-18";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function checkInFor(employee: Employee): string {
  const minute = (employee.id.charCodeAt(employee.id.length - 1) * 7) % 50;
  const hour = 8 + ((employee.id.charCodeAt(0) + employee.id.charCodeAt(1)) % 2);
  return `${pad(hour)}:${pad(8 + minute)}`;
}

function checkOutFor(employee: Employee): string {
  const minute = (employee.id.charCodeAt(employee.id.length - 2) * 9) % 50;
  return `18:${pad(15 + minute)}`;
}

const ODD_ON_LEAVE = new Set(["EMP-005", "EMP-023", "EMP-040"]);
const ODD_ABSENT = new Set(["EMP-029", "EMP-042"]);
const ODD_REMOTE = new Set([
  "EMP-011",
  "EMP-018",
  "EMP-038",
  "EMP-026",
  "EMP-015",
]);

export function buildAttendance(): AttendanceRecord[] {
  return employees.map((employee) => {
    let status: AttendanceStatus = "present";
    if (ODD_ON_LEAVE.has(employee.id)) status = "leave";
    else if (ODD_ABSENT.has(employee.id)) status = "absent";
    else if (ODD_REMOTE.has(employee.id)) status = "remote";

    const checkIn = status === "present" ? checkInFor(employee) : "—";
    const checkOut = status === "present" ? checkOutFor(employee) : "—";

    return {
      id: `ATT-${employee.id}`,
      employeeId: employee.id,
      date: TODAY,
      checkIn,
      checkOut,
      status,
    };
  });
}