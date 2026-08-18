"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Download,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { EmployeeStatusBadge, DepartmentBadge } from "@/components/employees/status-badge";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { departmentName, departments, departmentColor } from "@/data";
import type {
  ContractType,
  DepartmentId,
  Employee,
  EmployeeSortField,
  EmployeeStatus,
} from "@/types";

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: EmployeeSortField;
  sortField: EmployeeSortField;
  sortDir: "asc" | "desc";
}) {
  if (sortField !== field) return <ArrowUpDown className="size-3 opacity-60" />;
  return sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />;
}

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: "active", label: "Actif" },
  { value: "on-leave", label: "En congé" },
  { value: "inactive", label: "Inactif" },
];

const CONTRACT_OPTIONS: ContractType[] = ["CDI", "CDD", "Freelance", "Stage"];

export function EmployeesPage() {
  const { state, deleteEmployees, setEmployeeStatus } = useStore();

  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState<DepartmentId | "all">("all");
  const [status, setStatus] = React.useState<EmployeeStatus | "all">("all");
  const [contract, setContract] = React.useState<ContractType | "all">("all");
  const [location, setLocation] = React.useState("all");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [sortField, setSortField] = React.useState<EmployeeSortField>("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Employee | "bulk" | null>(null);

  const locations = React.useMemo(
    () => Array.from(new Set(state.employees.map((e) => e.location))).sort(),
    [state.employees]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = state.employees.filter((e) => {
      const matchQuery =
        !q ||
        `${e.firstName} ${e.lastName} ${e.email} ${e.role}`
          .toLowerCase()
          .includes(q);
      const matchDept = department === "all" || e.department === department;
      const matchStatus = status === "all" || e.status === status;
      const matchContract = contract === "all" || e.contractType === contract;
      const matchLocation = location === "all" || e.location === location;
      return matchQuery && matchDept && matchStatus && matchContract && matchLocation;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
        case "department":
          cmp = departmentName(a.department).localeCompare(departmentName(b.department));
          break;
        case "hireDate":
          cmp = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
          break;
        case "salary":
          cmp = a.salary - b.salary;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [state.employees, search, department, status, contract, location, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: EmployeeSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const allSelected = paginated.length > 0 && paginated.every((e) => prev.has(e.id));
      const next = new Set(prev);
      if (allSelected) paginated.forEach((e) => next.delete(e.id));
      else paginated.forEach((e) => next.add(e.id));
      return next;
    });
  };

  const handleDelete = () => {
    if (deleteTarget === "bulk") {
      const ids = Array.from(selected);
      deleteEmployees(ids);
      setSelected(new Set());
      toast.success(`${ids.length} employés supprimés`);
    } else if (deleteTarget) {
      deleteEmployees([deleteTarget.id]);
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} a été supprimé.`);
    }
    setDeleteTarget(null);
  };

  const bulkStatusChange = (nextStatus: EmployeeStatus) => {
    selected.forEach((id) => setEmployeeStatus(id, nextStatus));
    toast.success("Statut mis à jour", { description: `${selected.size} employés modifiés.` });
  };

  const resetFilters = () => {
    setSearch("");
    setDepartment("all");
    setStatus("all");
    setContract("all");
    setLocation("all");
  };

  const hasFilters =
    search !== "" || department !== "all" || status !== "all" || contract !== "all" || location !== "all";

  const canSelect = paginated.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employés"
        description={`Gérez vos ${state.employees.length} employés : recherche, filtres, ajout et modification.`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Export lancé", { description: "La liste des employés va être exportée." })
              }
            >
              <Download className="size-4" />
              Exporter
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Ajouter un employé
            </Button>
          </>
        }
      />

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou poste…"
            className="lg:w-80"
            aria-label="Rechercher des employés"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentId | "all")}
              className="w-40"
              aria-label="Filtrer par département"
            >
              <option value="all">Tous les départements</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as EmployeeStatus | "all")}
              className="w-36"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Button
              variant={advancedOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
            >
              <Filter className="size-4" />
              Filtres avancés
            </Button>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => setView("table")}
                aria-label="Vue tableau"
                aria-pressed={view === "table"}
              >
                <List className="size-4" />
              </Button>
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => setView("grid")}
                aria-label="Vue cartes"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {advancedOpen ? (
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Type de contrat</label>
              <Select
                value={contract}
                onChange={(e) => setContract(e.target.value as ContractType | "all")}
              >
                <option value="all">Tous les contrats</option>
                {CONTRACT_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Localisation</label>
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="all">Toutes les localisations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                <X className="size-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        ) : null}

        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <Badge variant="info" className="bg-primary/15">
              {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  Changer le statut
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((s) => (
                  <DropdownMenuItem key={s.value} onClick={() => bulkStatusChange(s.value)}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget("bulk")}>
              <Trash2 className="size-4" />
              Supprimer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              <X className="size-4" />
              Annuler
            </Button>
          </div>
        ) : null}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun employé trouvé"
          description={
            hasFilters
              ? "Aucun employé ne correspond aux critères de recherche. Essayez de modifier vos filtres."
              : "Commencez par ajouter votre premier employé."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" />
                Ajouter un employé
              </Button>
            )
          }
        />
      ) : view === "table" ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={canSelect && paginated.every((e) => selected.has(e.id))}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Sélectionner tous les employés de la page"
                  />
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    Employé <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    onClick={() => toggleSort("role")}
                  >
                    Poste <SortIcon field="role" sortField={sortField} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    onClick={() => toggleSort("department")}
                  >
                    Département <SortIcon field="department" sortField={sortField} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="hidden xl:table-cell">Email</TableHead>
                <TableHead className="hidden 2xl:table-cell">Téléphone</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    onClick={() => toggleSort("hireDate")}
                  >
                    Embauche <SortIcon field="hireDate" sortField={sortField} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    onClick={() => toggleSort("salary")}
                  >
                    Salaire <SortIcon field="salary" sortField={sortField} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    onClick={() => toggleSort("status")}
                  >
                    Statut <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((employee) => (
                <TableRow
                  key={employee.id}
                  className={cn(selected.has(employee.id) && "bg-primary/5")}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(employee.id)}
                      onCheckedChange={() => toggleSelect(employee.id)}
                      aria-label={`Sélectionner ${employee.firstName} ${employee.lastName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/employees/${employee.id}`}
                      className="group flex items-center gap-3"
                    >
                      <Avatar
                        name={`${employee.firstName} ${employee.lastName}`}
                        size="sm"
                        className="ring-1 ring-border"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium group-hover:text-primary">
                          {employee.firstName} {employee.lastName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {employee.contractType}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{employee.role}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <DepartmentBadge department={departmentName(employee.department)} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {employee.email}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground 2xl:table-cell">
                    {employee.phone}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(employee.hireDate)}
                  </TableCell>
                  <TableCell className="hidden text-sm font-medium sm:table-cell">
                    {formatCurrency(employee.salary)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <EmployeeStatusBadge status={employee.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Actions">
                          <span className="sr-only">Menu</span>
                          <span className="flex size-4 items-center justify-center">
                            <span className="size-1 rounded-full bg-current" />
                            <span className="mx-0.5 size-1 rounded-full bg-current" />
                            <span className="size-1 rounded-full bg-current" />
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.id}`}>
                            <Eye className="size-4" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(employee);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(employee)}
                        >
                          <Trash2 className="size-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t p-4">
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((employee) => (
              <Card
                key={employee.id}
                className={cn(
                  "group relative overflow-hidden p-5 transition-shadow hover:shadow-md",
                  selected.has(employee.id) && "ring-1 ring-primary"
                )}
              >
                <div className="absolute right-4 top-4">
                  <Checkbox
                    checked={selected.has(employee.id)}
                    onCheckedChange={() => toggleSelect(employee.id)}
                    aria-label={`Sélectionner ${employee.firstName} ${employee.lastName}`}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Avatar
                    name={`${employee.firstName} ${employee.lastName}`}
                    size="lg"
                    className="ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="block truncate font-semibold transition-colors group-hover:text-primary"
                    >
                      {employee.firstName} {employee.lastName}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{employee.role}</p>
                    <div className="mt-1.5">
                      <EmployeeStatusBadge status={employee.status} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 border-t pt-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Département</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: departmentColor(employee.department) }}
                      />
                      {departmentName(employee.department)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Salaire</span>
                    <span className="font-medium">{formatCurrency(employee.salary)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Embauche</span>
                    <span className="font-medium">{formatDate(employee.hireDate)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/employees/${employee.id}`}>
                      <Eye className="size-4" />
                      Voir
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => {
                      setEditing(employee);
                      setFormOpen(true);
                    }}
                    aria-label={`Modifier ${employee.firstName} ${employee.lastName}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(employee)}
                    aria-label={`Supprimer ${employee.firstName} ${employee.lastName}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editing}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget === "bulk"
                ? `Supprimer ${selected.size} employés ?`
                : `Supprimer ${deleteTarget?.firstName} ${deleteTarget?.lastName} ?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les données associées (présences, salaires,
              congés, documents) seront également supprimées.
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