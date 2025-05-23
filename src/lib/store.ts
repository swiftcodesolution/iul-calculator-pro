import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BoxesData, TableData } from "@/lib/types";

interface TableStore {
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  clearTables: () => void;
  yearsRunOutOfMoney: number;
  setYearsRunOutOfMoney: (age: number) => void;
  boxesData: BoxesData;
  setBoxesData: (updatedData: Partial<BoxesData>) => void;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: [],
      setTables: (tables) => set({ tables }),
      clearTables: () => set({ tables: [] }),
      yearsRunOutOfMoney: 95,
      setYearsRunOutOfMoney: (age) => set({ yearsRunOutOfMoney: age }),
      boxesData: {
        currentAge: "40",
        stopSavingAge: "65",
        retirementAge: "66",
        workingTaxRate: "22",
        retirementTaxRate: "22",
        inflationRate: "2",
        currentPlanFees: "2",
        currentPlanROR: "6.3",
        taxFreePlanROR: "6.3",
      },
      setBoxesData: (updatedData) =>
        set((state) => ({
          boxesData: { ...state.boxesData, ...updatedData },
        })),
    }),
    {
      name: "table-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tables: state.tables,
        yearsRunOutOfMoney: state.yearsRunOutOfMoney,
        boxesData: state.boxesData,
      }),
    }
  )
);
