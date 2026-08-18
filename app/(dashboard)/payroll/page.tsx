import type { Metadata } from "next";
import { PayrollPage } from "@/components/payroll/payroll-page";

export const metadata: Metadata = {
  title: "Salaires",
};

export default function Page() {
  return <PayrollPage />;
}