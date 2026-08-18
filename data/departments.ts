import type { Department, DepartmentId } from "@/types";

export const departments: Department[] = [
  {
    id: "engineering",
    name: "Engineering",
    head: "Sophie Martin",
    budget: 2_400_000,
    color: "#6366f1",
    progression: 12.5,
  },
  {
    id: "design",
    name: "Design",
    head: "Salomé Vincent",
    budget: 580_000,
    color: "#a855f7",
    progression: 9.3,
  },
  {
    id: "marketing",
    name: "Marketing",
    head: "Lucas Bernard",
    budget: 620_000,
    color: "#ec4899",
    progression: 8.2,
  },
  {
    id: "sales",
    name: "Sales",
    head: "Nicolas Fournier",
    budget: 980_000,
    color: "#f59e0b",
    progression: 15.4,
  },
  {
    id: "finance",
    name: "Finance",
    head: "Paul Renard",
    budget: 540_000,
    color: "#10b981",
    progression: 5.1,
  },
  {
    id: "hr",
    name: "Ressources Humaines",
    head: "Élodie Marchand",
    budget: 460_000,
    color: "#06b6d4",
    progression: 6.8,
  },
];

export const departmentById = (id: DepartmentId) =>
  departments.find((d) => d.id === id);

export const departmentName = (id: DepartmentId) =>
  departmentById(id)?.name ?? id;

export const departmentColor = (id: DepartmentId) =>
  departmentById(id)?.color ?? "#6366f1";