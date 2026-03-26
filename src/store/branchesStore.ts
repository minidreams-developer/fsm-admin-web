import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Branch = {
  id: string;
  name: string;
  type: "Main Office" | "Service Center" | "Warehouse" | "Regional Office";
  address: string;
  city: string;
  state: string;
  postalCode: string;
  contactNumber: string;
  email: string;
  managerId: string;
  managerName: string;
  operatingHoursFrom: string;
  operatingHoursTo: string;
  establishedDate: string;
  status: "Active" | "Inactive";
  notes: string;
  createdAt: string;
};

interface BranchesStore {
  branches: Branch[];
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  getBranch: (id: string) => Branch | undefined;
  getNextBranchId: () => string;
}

const initialBranches: Branch[] = [
  {
    id: "BR-1001",
    name: "Kochi Main Office",
    type: "Main Office",
    address: "12 MG Road",
    city: "Kochi",
    state: "Kerala",
    postalCode: "682001",
    contactNumber: "9876543210",
    email: "kochi@company.com",
    managerId: "EMP-1001",
    managerName: "Praveen Kumar",
    operatingHoursFrom: "09:00 AM",
    operatingHoursTo: "06:00 PM",
    establishedDate: "2020-01-15",
    status: "Active",
    notes: "Main headquarters",
    createdAt: "2024-01-15",
  },
  {
    id: "BR-1002",
    name: "Calicut Service Center",
    type: "Service Center",
    address: "Beach Road",
    city: "Calicut",
    state: "Kerala",
    postalCode: "673001",
    contactNumber: "9876543220",
    email: "calicut@company.com",
    managerId: "EMP-1002",
    managerName: "Rajesh Singh",
    operatingHoursFrom: "08:00 AM",
    operatingHoursTo: "05:00 PM",
    establishedDate: "2021-06-20",
    status: "Active",
    notes: "Northern region service center",
    createdAt: "2024-01-15",
  },
  {
    id: "BR-1003",
    name: "Ernakulam Warehouse",
    type: "Warehouse",
    address: "Market Road",
    city: "Ernakulam",
    state: "Kerala",
    postalCode: "682016",
    contactNumber: "9876543230",
    email: "warehouse@company.com",
    managerId: "EMP-1003",
    managerName: "Anjali Nair",
    operatingHoursFrom: "07:00 AM",
    operatingHoursTo: "07:00 PM",
    establishedDate: "2022-03-10",
    status: "Active",
    notes: "Central warehouse for inventory",
    createdAt: "2024-01-15",
  },
];

export const useBranchesStore = create<BranchesStore>()(
  persist(
    (set, get) => ({
      branches: initialBranches,

      addBranch: (branch) =>
        set((state) => ({
          branches: [...state.branches, branch],
        })),

      updateBranch: (id, updates) =>
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        })),

      getBranch: (id) => get().branches.find((b) => b.id === id),

      getNextBranchId: () => {
        const nums = get()
          .branches.map((b) => Number(b.id.split("-")[1]))
          .filter((n) => Number.isFinite(n));
        const nextNum = (nums.length ? Math.max(...nums) : 1000) + 1;
        return `BR-${nextNum}`;
      },
    }),
    { name: "branches-store", version: 0 },
  ),
);
