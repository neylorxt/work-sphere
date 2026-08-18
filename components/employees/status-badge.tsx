import { Badge } from "@/components/ui/badge";
import type { EmployeeStatus } from "@/types";
import { departmentColor } from "@/data";

const STATUS_MAP: Record<EmployeeStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
  active: { label: "Actif", variant: "success" },
  "on-leave": { label: "En congé", variant: "warning" },
  inactive: { label: "Inactif", variant: "muted" },
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const config = STATUS_MAP[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function DepartmentBadge({ department }: { department: string }) {
  const color = departmentColor(department as never);
  return (
    <Badge variant="outline" className="gap-1.5 text-muted-foreground">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {department}
    </Badge>
  );
}