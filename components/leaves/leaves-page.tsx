"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  CalendarDays,
  Check,
  X,
  Clock,
  AlertCircle,
  CalendarCheck2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { leaveTypeLabel, departmentName } from "@/data";
import type { LeaveRequest, LeaveType, LeaveStatus } from "@/types";

const TYPE_COLOR: Record<LeaveType, string> = {
  paid: "#6366f1",
  rtt: "#0ea5e9",
  sick: "#f43f5e",
  personal: "#f59e0b",
  remote: "#10b981",
};

const TYPE_OPTIONS: LeaveType[] = ["paid", "rtt", "sick", "personal", "remote"];

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function LeavesPage() {
  const { state, approveLeave, rejectLeave, addLeave } = useStore();
  const [filterStatus, setFilterStatus] = React.useState<LeaveStatus | "all">("all");
  const [filterType, setFilterType] = React.useState<LeaveType | "all">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [monthOffset, setMonthOffset] = React.useState(0);

  const now = new Date();
  const calendarDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  const employeesById = React.useMemo(
    () => new Map(state.employees.map((e) => [e.id, e])),
    [state.employees]
  );

  const filteredLeaves = state.leaves.filter(
    (l) =>
      (filterStatus === "all" || l.status === filterStatus) &&
      (filterType === "all" || l.type === filterType)
  );

  const pendingCount = state.leaves.filter((l) => l.status === "pending").length;
  const approvedThisMonth = state.leaves.filter(
    (l) => l.status === "approved" && l.startDate.startsWith(toDateKey(calendarDate).slice(0, 7))
  ).length;
  const daysThisMonth = state.leaves
    .filter((l) => l.status === "approved" && l.startDate.startsWith(toDateKey(calendarDate).slice(0, 7)))
    .reduce((sum, l) => sum + l.days, 0);
  const onLeaveToday = state.employees.filter((e) => e.status === "on-leave").length;

  const calendarLeaves = React.useMemo(() => {
    const map = new Map<string, LeaveRequest[]>();
    for (const leave of state.leaves) {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toDateKey(d);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(leave);
      }
    }
    return map;
  }, [state.leaves]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = String(formData.get("employeeId"));
    const type = formData.get("type") as LeaveType;
    const startDate = String(formData.get("startDate"));
    const endDate = String(formData.get("endDate"));
    const reason = String(formData.get("reason"));

    if (!employeeId || !type || !startDate || !endDate) {
      toast.error("Champs manquants", { description: "Veuillez remplir tous les champs requis." });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("Période invalide", { description: "La date de fin doit être après la date de début." });
      return;
    }
    const days =
      Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;

    addLeave({ employeeId, type, startDate, endDate, reason, days });
    toast.success("Demande créée", { description: "La demande de congé a été soumise." });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Congés"
        description="Gérez les demandes de congés, approuvez ou refusez les demandes en attente."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <CalendarPlus className="size-4" />
            Nouvelle demande
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat icon={AlertCircle} label="En attente" value={pendingCount} tone="warning" />
        <MiniStat icon={CalendarCheck2} label="Approuvés ce mois" value={approvedThisMonth} tone="success" />
        <MiniStat icon={CalendarDays} label="Jours pris ce mois" value={daysThisMonth} tone="info" />
        <MiniStat icon={Clock} label="En congé aujourd'hui" value={onLeaveToday} tone="neutral" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="capitalize">
              {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(calendarDate)}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => setMonthOffset((m) => m - 1)} aria-label="Mois précédent">
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMonthOffset(0)}>
                Aujourd&apos;hui
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setMonthOffset((m) => m + 1)} aria-label="Mois suivant">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LeaveCalendar
              year={calendarDate.getFullYear()}
              month={calendarDate.getMonth()}
              leavesByDay={calendarLeaves}
              employeesById={employeesById}
            />
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t pt-4">
              {TYPE_OPTIONS.map((type) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLOR[type] }} />
                  {leaveTypeLabel[type]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Demandes de congés</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as LeaveType | "all")}
                  className="w-40"
                  aria-label="Filtrer par type"
                >
                  <option value="all">Tous les types</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {leaveTypeLabel[t]}
                    </option>
                  ))}
                </Select>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | "all")}
                  className="w-36"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Refusé</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredLeaves.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={CalendarDays}
                  title="Aucune demande"
                  description="Aucune demande de congé ne correspond aux filtres sélectionnés."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Période</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((leave) => {
                    const employee = employeesById.get(leave.employeeId);
                    return (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={employee ? `${employee.firstName} ${employee.lastName}` : "?"}
                              size="sm"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {employee ? `${employee.firstName} ${employee.lastName}` : "Employé supprimé"}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {employee ? departmentName(employee.department) : "—"}
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                            <span className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLOR[leave.type] }} />
                            {leaveTypeLabel[leave.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                        </TableCell>
                        <TableCell className="text-sm">{leave.days} j</TableCell>
                        <TableCell className="text-right">
                          {leave.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    className="text-success hover:text-success"
                                    onClick={() => {
                                      approveLeave(leave.id);
                                      toast.success("Congé approuvé", {
                                        description: `Demande de ${employee ? employee.firstName : ""} approuvée.`,
                                      });
                                    }}
                                    aria-label="Approuver"
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Approuver</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                      rejectLeave(leave.id);
                                      toast.success("Congé refusé", {
                                        description: `Demande de ${employee ? employee.firstName : ""} refusée.`,
                                      });
                                    }}
                                    aria-label="Refuser"
                                  >
                                    <X className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Refuser</TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <Badge
                              variant={leave.status === "approved" ? "success" : "destructive"}
                            >
                              {leave.status === "approved" ? "Approuvé" : "Refusé"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de congé</DialogTitle>
            <DialogDescription>
              Créez une demande de congé pour un employé. Elle sera soumise en attente d&apos;approbation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="employeeId">Employé</Label>
              <Select id="employeeId" name="employeeId" defaultValue="">
                <option value="" disabled>
                  Sélectionner un employé
                </option>
                {state.employees
                  .filter((e) => e.status !== "inactive")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} — {e.role}
                    </option>
                  ))}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type">Type de congé</Label>
                <Select id="type" name="type" defaultValue="paid">
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {leaveTypeLabel[t]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue="2026-08-24" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue="2026-08-28" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Motif (optionnel)</Label>
                <Input id="reason" name="reason" placeholder="Ex. Vacances familiales" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Soumettre la demande</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "success" | "warning" | "info" | "neutral";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "info"
          ? "text-sky-500"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon className={cn("size-5", toneClass)} />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaveCalendar({
  year,
  month,
  leavesByDay,
  employeesById,
}: {
  year: number;
  month: number;
  leavesByDay: Map<string, LeaveRequest[]>;
  employeesById: Map<string, { firstName: string; lastName: string }>;
}) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const today = toDateKey(new Date());

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 text-xs font-medium text-muted-foreground">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />;
          const date = new Date(year, month, day);
          const key = toDateKey(date);
          const dayLeaves = leavesByDay.get(key) ?? [];
          const isToday = key === today;
          return (
            <div
              key={key}
              className={cn(
                "relative flex h-12 flex-col items-center justify-center rounded-md border text-sm transition-colors",
                isToday
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : dayLeaves.length
                    ? "border-border bg-muted/40 hover:bg-muted"
                    : "border-transparent hover:bg-muted/50"
              )}
            >
              <span>{day}</span>
              {dayLeaves.length > 0 ? (
                <span className="absolute bottom-1 flex gap-0.5">
                  {dayLeaves.slice(0, 3).map((l) => (
                    <Tooltip key={l.id}>
                      <TooltipTrigger asChild>
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: TYPE_COLOR[l.type] }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-left">
                        {leaveTypeLabel[l.type]} —{" "}
                        {employeesById.get(l.employeeId)?.firstName ?? "Employé"}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}