import type { Metadata } from "next";
import { DepartmentsPage } from "@/components/departments/departments-page";

export const metadata: Metadata = {
  title: "Départements",
};

export default function Page() {
  return <DepartmentsPage />;
}