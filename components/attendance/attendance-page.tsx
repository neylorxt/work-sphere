"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  UserX,
  Timer,
  Home,
  Download,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDate, formatDuration, formatPercent } from "@/lib/format";
import { departmentName } from "@/data";
import type { AttendanceStatus } from "@/types";

const WEEKLY_DATA = [
  { day: "Lun", présent: 33, télétravail: 3, congé: 4, absent: 2 },
  { day: "Mar", présent: 34, télétravail: 3, congé: 3, absent: 2 },
  { day: "Mer", présent: 32, télétravail: 4, congé: 4, absent: 2 },
  { day: "Jeu", présent: 35, télétravail: 2, congé: 3, absent: 2 },
  { day: "Ven", présent: 33, télétravail: 4, congé: 3, absent: 2 },
];

function toMinutes(time: string) {
  if (!time || time === "—") return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function AttendancePage() {
  const { state } = useStore();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<AttendanceStatus | "all">("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const records = state.attendance;
  const total = Math.max(1, records.length);
  const present = records.filter((r) => r.status === "present").length;
  const remote = records.filter((r) => r.status === "remote").length;
  const leave = records.filter((r) => r.status === "leave").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter(
    (r) => r.status === "present" && toMinutes(r.checkIn) > 9 * 60 + 5
  ).length;

  const employeesById = React.useMemo(
    () => new Map(state.employees.map((e) => [e.id, e])),
    [state.employees]
  );

  const filtered = records.filter((r) => {
    const employee = employeesById.get(r.employeeId);
    const q = search.trim().toLowerCase();
    const matchQuery =
      !q || `${employee?.firstName} ${employee?.lastName} ${employee?.role}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const today = new Date("2026-08-18");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Présences"
        description={`Pointage du jour — ${formatDate(today)}`}
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Rapport généré", {
                description: "Le rapport de présence a été exporté.",
              })
            }
          >
            <Download className="size-4" />
            Générer le rapport
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Taux de présence"
          value={formatPercent((present / total) * 100, 0)}
          icon={CheckCircle2}
          delta={2.4}
          comparison="vs semaine dernière"
          tone="positive"
        />
        <StatCard
          label="Absences"
          value={String(absent)}
          icon={UserX}
          delta={-1}
          deltaSuffix=" pers."
          comparison="vs hier"
          tone="neutral"
        />
        <StatCard
          label="Retards"
          value={String(late)}
          icon={Timer}
          delta={-2}
          deltaSuffix=" pers."
          comparison="vs hier"
          tone="positive"
        />
        <StatCard
          label="Télétravail"
          value={String(remote)}
          icon={Home}
          delta={1}
          deltaSuffix=" pers."
          comparison="vs hier"
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Présence hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full" role="img" aria-label="Présence hebdomadaire">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} dy={8} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                  <Legend iconSize={8} />
                  <Bar dataKey="présent" name="Présents" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="télétravail" name="Télétravail" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="congé" name="En congé" fill="var(--chart-4)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="absent" name="Absents" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryTile label="Présents" value={present} color="text-success" />
              <SummaryTile label="En congé" value={leave} color="text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Pointage du jour</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un employé…"
                  className="w-full sm:w-56"
                  aria-label="Rechercher un employé"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | "all")}
                  className="w-36"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="present">Présent</option>
                  <option value="remote">Télétravail</option>
                  <option value="leave">En congé</option>
                  <option value="absent">Absent</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Users}
                  title="Aucun pointage"
                  description="Aucun enregistrement ne correspond aux critères."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead className="hidden sm:table-cell">Département</TableHead>
                    <TableHead>Arrivée</TableHead>
                    <TableHead className="hidden sm:table-cell">Départ</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((record) => {
                    const employee = employeesById.get(record.employeeId);
                    const duration =
                      record.status === "present"
                        ? Math.max(0, toMinutes(record.checkOut) - toMinutes(record.checkIn)) * 60
                        : 0;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={employee ? `${employee.firstName} ${employee.lastName}` : "?"}
                              size="sm"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {employee ? `${employee.firstName} ${employee.lastName}` : "—"}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {employee?.role}
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {employee ? departmentName(employee.department) : "—"}
                        </TableCell>
                        <TableCell className={cn("text-sm", record.status === "present" && toMinutes(record.checkIn) > 9 * 60 + 5 && "font-medium text-warning")}>
                          {record.checkIn}
                          {record.status === "present" && toMinutes(record.checkIn) > 9 * 60 + 5 ? " (retard)" : ""}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {record.checkOut}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {record.status === "present" ? formatDuration(duration) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              record.status === "present"
                                ? "success"
                                : record.status === "remote"
                                  ? "info"
                                  : record.status === "leave"
                                    ? "warning"
                                    : "destructive"
                            }
                          >
                            {record.status === "present"
                              ? "Présent"
                              : record.status === "remote"
                                ? "Télétravail"
                                : record.status === "leave"
                                  ? "En congé"
                                  : "Absent"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            <div className="border-t p-4">
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-xl font-bold", color)}>{value}</p>
    </div>
  );
}