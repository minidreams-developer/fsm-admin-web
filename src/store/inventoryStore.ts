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

export type InventoryHistoryEntry = {
  id: string;
  itemId: number;
  itemName: string;
  branch: string;
  action: "Added" | "Restocked" | "Updated" | "Deleted" | "Allocated";
  previousStock?: number;
  newStock?: number;
  quantityChanged?: number;
  unit: string;
  performedBy?: string;
  notes?: string;
  timestamp: string;
};

interface InventoryStore {
  inventory: InventoryItem[];
  history: InventoryHistoryEntry[];
  addItem: (item: InventoryItem) => void;
  updateItem: (id: number, updates: Partial<InventoryItem>, restockQuantity?: number) => void;
  deleteItem: (id: number) => void;
  getItem: (id: number) => InventoryItem | undefined;
  allocateStock: (itemId: number, employeeId: string, employeeName: string, quantity: number) => void;
  getEmployeeAllocations: (employeeId: string) => Array<InventoryItem & { allocatedQuantity: number }>;
  getHistory: () => InventoryHistoryEntry[];
  addHistoryEntry: (entry: Omit<InventoryHistoryEntry, "id" | "timestamp">) => void;
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
      history: [],

      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [
            {
              ...entry,
              id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.history,
          ],
        })),

      addItem: (item) => {
        get().addHistoryEntry({
          itemId: item.id,
          itemName: item.name,
          branch: item.branch,
          action: "Added",
          newStock: item.stock,
          unit: item.unit,
          notes: `Initial stock: ${item.stock} ${item.unit}`,
        });
        
        set((state) => ({
          inventory: [...state.inventory, item],
        }));
      },

      updateItem: (id, updates, restockQuantity) => {
        const item = get().getItem(id);
        if (!item) return;

        const previousStock = item.stock;
        const newStock = updates.stock ?? item.stock;
        
        if (restockQuantity && restockQuantity > 0) {
          get().addHistoryEntry({
            itemId: id,
            itemName: item.name,
            branch: item.branch,
            action: "Restocked",
            previousStock,
            newStock,
            quantityChanged: restockQuantity,
            unit: item.unit,
            notes: `Added ${restockQuantity} ${item.unit}`,
          });
        } else if (previousStock !== newStock) {
          get().addHistoryEntry({
            itemId: id,
            itemName: item.name,
            branch: item.branch,
            action: "Updated",
            previousStock,
            newStock,
            quantityChanged: newStock - previousStock,
            unit: item.unit,
            notes: `Stock adjusted from ${previousStock} to ${newStock} ${item.unit}`,
          });
        }

        set((state) => ({
          inventory: state.inventory.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
      },

      deleteItem: (id) => {
        const item = get().getItem(id);
        if (item) {
          get().addHistoryEntry({
            itemId: id,
            itemName: item.name,
            branch: item.branch,
            action: "Deleted",
            previousStock: item.stock,
            unit: item.unit,
            notes: `Item removed from inventory`,
          });
        }

        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id),
        }));
      },

      getItem: (id) => get().inventory.find((item) => item.id === id),

      allocateStock: (itemId, employeeId, employeeName, quantity) => {
        const item = get().getItem(itemId);
        if (item) {
          get().addHistoryEntry({
            itemId,
            itemName: item.name,
            branch: item.branch,
            action: "Allocated",
            quantityChanged: -quantity,
            unit: item.unit,
            performedBy: employeeName,
            notes: `Allocated ${quantity} ${item.unit} to ${employeeName}`,
          });
        }

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
        }));
      },

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

      getHistory: () => get().history,
    }),
    { name: "inventory-store", version: 1 },
  ),
);
