import type { Metadata } from "next";
import { EmployeeProfile } from "@/components/employees/employee-profile";

export const metadata: Metadata = {
  title: "Fiche employé",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmployeeProfile id={id} />;
}