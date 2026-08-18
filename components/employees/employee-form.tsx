"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { departments, employees } from "@/data";
import type { Employee, EmployeeFormValues } from "@/types";

export const employeeSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().trim().email("Adresse email invalide"),
  phone: z.string().trim().min(10, "Numéro de téléphone invalide"),
  role: z.string().trim().min(2, "Le poste est requis"),
  department: z.enum(
    ["engineering", "marketing", "sales", "finance", "hr", "design"],
    { message: "Sélectionnez un département" }
  ),
  manager: z.string(),
  hireDate: z.string().min(1, "La date d'embauche est requise"),
  salary: z.coerce
    .number({ invalid_type_error: "Salaire invalide" })
    .min(15000, "Le salaire doit être d'au moins 15 000 €")
    .max(500000, "Le salaire est trop élevé"),
  location: z.string().trim().min(2, "La localisation est requise"),
  contractType: z.enum(["CDI", "CDD", "Freelance", "Stage"], {
    message: "Sélectionnez un type de contrat",
  }),
  status: z.enum(["active", "on-leave", "inactive"], {
    message: "Sélectionnez un statut",
  }),
  avatar: z.string().optional(),
});

export type EmployeeFormSchema = z.infer<typeof employeeSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive" role="alert">{message}</p>;
}

export function EmployeeForm({
  employee,
  onSubmit,
  submitting,
}: {
  employee?: Employee | null;
  onSubmit: (values: EmployeeFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmployeeFormSchema>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
          department: employee.department,
          manager: employee.manager ?? "",
          hireDate: employee.hireDate,
          salary: employee.salary,
          location: employee.location,
          contractType: employee.contractType,
          status: employee.status,
          avatar: employee.avatar,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "",
          department: "engineering",
          manager: "",
          hireDate: new Date().toISOString().slice(0, 10),
          salary: 42000,
          location: "Paris",
          contractType: "CDI",
          status: "active",
          avatar: "",
        },
  });

  const watchedFirst = useWatch({ control, name: "firstName" }) as string | undefined;
  const watchedLast = useWatch({ control, name: "lastName" }) as string | undefined;
  const firstName = watchedFirst || employee?.firstName || "";
  const lastName = watchedLast || employee?.lastName || "";

  const managerOptions = React.useMemo(() => {
    return employees
      .filter((e) => e.id !== employee?.id)
      .filter((e) => ["VP Engineering", "VP Marketing", "VP Sales", "VP Finance", "VP People", "VP Design", "Engineering Manager", "Marketing Manager", "Sales Manager", "Design Lead"].includes(e.role))
      .map((e) => `${e.firstName} ${e.lastName}`);
  }, [employee]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, avatar: employee?.avatar ?? `${values.firstName} ${values.lastName}`.toLowerCase().replace(/\s+/g, "-") })
      )}
      className="space-y-5"
      noValidate
    >
      <div className="flex items-center gap-4">
        <Avatar name={`${firstName} ${lastName}`} firstName={firstName} lastName={lastName} size="xl" />
        <div>
          <p className="text-sm font-medium">Photo de profil</p>
          <p className="text-xs text-muted-foreground">
            L&apos;avatar est généré automatiquement à partir du nom.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" placeholder="Ex. Marie" {...register("firstName")} aria-invalid={!!errors.firstName} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" placeholder="Ex. Lambert" {...register("lastName")} aria-invalid={!!errors.lastName} />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="marie.lambert@worksphere.fr" {...register("email")} aria-invalid={!!errors.email} />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" {...register("phone")} aria-invalid={!!errors.phone} />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="role">Poste</Label>
          <Input id="role" placeholder="Ex. Software Engineer" {...register("role")} aria-invalid={!!errors.role} />
          <FieldError message={errors.role?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="department">Département</Label>
          <Select id="department" {...register("department")} aria-invalid={!!errors.department}>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.department?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="manager">Manager</Label>
          <Select id="manager" {...register("manager")}>
            <option value="">Aucun</option>
            {managerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hireDate">Date d&apos;embauche</Label>
          <Input id="hireDate" type="date" {...register("hireDate")} aria-invalid={!!errors.hireDate} />
          <FieldError message={errors.hireDate?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="salary">Salaire annuel brut (€)</Label>
          <Input id="salary" type="number" min={15000} max={500000} step={500} {...register("salary")} aria-invalid={!!errors.salary} />
          <FieldError message={errors.salary?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Localisation</Label>
          <Input id="location" placeholder="Ex. Paris" {...register("location")} aria-invalid={!!errors.location} />
          <FieldError message={errors.location?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="contractType">Type de contrat</Label>
          <Select id="contractType" {...register("contractType")}>
            {(["CDI", "CDD", "Freelance", "Stage"] as const).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="status">Statut</Label>
          <Select id="status" {...register("status")}>
            <option value="active">Actif</option>
            <option value="on-leave">En congé</option>
            <option value="inactive">Inactif</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting} className="min-w-28">
          {submitting ? "Enregistrement…" : employee ? "Enregistrer les modifications" : "Ajouter l'employé"}
        </Button>
      </div>
    </form>
  );
}