import type { Metadata } from "next";
import { AttendancePage } from "@/components/attendance/attendance-page";

export const metadata: Metadata = {
  title: "Présences",
};

export default function Page() {
  return <AttendancePage />;
}