import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Settings = {
  kmPrice: number; // ₹ per km reimbursement rate
};

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  getKmPrice: () => number;
}

const defaultSettings: Settings = {
  kmPrice: 8, // Default ₹8 per km
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      getKmPrice: () => get().settings.kmPrice,
    }),
    {
      name: "settings-store",
      version: 1,
    },
  ),
);
