"use client";

import * as React from "react";
import { toast } from "sonner";
import { Wallet, TrendingUp, ArrowDownWideNarrow, ArrowUpWideNarrow, Download, Plus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/shared/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
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
import { formatCurrency, formatCurrencyPrecise, formatDate } from "@/lib/format";
import { payrollTrend, departmentName } from "@/data";
import type { DepartmentId } from "@/types";

export function PayrollPage() {
  const { state } = useStore();
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState<DepartmentId | "all">("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const employeesById = React.useMemo(
    () => new Map(state.employees.map((e) => [e.id, e])),
    [state.employees]
  );

  const stats = React.useMemo(() => {
    const salaries = state.employees.map((e) => e.salary);
    const total = salaries.reduce((sum, s) => sum + s, 0);
    const monthly = Math.round(total / 12);
    return {
      monthly,
      avg: salaries.length ? Math.round(total / salaries.length) : 0,
      min: salaries.length ? Math.min(...salaries) : 0,
      max: salaries.length ? Math.max(...salaries) : 0,
    };
  }, [state.employees]);

  const payrollTrendLast = payrollTrend[payrollTrend.length - 1];
  const payrollTrendPrev = payrollTrend[payrollTrend.length - 2];
  const trendDelta = ((payrollTrendLast.value - payrollTrendPrev.value) / payrollTrendPrev.value) * 100;

  const rows = state.payroll
    .filter((entry) => {
      const employee = employeesById.get(entry.employeeId);
      if (!employee) return false;
      const q = search.trim().toLowerCase();
      const matchQuery = `${employee.firstName} ${employee.lastName} ${employee.role}`
        .toLowerCase()
        .includes(q);
      const matchDept = department === "all" || employee.department === department;
      return matchQuery && matchDept;
    })
    .sort((a, b) => b.gross - a.gross);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salaires"
        description="Suivez la masse salariale, les salaires individuels et les augmentations."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Fiches de paie générées", {
                  description: "Les fiches de paie d'août 2026 sont prêtes à télécharger.",
                })
              }
            >
              <Download className="size-4" />
              Générer les fiches
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.info("Bientôt disponible", {
                  description: "La création d'une entrée de paie manuelle arrivera prochainement.",
                })
              }
            >
              <Plus className="size-4" />
              Nouvelle entrée
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Masse salariale / mois"
          value={formatCurrency(stats.monthly)}
          icon={Wallet}
          delta={trendDelta}
          deltaSuffix="%"
          comparison="vs mois dernier"
          tone="positive"
        />
        <StatCard
          label="Salaire annuel moyen"
          value={formatCurrency(stats.avg)}
          icon={TrendingUp}
          delta={5.2}
          comparison="sur 12 mois"
          tone="positive"
        />
        <StatCard
          label="Salaire minimum"
          value={formatCurrency(stats.min)}
          icon={ArrowDownWideNarrow}
          delta={4.1}
          comparison="vs année dernière"
          tone="neutral"
        />
        <StatCard
          label="Salaire maximum"
          value={formatCurrency(stats.max)}
          icon={ArrowUpWideNarrow}
          delta={6.3}
          comparison="vs année dernière"
          tone="positive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évolution de la masse salariale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full" role="img" aria-label="Évolution mensuelle de la masse salariale">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollTrend} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="payrollFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatCurrency(Number(v))} />}
                  cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Masse salariale"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#payrollFill)"
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Détail des salaires</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un employé…"
                className="w-full sm:w-56"
                aria-label="Rechercher un employé"
              />
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentId | "all")}
                className="w-40"
                aria-label="Filtrer par département"
              >
                <option value="all">Tous les départements</option>
                {state.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Wallet}
                title="Aucun résultat"
                description="Aucun salarié ne correspond aux critères."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead className="hidden md:table-cell">Département</TableHead>
                  <TableHead className="text-right">Salaire brut</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Salaire net</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Dernière augmentation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((entry) => {
                  const employee = employeesById.get(entry.employeeId);
                  if (!employee) return null;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${employee.firstName} ${employee.lastName}`} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {employee.firstName} {employee.lastName}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {employee.role}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {departmentName(employee.department)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.gross)}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        +{formatCurrency(entry.bonus)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrencyPrecise(entry.net)}
                      </TableCell>
                      <TableCell className="hidden text-right lg:table-cell">
                        <Badge variant="success" className="gap-1">
                          +{entry.raisePercent} %
                          <span className="hidden font-normal text-muted-foreground xl:inline">
                            ({formatDate(entry.lastRaise)})
                          </span>
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
              total={rows.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}