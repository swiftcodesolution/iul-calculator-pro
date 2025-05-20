import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TableData } from "@/lib/types";

interface TableStore {
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  clearTables: () => void;
  yearsRunOutOfMoney: number;
  setYearsRunOutOfMoney: (age: number) => void;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: [],
      setTables: (tables) => set({ tables }),
      clearTables: () => set({ tables: [] }),
      yearsRunOutOfMoney: 0,
      setYearsRunOutOfMoney: (age) => set({ yearsRunOutOfMoney: age }),
    }),
    {
      name: "table-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
