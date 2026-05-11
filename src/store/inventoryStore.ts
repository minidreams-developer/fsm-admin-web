import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InventoryItem = {
  id: number;
  name: string;
  branch: string;
  stock: number;
  unit: string;
  unitPrice?: number;
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
  unitPrice?: number;
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
  { id: 1, name: "Cypermethrin 10% EC", branch: "Kochi", stock: 45, unit: "Liters", unitPrice: 850, reorder: 20, status: "OK", allocations: [
    { employeeId: "EMP-1001", employeeName: "Safeeq", quantity: 3, allocatedAt: "2026-04-28T09:00:00.000Z" },
  ]},
  { id: 2, name: "Bifenthrin 2.5% SC", branch: "Kochi", stock: 12, unit: "Liters", unitPrice: 1200, reorder: 20, status: "Low", allocations: [
    { employeeId: "EMP-1001", employeeName: "Safeeq", quantity: 2, allocatedAt: "2026-04-25T10:00:00.000Z" },
  ]},
  { id: 3, name: "Gel Bait (Maxforce)", branch: "Kochi", stock: 8, unit: "Tubes", unitPrice: 450, reorder: 15, status: "Low", allocations: [
    { employeeId: "EMP-1001", employeeName: "Safeeq", quantity: 5, allocatedAt: "2026-04-27T11:30:00.000Z" },
  ]},
  { id: 4, name: "Termiticide (Imida)", branch: "Calicut", stock: 32, unit: "Liters", unitPrice: 950, reorder: 10, status: "OK", allocations: [
    { employeeId: "EMP-1001", employeeName: "Safeeq", quantity: 4, allocatedAt: "2026-04-20T08:00:00.000Z" },
  ]},
  { id: 5, name: "Rodent Blocks", branch: "Kochi", stock: 5, unit: "Packs", unitPrice: 320, reorder: 10, status: "Critical", allocations: [
    { employeeId: "EMP-1001", employeeName: "Safeeq", quantity: 2, allocatedAt: "2026-04-22T14:00:00.000Z" },
  ]},
  { id: 6, name: "Pyrethrin Spray", branch: "Calicut", stock: 28, unit: "Cans", unitPrice: 280, reorder: 10, status: "OK" },
];

const initialHistory: InventoryHistoryEntry[] = [
  {
    id: "HIST-INIT-001",
    itemId: 1,
    itemName: "Cypermethrin 10% EC",
    branch: "Kochi",
    action: "Restocked",
    previousStock: 20,
    newStock: 45,
    quantityChanged: 25,
    unit: "Liters",
    performedBy: "Safeeq",
    notes: "Added 25 Liters",
    timestamp: "2026-04-28T09:15:00.000Z",
  },
  {
    id: "HIST-INIT-002",
    itemId: 3,
    itemName: "Gel Bait (Maxforce)",
    branch: "Kochi",
    action: "Allocated",
    quantityChanged: -5,
    newStock: 8,
    unit: "Tubes",
    unitPrice: 450,
    performedBy: "Mani",
    notes: "Allocated 5 Tubes to Mani",
    timestamp: "2026-04-27T11:30:00.000Z",
  },
  {
    id: "HIST-INIT-003",
    itemId: 4,
    itemName: "Termiticide (Imida)",
    branch: "Calicut",
    action: "Added",
    newStock: 32,
    unit: "Liters",
    performedBy: "Rajesh",
    notes: "Initial stock: 32 Liters",
    timestamp: "2026-04-25T08:00:00.000Z",
  },
  {
    id: "HIST-INIT-004",
    itemId: 5,
    itemName: "Rodent Blocks",
    branch: "Kochi",
    action: "Updated",
    previousStock: 12,
    newStock: 5,
    quantityChanged: -7,
    unit: "Packs",
    performedBy: "Safeeq",
    notes: "Stock adjusted from 12 to 5 Packs",
    timestamp: "2026-04-22T14:45:00.000Z",
  },
  {
    id: "HIST-INIT-005",
    itemId: 2,
    itemName: "Bifenthrin 2.5% SC",
    branch: "Kochi",
    action: "Restocked",
    previousStock: 5,
    newStock: 12,
    quantityChanged: 7,
    unit: "Liters",
    performedBy: "Mani",
    notes: "Added 7 Liters",
    timestamp: "2026-04-20T10:00:00.000Z",
  },
];

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      inventory: initialInventory,
      history: initialHistory,

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
            newStock: item.stock - quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
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
    {
      name: "inventory-store",
      version: 4,
      migrate: () => ({
        inventory: initialInventory,
        history: initialHistory,
      }),
    },
  ),
);
