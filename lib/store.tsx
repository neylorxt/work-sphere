"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  ActivityItem,
  AttendanceRecord,
  Department,
  DocumentItem,
  Employee,
  EmployeeFormValues,
  EmployeeStatus,
  Evaluation,
  LeaveRequest,
  LeaveStatus,
  PayrollEntry,
} from "@/types";
import {
  activity as initialActivity,
  buildAttendance as initialAttendance,
  documents as initialDocuments,
  employees as initialEmployees,
  departments as initialDepartments,
  buildEvaluations as initialEvaluations,
  leaves as initialLeaves,
  buildPayroll as initialPayroll,
} from "@/data";
import { uid } from "./utils";

const STORAGE_KEY = "worksphere-store-v1";

export interface AppState {
  employees: Employee[];
  departments: Department[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  payroll: PayrollEntry[];
  evaluations: Evaluation[];
  documents: DocumentItem[];
  activity: ActivityItem[];
}

const initialState: AppState = {
  employees: initialEmployees,
  departments: initialDepartments,
  leaves: initialLeaves,
  attendance: initialAttendance(),
  payroll: initialPayroll(),
  evaluations: initialEvaluations(),
  documents: initialDocuments,
  activity: initialActivity,
};

function loadPersistedState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...initialState,
      ...parsed,
      attendance: parsed.attendance?.length ? parsed.attendance : initialState.attendance,
    };
  } catch {
    return initialState;
  }
}

type Action =
  | { type: "ADD_EMPLOYEE"; payload: Employee }
  | { type: "UPDATE_EMPLOYEE"; payload: Employee }
  | { type: "DELETE_EMPLOYEES"; payload: string[] }
  | { type: "SET_EMPLOYEE_STATUS"; payload: { id: string; status: EmployeeStatus } }
  | { type: "SET_LEAVE_STATUS"; payload: { id: string; status: LeaveStatus } }
  | { type: "ADD_LEAVE"; payload: LeaveRequest }
  | { type: "ADD_DOCUMENT"; payload: DocumentItem }
  | { type: "DELETE_DOCUMENT"; payload: string }
  | { type: "ADD_ACTIVITY"; payload: ActivityItem }
  | { type: "HYDRATE"; payload: AppState }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "ADD_EMPLOYEE":
      return { ...state, employees: [action.payload, ...state.employees] };
    case "UPDATE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case "DELETE_EMPLOYEES": {
      const ids = new Set(action.payload);
      return {
        ...state,
        employees: state.employees.filter((e) => !ids.has(e.id)),
        attendance: state.attendance.filter((a) => !ids.has(a.employeeId)),
        payroll: state.payroll.filter((p) => !ids.has(p.employeeId)),
        evaluations: state.evaluations.filter((e) => !ids.has(e.employeeId)),
        leaves: state.leaves.filter((l) => !ids.has(l.employeeId)),
        documents: state.documents.filter((d) => !ids.has(d.employeeId)),
      };
    }
    case "SET_EMPLOYEE_STATUS":
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.payload.id ? { ...e, status: action.payload.status } : e
        ),
      };
    case "SET_LEAVE_STATUS":
      return {
        ...state,
        leaves: state.leaves.map((l) =>
          l.id === action.payload.id ? { ...l, status: action.payload.status } : l
        ),
      };
    case "ADD_LEAVE":
      return { ...state, leaves: [action.payload, ...state.leaves] };
    case "ADD_DOCUMENT":
      return { ...state, documents: [action.payload, ...state.documents] };
    case "DELETE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.payload),
      };
    case "ADD_ACTIVITY":
      return { ...state, activity: [action.payload, ...state.activity].slice(0, 50) };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  addEmployee: (values: EmployeeFormValues) => Employee;
  updateEmployee: (id: string, values: EmployeeFormValues) => void;
  deleteEmployees: (ids: string[]) => void;
  setEmployeeStatus: (id: string, status: EmployeeStatus) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;
  addLeave: (input: Omit<LeaveRequest, "id" | "status">) => void;
  addDocument: (input: Omit<DocumentItem, "id">) => void;
  deleteDocument: (id: string) => void;
  pushActivity: (item: Omit<ActivityItem, "id">) => void;
  resetData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function toEmployee(values: EmployeeFormValues, id: string): Employee {
  return {
    id,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    avatar: `${values.firstName.trim()} ${values.lastName.trim()}`
      .toLowerCase()
      .replace(/\s+/g, "-"),
    role: values.role.trim(),
    department: values.department,
    manager: values.manager === "none" || values.manager === "" ? null : values.manager,
    hireDate: values.hireDate,
    salary: Number(values.salary),
    location: values.location.trim(),
    contractType: values.contractType,
    status: values.status,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Hydrate client state from localStorage after mount to avoid SSR hydration mismatches.
    const persisted = loadPersistedState();
    if (persisted !== initialState) {
      dispatch({ type: "HYDRATE", payload: persisted });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addEmployee = useCallback((values: EmployeeFormValues) => {
    const id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const employee = toEmployee(values, id);
    dispatch({ type: "ADD_EMPLOYEE", payload: employee });
    dispatch({
      type: "ADD_ACTIVITY",
      payload: {
        id: uid("act"),
        type: "employee_added",
        description: `${employee.firstName} ${employee.lastName} a rejoint l'équipe en tant que ${employee.role}.`,
        time: new Date().toISOString(),
      },
    });
    return employee;
  }, []);

  const updateEmployee = useCallback((id: string, values: EmployeeFormValues) => {
    const employee = toEmployee(values, id);
    dispatch({ type: "UPDATE_EMPLOYEE", payload: employee });
  }, []);

  const deleteEmployees = useCallback((ids: string[]) => {
    dispatch({ type: "DELETE_EMPLOYEES", payload: ids });
  }, []);

  const setEmployeeStatus = useCallback((id: string, status: EmployeeStatus) => {
    dispatch({ type: "SET_EMPLOYEE_STATUS", payload: { id, status } });
  }, []);

  const approveLeave = useCallback((id: string) => {
    dispatch({ type: "SET_LEAVE_STATUS", payload: { id, status: "approved" } });
  }, []);

  const rejectLeave = useCallback((id: string) => {
    dispatch({ type: "SET_LEAVE_STATUS", payload: { id, status: "rejected" } });
  }, []);

  const addLeave = useCallback((input: Omit<LeaveRequest, "id" | "status">) => {
    dispatch({
      type: "ADD_LEAVE",
      payload: { ...input, id: uid("lv"), status: "pending" },
    });
  }, []);

  const addDocument = useCallback((input: Omit<DocumentItem, "id">) => {
    dispatch({ type: "ADD_DOCUMENT", payload: { ...input, id: uid("doc") } });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    dispatch({ type: "DELETE_DOCUMENT", payload: id });
  }, []);

  const pushActivity = useCallback((item: Omit<ActivityItem, "id">) => {
    dispatch({ type: "ADD_ACTIVITY", payload: { ...item, id: uid("act") } });
  }, []);

  const resetData = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      addEmployee,
      updateEmployee,
      deleteEmployees,
      setEmployeeStatus,
      approveLeave,
      rejectLeave,
      addLeave,
      addDocument,
      deleteDocument,
      pushActivity,
      resetData,
    }),
    [
      state,
      addEmployee,
      updateEmployee,
      deleteEmployees,
      setEmployeeStatus,
      approveLeave,
      rejectLeave,
      addLeave,
      addDocument,
      deleteDocument,
      pushActivity,
      resetData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}

export function useEmployees() {
  return useStore().state.employees;
}

export function useEmployee(id: string | undefined) {
  const employees = useEmployees();
  return employees.find((e) => e.id === id);
}