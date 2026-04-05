import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InventoryItem = {
  id: number;
  name: string;
  branch: string;
  stock: number;
  unit: string;
  reorder: number;
  status: "OK" | "Low" | "Critical";
  allocations?: Array<{
    employeeId: string;
    employeeName: string;
    quantity: number;
    allocatedAt: string;
  }>;
};

interface InventoryStore {
  inventory: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  updateItem: (id: number, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: number) => void;
  getItem: (id: number) => InventoryItem | undefined;
  allocateStock: (itemId: number, employeeId: string, employeeName: string, quantity: number) => void;
  getEmployeeAllocations: (employeeId: string) => Array<InventoryItem & { allocatedQuantity: number }>;
}

const initialInventory: InventoryItem[] = [
  { id: 1, name: "Cypermethrin 10% EC", branch: "Kochi", stock: 45, unit: "Liters", reorder: 20, status: "OK" },
  { id: 2, name: "Bifenthrin 2.5% SC", branch: "Kochi", stock: 12, unit: "Liters", reorder: 20, status: "Low" },
  { id: 3, name: "Gel Bait (Maxforce)", branch: "Kochi", stock: 8, unit: "Tubes", reorder: 15, status: "Low" },
  { id: 4, name: "Termiticide (Imida)", branch: "Calicut", stock: 32, unit: "Liters", reorder: 10, status: "OK" },
  { id: 5, name: "Rodent Blocks", branch: "Kochi", stock: 5, unit: "Packs", reorder: 10, status: "Critical" },
  { id: 6, name: "Pyrethrin Spray", branch: "Calicut", stock: 28, unit: "Cans", reorder: 10, status: "OK" },
];

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      inventory: initialInventory,

      addItem: (item) =>
        set((state) => ({
          inventory: [...state.inventory, item],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          inventory: state.inventory.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),

      deleteItem: (id) =>
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id),
        })),

      getItem: (id) => get().inventory.find((item) => item.id === id),

      allocateStock: (itemId, employeeId, employeeName, quantity) =>
        set((state) => ({
          inventory: state.inventory.map((item) => {
            if (item.id === itemId) {
              const allocations = item.allocations || [];
              return {
                ...item,
                allocations: [
                  ...allocations,
                  {
                    employeeId,
                    employeeName,
                    quantity,
                    allocatedAt: new Date().toISOString(),
                  },
                ],
              };
            }
            return item;
          }),
        })),

      getEmployeeAllocations: (employeeId) => {
        const items = get().inventory;
        return items
          .filter((item) => item.allocations?.some((a) => a.employeeId === employeeId))
          .map((item) => {
            const allocation = item.allocations?.find((a) => a.employeeId === employeeId);
            return {
              ...item,
              allocatedQuantity: allocation?.quantity || 0,
            };
          });
      },
    }),
    { name: "inventory-store", version: 0 },
  ),
);
