import type { Metadata } from "next";
import { EmployeesPage } from "@/components/employees/employees-page";

export const metadata: Metadata = {
  title: "Employés",
};

export default function Page() {
  return <EmployeesPage />;
}