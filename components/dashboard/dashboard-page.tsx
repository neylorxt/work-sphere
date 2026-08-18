"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, UserPlus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmployeeTrendChart } from "@/components/dashboard/employee-trend-chart";
import { DepartmentDonut } from "@/components/dashboard/department-donut";
import { AttendanceOverview } from "@/components/dashboard/attendance-overview";
import { RecentEmployees } from "@/components/dashboard/recent-employees";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { useStore } from "@/lib/store";
import { computeDashboardStats } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";
import { Users, UserCheck, CalendarOff, UserPlus as UserPlusIcon, Wallet } from "lucide-react";

export function DashboardPage() {
  const { state } = useStore();
  const [formOpen, setFormOpen] = React.useState(false);
  const stats = React.useMemo(() => computeDashboardStats(state), [state]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre organisation en temps réel."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Export lancé", {
                  description: "Le rapport sera disponible dans quelques instants.",
                })
              }
            >
              <Download className="size-4" />
              Exporter
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <UserPlus className="size-4" />
              Ajouter un employé
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total employés"
          value={String(stats.total)}
          icon={Users}
          delta={stats.totalDelta}
          deltaSuffix="%"
          comparison="vs mois dernier"
          tone="positive"
        />
        <StatCard
          label="Employés actifs"
          value={String(stats.active)}
          icon={UserCheck}
          delta={stats.activeDelta}
          deltaSuffix="%"
          comparison="vs mois dernier"
          tone="positive"
        />
        <StatCard
          label="En congé"
          value={String(stats.onLeave)}
          icon={CalendarOff}
          delta={stats.onLeaveDelta}
          deltaSuffix=" pers."
          comparison="vs mois dernier"
          tone="neutral"
        />
        <StatCard
          label="Nouvelles recrues"
          value={String(stats.newHires)}
          icon={UserPlusIcon}
          delta={stats.newHiresDelta}
          deltaSuffix=" pers."
          comparison="ces 90 jours"
          tone="positive"
        />
        <StatCard
          label="Masse salariale / mois"
          value={formatCurrency(stats.monthlyPayroll)}
          icon={Wallet}
          delta={stats.payrollDelta}
          deltaSuffix="%"
          comparison="vs mois dernier"
          tone="positive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Évolution des effectifs</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/employees">
                12 derniers mois
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <EmployeeTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par département</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentDonut />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Présences du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceOverview />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <RecentEmployees />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline />
          </CardContent>
        </Card>
      </div>

      <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}