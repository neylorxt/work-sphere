"use client";

import * as React from "react";
import { toast } from "sonner";
import { Star, Target, TrendingUp, CalendarClock, Trophy } from "lucide-react";
import {
  Line,
  LineChart,
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
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { formatDate, formatPercent } from "@/lib/format";
import { performanceTrend } from "@/data";

function scoreColor(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 75) return "text-sky-500";
  if (score >= 65) return "text-warning";
  return "text-destructive";
}

export function EvaluationsPage() {
  const { state } = useStore();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "done" | "scheduled">("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const employeesById = React.useMemo(
    () => new Map(state.employees.map((e) => [e.id, e])),
    [state.employees]
  );

  const avgScore = React.useMemo(() => {
    if (!state.evaluations.length) return 0;
    return Math.round(
      state.evaluations.reduce((sum, e) => sum + e.score, 0) / state.evaluations.length
    );
  }, [state.evaluations]);

  const doneCount = state.evaluations.filter((e) => e.status === "done").length;
  const scheduledCount = state.evaluations.filter((e) => e.status === "scheduled").length;

  const nextEvaluation = state.evaluations
    .filter((e) => e.status === "scheduled")
    .sort((a, b) => new Date(a.nextEvaluation).getTime() - new Date(b.nextEvaluation).getTime())[0];

  const rows = state.evaluations
    .map((evaluation) => ({ evaluation, employee: employeesById.get(evaluation.employeeId) }))
    .filter(({ evaluation, employee }) => {
      if (!employee) return false;
      const q = search.trim().toLowerCase();
      const matchQuery = `${employee.firstName} ${employee.lastName} ${employee.role}`
        .toLowerCase()
        .includes(q);
      const matchStatus = statusFilter === "all" || evaluation.status === statusFilter;
      return matchQuery && matchStatus;
    })
    .sort((a, b) => b.evaluation.score - a.evaluation.score);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Évaluations"
        description="Suivez les performances individuelles et collectives de vos équipes."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Bientôt disponible", {
                description: "La création d'une campagne d'évaluation arrivera prochainement.",
              })
            }
          >
            <Trophy className="size-4" />
            Nouvelle campagne
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Note moyenne"
          value={`${avgScore}/100`}
          icon={Star}
          delta={4.1}
          comparison="vs semestre dernier"
          tone="positive"
        />
        <StatCard
          label="Objectifs atteints"
          value={formatPercent(Math.round(avgScore * 0.85), 0)}
          icon={Target}
          delta={3.4}
          comparison="vs semestre dernier"
          tone="positive"
        />
        <StatCard
          label="Progression"
          value="+13 pts"
          icon={TrendingUp}
          delta={13}
          deltaSuffix=" pts"
          comparison="sur 12 mois"
          tone="positive"
        />
        <StatCard
          label="Évaluations planifiées"
          value={String(scheduledCount)}
          icon={CalendarClock}
          delta={2}
          deltaSuffix=" pers."
          comparison="ce trimestre"
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance moyenne de l&apos;entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full" role="img" aria-label="Performance moyenne sur 5 semestres">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                  <YAxis domain={[50, 100]} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Note moyenne"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBand label="Excellent (85+)" min={85} max={100} evaluations={state.evaluations} />
            <ScoreBand label="Très bon (75-84)" min={75} max={84} evaluations={state.evaluations} />
            <ScoreBand label="Bon (65-74)" min={65} max={74} evaluations={state.evaluations} />
            <ScoreBand label="À améliorer (< 65)" min={0} max={64} evaluations={state.evaluations} />
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">Évaluations terminées : </span>
              <span className="font-semibold">{doneCount}</span>
            </div>
            {nextEvaluation ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Prochaine évaluation</p>
                <p className="mt-0.5 font-medium">{formatDate(nextEvaluation.nextEvaluation)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Évaluations des employés</CardTitle>
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
                onChange={(e) => setStatusFilter(e.target.value as "all" | "done" | "scheduled")}
                className="w-44"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="done">Terminée</option>
                <option value="scheduled">Planifiée</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Star}
                title="Aucune évaluation"
                description="Aucune évaluation ne correspond aux critères."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="hidden md:table-cell">Période</TableHead>
                  <TableHead className="hidden lg:table-cell">Dernière évaluation</TableHead>
                  <TableHead className="hidden xl:table-cell">Prochaine</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(({ evaluation, employee }) => {
                  if (!employee) return null;
                  return (
                    <TableRow key={evaluation.id}>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold", scoreColor(evaluation.score))}>
                            {evaluation.score}
                          </span>
                          <Progress
                            value={evaluation.score}
                            className="hidden w-20 sm:block"
                            indicatorClassName={
                              evaluation.score >= 85
                                ? "bg-success"
                                : evaluation.score >= 75
                                  ? "bg-sky-500"
                                  : evaluation.score >= 65
                                    ? "bg-warning"
                                    : "bg-destructive"
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {evaluation.period}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatDate(evaluation.lastEvaluated)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                        {formatDate(evaluation.nextEvaluation)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={evaluation.status === "done" ? "success" : "warning"}>
                          {evaluation.status === "done" ? "Terminée" : "Planifiée"}
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

function ScoreBand({
  label,
  min,
  max,
  evaluations,
}: {
  label: string;
  min: number;
  max: number;
  evaluations: { score: number }[];
}) {
  const count = evaluations.filter((e) => e.score >= min && e.score <= max).length;
  const total = Math.max(1, evaluations.length);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {count}
          <span className="text-muted-foreground"> · {Math.round((count / total) * 100)}%</span>
        </span>
      </div>
      <Progress value={(count / total) * 100} indicatorClassName="bg-success" className="h-2" />
    </div>
  );
}