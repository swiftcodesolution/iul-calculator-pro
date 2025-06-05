import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BoxesData, TableData, TabContent } from "@/lib/types";

interface TableStore {
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  clearTables: () => void;
  yearsRunOutOfMoney: number;
  setYearsRunOutOfMoney: (age: number) => void;
  boxesData: BoxesData;
  setBoxesData: (updatedData: Partial<BoxesData>) => void;
  startingBalance: number | string;
  annualContributions: number | string;
  annualEmployerMatch: number | string;
  setStartingBalance: (value: number | string) => void;
  setAnnualContributions: (value: number | string) => void;
  setAnnualEmployerMatch: (value: number | string) => void;
  tabs: TabContent[];
  setTabs: (tabs: TabContent[]) => void;
}

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: [],
      setTables: (tables) => set({ tables }),
      clearTables: () => set({ tables: [] }),
      yearsRunOutOfMoney: 0,
      setYearsRunOutOfMoney: (age) => set({ yearsRunOutOfMoney: age }),
      boxesData: {
        currentAge: "0",
        stopSavingAge: "0",
        retirementAge: "0",
        workingTaxRate: "0",
        retirementTaxRate: "0",
        inflationRate: "0",
        currentPlanFees: "0",
        currentPlanROR: "0",
        taxFreePlanROR: "0",
      },
      setBoxesData: (updatedData) =>
        set((state) => ({
          boxesData: { ...state.boxesData, ...updatedData },
        })),
      startingBalance: 0,
      annualContributions: 0,
      annualEmployerMatch: 0,
      setStartingBalance: (value) => set({ startingBalance: value }),
      setAnnualContributions: (value) => set({ annualContributions: value }),
      setAnnualEmployerMatch: (value) => set({ annualEmployerMatch: value }),
      tabs: [
        {
          id: "total-advantage",
          name: "Total Advantage",
          type: "totalAdvantage",
          isVisible: true,
        },
        {
          id: "calculator",
          name: "Calculator",
          type: "calculator",
          isVisible: true,
        },
      ],
      setTabs: (tabs) => set({ tabs }),
    }),
    {
      name: "table-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tables: state.tables,
        yearsRunOutOfMoney: state.yearsRunOutOfMoney,
        boxesData: state.boxesData,
        startingBalance: state.startingBalance,
        annualContributions: state.annualContributions,
        annualEmployerMatch: state.annualEmployerMatch,
        tabs: state.tabs.map((tab) => ({
          id: tab.id,
          name: tab.name,
          type: tab.type,
          isVisible: tab.isVisible,
          src: tab.src, // Store src for media tabs
        })),
      }),
    }
  )
);
