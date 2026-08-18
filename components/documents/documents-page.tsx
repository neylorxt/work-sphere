"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  FileSignature,
  FileSpreadsheet,
  FileBadge,
  FolderOpen,
  Download,
  Trash2,
  Upload,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDate } from "@/lib/format";
import type { DocumentItem, DocumentType, DocumentStatus } from "@/types";

const TYPE_META: Record<DocumentType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  contract: { label: "Contrat", icon: FileSignature, color: "text-indigo-500" },
  payslip: { label: "Fiche de paie", icon: FileSpreadsheet, color: "text-emerald-500" },
  certificate: { label: "Certificat", icon: FileBadge, color: "text-amber-500" },
  administrative: { label: "Administratif", icon: FolderOpen, color: "text-sky-500" },
};

const STATUS_LABEL: Record<DocumentStatus, { label: string; variant: "success" | "warning" | "muted" }> = {
  valid: { label: "Valide", variant: "success" },
  pending: { label: "En attente", variant: "warning" },
  expired: { label: "Expiré", variant: "muted" },
};

export function DocumentsPage() {
  const { state, addDocument, deleteDocument } = useStore();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<DocumentType | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<DocumentStatus | "all">("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentItem | null>(null);

  const employeesById = React.useMemo(
    () => new Map(state.employees.map((e) => [e.id, e])),
    [state.employees]
  );

  const counts = React.useMemo(() => {
    const result = {
      total: state.documents.length,
      contract: 0,
      payslip: 0,
      certificate: 0,
      administrative: 0,
      pending: 0,
    };
    for (const doc of state.documents) {
      result[doc.type] += 1;
      if (doc.status === "pending") result.pending += 1;
    }
    return result;
  }, [state.documents]);

  const filtered = state.documents.filter((doc) => {
    const employee = employeesById.get(doc.employeeId);
    const q = search.trim().toLowerCase();
    const matchQuery = `${doc.name} ${employee?.firstName} ${employee?.lastName}`.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || doc.type === typeFilter;
    const matchStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchQuery && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "");
    const type = formData.get("type") as DocumentType;
    const employeeId = String(formData.get("employeeId") || "");
    if (!name || !type || !employeeId) {
      toast.error("Champs manquants", { description: "Veuillez renseigner le nom, le type et l'employé." });
      return;
    }
    const size = `${Math.round(80 + Math.random() * 1200)} Ko`;
    addDocument({
      name: `${name.trim()}.pdf`,
      type,
      employeeId,
      date: new Date().toISOString().slice(0, 10),
      size,
      status: "valid",
    });
    toast.success("Document ajouté", { description: `${name.trim()}.pdf a été enregistré.` });
    setUploadOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Centralisez les contrats, fiches de paie, certificats et documents administratifs."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" />
            Téléverser un document
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Documents" value={String(counts.total)} icon={FileText} delta={3} deltaSuffix=" pers." comparison="ce mois" tone="positive" />
        <StatCard label="Contrats" value={String(counts.contract)} icon={FileSignature} delta={2} deltaSuffix=" pers." comparison="ce mois" tone="positive" />
        <StatCard label="Fiches de paie" value={String(counts.payslip)} icon={FileSpreadsheet} delta={1} deltaSuffix=" pers." comparison="ce mois" tone="neutral" />
        <StatCard label="Certificats" value={String(counts.certificate)} icon={FileBadge} delta={1} deltaSuffix=" pers." comparison="ce mois" tone="neutral" />
        <StatCard label="En attente" value={String(counts.pending)} icon={FolderOpen} delta={-1} deltaSuffix=" pers." comparison="vs hier" tone="positive" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Documents de l&apos;entreprise</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un document…"
                className="w-full sm:w-56"
                aria-label="Rechercher un document"
              />
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as DocumentType | "all")}
                className="w-40"
                aria-label="Filtrer par type"
              >
                <option value="all">Tous les types</option>
                <option value="contract">Contrat</option>
                <option value="payslip">Fiche de paie</option>
                <option value="certificate">Certificat</option>
                <option value="administrative">Administratif</option>
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | "all")}
                className="w-36"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="valid">Valide</option>
                <option value="pending">En attente</option>
                <option value="expired">Expiré</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Search}
                title="Aucun document"
                description="Aucun document ne correspond aux critères."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Taille</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((doc) => {
                  const meta = TYPE_META[doc.type];
                  const Icon = meta.icon;
                  const employee = employeesById.get(doc.employeeId);
                  const statusMeta = STATUS_LABEL[doc.status];
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted", meta.color)}>
                            <Icon className="size-4.5" />
                          </span>
                          <span className="min-w-0 max-w-[220px] truncate text-sm font-medium">
                            {doc.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={cn("flex items-center gap-1.5 text-sm", meta.color)}>
                          <Icon className="size-3.5" />
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={employee ? `${employee.firstName} ${employee.lastName}` : "?"}
                            size="sm"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm">
                              {employee ? `${employee.firstName} ${employee.lastName}` : "—"}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {employee?.email}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDate(doc.date)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {doc.size}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Télécharger"
                            onClick={() =>
                              toast.success("Téléchargement démarré", { description: doc.name })
                            }
                          >
                            <Download className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            aria-label="Supprimer"
                            onClick={() => setDeleteTarget(doc)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
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

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Téléverser un document</DialogTitle>
            <DialogDescription>
              Ajoutez un document dans la base documentaire de l&apos;entreprise.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom du document</Label>
              <Input id="name" name="name" placeholder="Ex. Contrat de travail — Emma Moreau" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Select id="type" name="type" defaultValue="contract">
                  <option value="contract">Contrat</option>
                  <option value="payslip">Fiche de paie</option>
                  <option value="certificate">Certificat</option>
                  <option value="administrative">Administratif</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="employeeId">Employé</Label>
                <Select id="employeeId" name="employeeId" defaultValue="">
                  <option value="" disabled>
                    Sélectionner un employé
                  </option>
                  {state.employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                <Upload className="size-4" />
                Téléverser
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le document «&nbsp;{deleteTarget?.name}&nbsp;» sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteDocument(deleteTarget.id);
                  toast.success("Document supprimé");
                }
                setDeleteTarget(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}