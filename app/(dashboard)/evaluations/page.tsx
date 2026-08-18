import type { Metadata } from "next";
import { EvaluationsPage } from "@/components/evaluations/evaluations-page";

export const metadata: Metadata = {
  title: "Évaluations",
};

export default function Page() {
  return <EvaluationsPage />;
}