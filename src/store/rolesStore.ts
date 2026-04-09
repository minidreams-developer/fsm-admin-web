import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
};

interface RolesStore {
  roles: Role[];
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
}

const PERMISSIONS = ["Dashboard", "Leads", "Customers", "Employees", "Work Orders", "Payments", "Inventory", "Service Management", "Branches", "Products"];

const initialRoles: Role[] = [
  { id: "ROLE-1", name: "Admin", description: "Full access to all modules", permissions: PERMISSIONS, active: true },
  { id: "ROLE-2", name: "Manager", description: "Access to operations and reports", permissions: ["Dashboard", "Leads", "Customers", "Work Orders", "Payments"], active: true },
  { id: "ROLE-3", name: "Technician", description: "Access to assigned work orders only", permissions: ["Dashboard", "Work Orders"], active: true },
  { id: "ROLE-4", name: "Sales Executive", description: "Access to leads, customers, and work orders", permissions: ["Dashboard", "Leads", "Customers", "Work Orders"], active: true },
];

export const useRolesStore = create<RolesStore>()(
  persist(
    (set) => ({
      roles: initialRoles,
      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (id, updates) => set((state) => ({ roles: state.roles.map((r) => r.id === id ? { ...r, ...updates } : r) })),
      deleteRole: (id) => set((state) => ({ roles: state.roles.filter((r) => r.id !== id) })),
    }),
    { name: "roles-store", version: 0 }
  )
);
