import { create } from "zustand";
import { BoxesData, TableData, TabContent } from "./types";

interface TableStore {
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  clearTables: () => void;
  yearsRunOutOfMoney: number | string;
  setYearsRunOutOfMoney: (age: number | string) => void;
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
  clearStore: () => void; // New action to reset store
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  setTables: (tables) => set({ tables }),
  clearTables: () => set({ tables: [] }),
  yearsRunOutOfMoney: "",
  setYearsRunOutOfMoney: (age) => set({ yearsRunOutOfMoney: age }),
  boxesData: {
    currentAge: "",
    stopSavingAge: "",
    retirementAge: "",
    workingTaxRate: "",
    retirementTaxRate: "",
    inflationRate: "",
    currentPlanFees: "",
    currentPlanROR: "",
    taxFreePlanROR: "",
  },
  setBoxesData: (updatedData) =>
    set((state) => ({ boxesData: { ...state.boxesData, ...updatedData } })),
  startingBalance: "",
  annualContributions: "",
  annualEmployerMatch: "",
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
  clearStore: () =>
    set({
      tables: [],
      yearsRunOutOfMoney: "",
      boxesData: {
        currentAge: "",
        stopSavingAge: "",
        retirementAge: "",
        workingTaxRate: "",
        retirementTaxRate: "",
        inflationRate: "",
        currentPlanFees: "",
        currentPlanROR: "",
        taxFreePlanROR: "",
      },
      startingBalance: "",
      annualContributions: "",
      annualEmployerMatch: "",
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
    }),
}));
