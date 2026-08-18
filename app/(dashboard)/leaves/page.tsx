import type { Metadata } from "next";
import { LeavesPage } from "@/components/leaves/leaves-page";

export const metadata: Metadata = {
  title: "Congés",
};

export default function Page() {
  return <LeavesPage />;
}