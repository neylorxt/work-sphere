"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BadgeCheck,
  UserRound,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  Star,
  Building2,
  UserCog,
  CalendarClock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeStatusBadge } from "@/components/employees/status-badge";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/lib/store";
import { formatCurrency, formatCurrencyPrecise, formatDate } from "@/lib/format";
import { leaveTypeLabel } from "@/data";
import type {
  AttendanceRecord,
  DocumentItem,
  EmployeeStatus,
  Evaluation,
  LeaveRequest,
  PayrollEntry,
} from "@/types";

const TAB_ICONS = {
  informations: UserRound,
  presence: Clock,
  leaves: CalendarDays,
  payroll: Wallet,
  documents: FileText,
  evaluations: Star,
};

const STATUS_BADGE: Record<EmployeeStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
  active: { label: "Actif", variant: "success" },
  "on-leave": { label: "En congé", variant: "warning" },
  inactive: { label: "Inactif", variant: "muted" },
};

export function EmployeeProfile({ id }: { id: string }) {
  const router = useRouter();
  const { state, deleteEmployees, setEmployeeStatus, approveLeave, rejectLeave } = useStore();
  const employee = state.employees.find((e) => e.id === id);

  const [tab, setTab] = React.useState("informations");
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  if (!employee) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href="/employees">
            <ArrowLeft className="size-4" />
            Retour aux employés
          </Link>
        </Button>
        <EmptyState
          icon={UserRound}
          title="Employé introuvable"
          description="Cet employé n'existe pas ou a été supprimé."
          action={
            <Button asChild>
              <Link href="/employees">Voir tous les employés</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const attendance = state.attendance.filter((a) => a.employeeId === employee.id);
  const leaves = state.leaves.filter((l) => l.employeeId === employee.id);
  const payroll = state.payroll.find((p) => p.employeeId === employee.id);
  const evaluation = state.evaluations.find((e) => e.employeeId === employee.id);
  const docs = state.documents.filter((d) => d.employeeId === employee.id);

  const fullName = `${employee.firstName} ${employee.lastName}`;

  const presenceCount = {
    present: attendance.filter((a) => a.status === "present").length,
    remote: attendance.filter((a) => a.status === "remote").length,
    leave: attendance.filter((a) => a.status === "leave").length,
    absent: attendance.filter((a) => a.status === "absent").length,
  };

  const statusBadge = STATUS_BADGE[employee.status];

  const handleDelete = () => {
    deleteEmployees([employee.id]);
    toast.success(`${fullName} a été supprimé.`);
    router.push("/employees");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
        <Link href="/employees">
          <ArrowLeft className="size-4" />
          Retour aux employés
        </Link>
      </Button>

      <PageHeader
        title={fullName}
        description={`Fiche employé · ${employee.role}`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setEmployeeStatus(employee.id, employee.status === "active" ? "on-leave" : "active")}
            >
              <CalendarClock className="size-4" />
              {employee.status === "active" ? "Mettre en congé" : "Réactiver"}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Supprimer
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <Avatar
              name={fullName}
              firstName={employee.firstName}
              lastName={employee.lastName}
              size="xl"
              className="ring-2 ring-primary/30"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{fullName}</h2>
                <EmployeeStatusBadge status={employee.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{employee.role}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {employee.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {employee.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {employee.location}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
              <Badge variant="outline" className="gap-1.5">
                <BadgeCheck className="size-3.5 text-success" />
                {employee.contractType}
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Calendar className="size-3.5" />
                Depuis le {formatDate(employee.hireDate)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        tabs={[
          { value: "informations", label: "Informations", icon: TAB_ICONS.informations },
          { value: "presence", label: "Présence", icon: TAB_ICONS.presence, count: attendance.length },
          { value: "leaves", label: "Congés", icon: TAB_ICONS.leaves, count: leaves.length },
          { value: "payroll", label: "Salaire", icon: TAB_ICONS.payroll },
          { value: "documents", label: "Documents", icon: TAB_ICONS.documents, count: docs.length },
          { value: "evaluations", label: "Évaluations", icon: TAB_ICONS.evaluations },
        ]}
        value={tab}
        onValueChange={setTab}
        className="w-full overflow-x-auto"
      />

      {tab === "informations" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <InfoRow label="Nom complet" value={fullName} />
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Téléphone" value={employee.phone} />
                <InfoRow label="Localisation" value={employee.location} />
                <InfoRow label="Date d'embauche" value={formatDate(employee.hireDate)} />
                <InfoRow label="Type de contrat" value={employee.contractType} />
                <InfoRow label="Statut" value={statusBadge.label} />
                <InfoRow label="Identifiant" value={employee.id} mono />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Poste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{employee.role}</p>
                  <p className="text-xs text-muted-foreground">Poste actuel</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserCog className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{employee.manager ?? "Aucun manager"}</p>
                  <p className="text-xs text-muted-foreground">Manager direct</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wallet className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{formatCurrency(employee.salary)}</p>
                  <p className="text-xs text-muted-foreground">Salaire annuel brut</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "presence" ? (
        <PresenceTab attendance={attendance} presenceCount={presenceCount} />
      ) : null}

      {tab === "leaves" ? (
        <LeavesTab leaves={leaves} onApprove={approveLeave} onReject={rejectLeave} />
      ) : null}

      {tab === "payroll" ? (
        <PayrollTab payroll={payroll} />
      ) : null}

      {tab === "documents" ? (
        <DocumentsTab docs={docs} />
      ) : null}

      {tab === "evaluations" ? (
        <EvaluationsTab evaluation={evaluation} />
      ) : null}

      <EmployeeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {fullName} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à cet employé
              seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={mono ? "mt-1 font-mono text-sm" : "mt-1 text-sm"}>{value}</dd>
    </div>
  );
}

function PresenceTab({
  attendance,
  presenceCount,
}: {
  attendance: AttendanceRecord[];
  presenceCount: { present: number; remote: number; leave: number; absent: number };
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMini label="Présences" value={presenceCount.present} color="text-success" />
        <StatMini label="Télétravail" value={presenceCount.remote} color="text-sky-500" />
        <StatMini label="En congé" value={presenceCount.leave} color="text-amber-500" />
        <StatMini label="Absences" value={presenceCount.absent} color="text-rose-500" />
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Arrivée</TableHead>
              <TableHead>Départ</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucun pointage enregistré.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-sm">{formatDate(record.date)}</TableCell>
                  <TableCell className="text-sm">{record.checkIn}</TableCell>
                  <TableCell className="text-sm">{record.checkOut}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function LeavesTab({
  leaves,
  onApprove,
  onReject,
}: {
  leaves: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead className="hidden sm:table-cell">Motif</TableHead>
            <TableHead className="text-right">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucune demande de congé.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="text-sm">{leaveTypeLabel[leave.type as keyof typeof leaveTypeLabel] ?? leave.type}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                </TableCell>
                <TableCell className="text-sm">{leave.days} jour{leave.days > 1 ? "s" : ""}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">{leave.reason}</TableCell>
                <TableCell className="text-right">
                  {leave.status === "pending" ? (
                    <span className="inline-flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => onApprove(leave.id)}>
                        Approuver
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onReject(leave.id)}>
                        Refuser
                      </Button>
                    </span>
                  ) : (
                    <Badge
                      variant={leave.status === "approved" ? "success" : "destructive"}
                    >
                      {leave.status === "approved" ? "Approuvé" : "Refusé"}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function PayrollTab({ payroll }: { payroll?: PayrollEntry }) {
  const monthlyGross = payroll ? Math.round(payroll.gross / 12) : 0;
  const monthlyNet = payroll ? Math.round(payroll.net / 12) : 0;
  const monthlyBonus = payroll ? Math.round(payroll.bonus / 12) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Salaire annuel brut</p>
            <p className="mt-1 text-2xl font-bold">{payroll ? formatCurrency(payroll.gross) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Bonus annuel</p>
            <p className="mt-1 text-2xl font-bold text-success">{payroll ? formatCurrency(payroll.bonus) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Salaire net annuel</p>
            <p className="mt-1 text-2xl font-bold">{payroll ? formatCurrency(payroll.net) : "—"}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Détail du mois en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <InfoRow label="Brut mensuel" value={payroll ? formatCurrencyPrecise(monthlyGross) : "—"} />
            <InfoRow label="Bonus mensuel" value={payroll ? formatCurrencyPrecise(monthlyBonus) : "—"} />
            <InfoRow label="Net mensuel" value={payroll ? formatCurrencyPrecise(monthlyNet) : "—"} />
            <InfoRow label="Dernière augmentation" value={payroll ? `${payroll.raisePercent} % (${formatDate(payroll.lastRaise)})` : "—"} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentsTab({ docs }: { docs: DocumentItem[] }) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Taille</TableHead>
            <TableHead className="text-right">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun document.</p>
              </TableCell>
            </TableRow>
          ) : (
            docs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="text-sm font-medium">{doc.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{doc.type}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">{formatDate(doc.date)}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{doc.size}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={doc.status === "valid" ? "success" : doc.status === "pending" ? "warning" : "muted"}>
                    {doc.status === "valid" ? "Valide" : doc.status === "pending" ? "En attente" : "Expiré"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function EvaluationsTab({ evaluation }: { evaluation?: Evaluation }) {
  if (!evaluation) {
    return (
      <EmptyState
        icon={Star}
        title="Aucune évaluation"
        description="Aucune évaluation n'a encore été réalisée pour cet employé."
      />
    );
  }

  const score = evaluation.score;
  const label = score >= 85 ? "Excellent" : score >= 75 ? "Très bon" : score >= 65 ? "Bon" : "À améliorer";
  const color = score >= 85 ? "#10b981" : score >= 75 ? "#3b82f6" : score >= 65 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <div className="relative flex size-32 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)` }}
            >
              <div className="flex size-24 flex-col items-center justify-center rounded-full bg-card">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <p className="mt-3 font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">Note globale</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Objectifs de performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ObjectiveRow label="Objectifs atteints" value={Math.round(score * 0.9)} />
            <ObjectiveRow label="Compétences techniques" value={Math.round(score * 0.95)} />
            <ObjectiveRow label="Collaboration" value={Math.round(score * 0.85)} />
            <ObjectiveRow label="Autonomie" value={Math.round(score * 0.92)} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
          <InfoRow label="Période d'évaluation" value={evaluation.period} />
          <InfoRow label="Statut" value={evaluation.status === "done" ? "Terminée" : "Planifiée"} />
          <InfoRow label="Dernière évaluation" value={formatDate(evaluation.lastEvaluated)} />
          <InfoRow label="Prochaine évaluation" value={formatDate(evaluation.nextEvaluation)} />
        </CardContent>
      </Card>
    </div>
  );
}

function ObjectiveRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} indicatorClassName="bg-primary" />
    </div>
  );
}