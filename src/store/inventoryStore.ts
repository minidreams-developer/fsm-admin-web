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
};

interface InventoryStore {
  inventory: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  updateItem: (id: number, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: number) => void;
  getItem: (id: number) => InventoryItem | undefined;
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
    }),
    { name: "inventory-store", version: 0 },
  ),
);
