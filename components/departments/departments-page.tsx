"use client";

import * as React from "react";
import { toast } from "sonner";
import { Building2, TrendingUp, Users, Crown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { departmentName } from "@/data";
import { cn } from "@/lib/utils";

const ICONS = {
  engineering: Building2,
  design: Building2,
  marketing: Building2,
  sales: Building2,
  finance: Building2,
  hr: Building2,
};

export function DepartmentsPage() {
  const { state } = useStore();

  const data = React.useMemo(() => {
    return state.departments.map((dept) => {
      const members = state.employees.filter((e) => e.department === dept.id);
      const head = members.find((e) => `${e.firstName} ${e.lastName}` === dept.head) ?? members[0];
      const payroll = members.reduce((sum, e) => sum + e.salary, 0);
      const avgSalary = members.length ? Math.round(payroll / members.length) : 0;
      const mainMembers = members
        .filter((e) => e.id !== head?.id)
        .slice(0, 3);
      return { dept, members, head, payroll, avgSalary, mainMembers };
    });
  }, [state.departments, state.employees]);

  const totalBudget = state.departments.reduce((sum, d) => sum + d.budget, 0);
  const totalMembers = state.employees.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Départements"
        description={`${totalMembers} employés répartis dans ${state.departments.length} départements.`}
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Bientôt disponible", {
                description: "La création d'un département arrivera dans une prochaine version.",
              })
            }
          >
            <Building2 className="size-4" />
            Nouveau département
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Building2}
          label="Départements"
          value={String(state.departments.length)}
          hint={`Budget total ${formatCurrency(totalBudget)}`}
        />
        <SummaryCard
          icon={Users}
          label="Effectifs"
          value={String(totalMembers)}
          hint="Tous départements confondus"
        />
        <SummaryCard
          icon={Crown}
          label="Plus grand département"
          value={departmentName(
            state.departments.reduce(
              (max, d) => {
                const count = state.employees.filter((e) => e.department === d.id).length;
                return count > max.count ? { id: d.id, count } : max;
              },
              { id: state.departments[0].id, count: -1 }
            ).id
          )}
          hint="En nombre d'employés"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Croissance moyenne"
          value="+9,6 %"
          hint="Sur les 12 derniers mois"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map(({ dept, members, head, payroll, avgSalary, mainMembers }) => {
          const Icon = ICONS[dept.id];
          return (
            <Card key={dept.id} className="group relative overflow-hidden transition-shadow hover:shadow-md">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: dept.color }}
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: `${dept.color}1f`, color: dept.color }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <CardTitle>{dept.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Responsable : {dept.head}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <Users className="size-3" />
                    {members.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Budget annuel</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatCurrency(dept.budget)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Salaire moyen</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatCurrency(avgSalary)}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Budget utilisé</span>
                    <span className="font-medium">
                      {Math.round((payroll / Math.max(1, dept.budget)) * 100)} %
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (payroll / Math.max(1, dept.budget)) * 100)}
                    indicatorClassName="transition-all duration-700"
                    className="h-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="inline-flex items-center gap-0.5 font-medium text-success">
                      <TrendingUp className="size-3" />
                      +{dept.progression} %
                    </span>
                  </div>
                  <Progress value={dept.progression * 6} indicatorClassName="bg-success" className="h-2" />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Membres principaux</p>
                  <div className="flex -space-x-2">
                    {head ? (
                      <Avatar
                        key={head.id}
                        name={`${head.firstName} ${head.lastName}`}
                        size="sm"
                        className="ring-2 ring-card"
                      />
                    ) : null}
                    {mainMembers.map((member) => (
                      <Avatar
                        key={member.id}
                        name={`${member.firstName} ${member.lastName}`}
                        size="sm"
                        className="ring-2 ring-card"
                      />
                    ))}
                    {members.length > mainMembers.length + 1 ? (
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-card">
                        +{members.length - mainMembers.length - 1}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn("truncate text-lg font-bold tracking-tight")}>{value}</p>
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}