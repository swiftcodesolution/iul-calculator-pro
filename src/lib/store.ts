import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TableData } from "@/lib/types";

interface TableStore {
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  clearTables: () => void;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: [],
      setTables: (tables) => set({ tables }),
      clearTables: () => set({ tables: [] }),
    }),
    {
      name: "table-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
