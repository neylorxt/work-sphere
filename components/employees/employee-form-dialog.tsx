"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeForm } from "@/components/employees/employee-form";
import { useStore } from "@/lib/store";
import type { Employee, EmployeeFormValues } from "@/types";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeFormDialogProps) {
  const { addEmployee, updateEmployee } = useStore();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = (values: EmployeeFormValues) => {
    setSubmitting(true);
    window.setTimeout(() => {
      if (employee) {
        updateEmployee(employee.id, values);
        toast.success("Employé mis à jour", {
          description: `${values.firstName} ${values.lastName} a bien été modifié.`,
        });
      } else {
        addEmployee(values);
        toast.success("Employé ajouté", {
          description: `${values.firstName} ${values.lastName} a rejoint WorkSphere.`,
        });
      }
      setSubmitting(false);
      onOpenChange(false);
    }, 450);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Modifier l'employé" : "Ajouter un employé"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Mettez à jour les informations de l'employé."
              : "Renseignez les informations du nouvel employé pour l'ajouter à WorkSphere."}
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm
          employee={employee}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </DialogContent>
    </Dialog>
  );
}