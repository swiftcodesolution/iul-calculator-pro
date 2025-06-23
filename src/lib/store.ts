import { create } from "zustand";
import { BoxesData, TableData, TabContent } from "./types";

interface TableStore {
  tables: TableData[];
  setTables: (tables: TableData[]) => void;
  clearTables: () => void;
  yearsRunOutOfMoney: number | string;
  isYearsRunOutOfMoneyUserSelected: boolean;
  setYearsRunOutOfMoney: (age: number | string) => void;
  futureAge: number | string;
  setFutureAge: (age: number | string) => void;
  boxesData: BoxesData;
  setBoxesData: (updatedData: Partial<BoxesData>) => void;
  startingBalance: number | string;
  annualContributions: number | string;
  annualEmployerMatch: number | string;
  withdrawalAmount: number | string;
  iulStartingBalance: number | string;
  calculatorAge: number | string;
  calculatorTaxRate: number | string;
  setWithdrawalAmount: (value: number | string) => void;
  setIulStartingBalance: (value: number | string) => void;
  setCalculatorAge: (value: number | string) => void;
  setCalculatorTaxRate: (value: number | string) => void;
  setStartingBalance: (value: number | string) => void;
  setAnnualContributions: (value: number | string) => void;
  setAnnualEmployerMatch: (value: number | string) => void;
  tabs: TabContent[];
  setTabs: (tabs: TabContent[]) => void;
  clearStore: () => void;
  fields: {
    illustration_date: string | null;
    insured_name: string | null;
    initial_death_benefit: string | null;
    assumed_ror: string | null;
    minimum_initial_pmt: string | null;
  };
  setFields: (fields: TableStore["fields"]) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  setTables: (tables) => set({ tables }),
  clearTables: () => set({ tables: [] }),
  yearsRunOutOfMoney: "",
  isYearsRunOutOfMoneyUserSelected: false,
  setYearsRunOutOfMoney: (age) =>
    set({ yearsRunOutOfMoney: age, isYearsRunOutOfMoneyUserSelected: true }),
  futureAge: "",
  setFutureAge: (age) => set({ futureAge: age }),
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
  withdrawalAmount: "",
  iulStartingBalance: "",
  calculatorAge: 45,
  calculatorTaxRate: 22,
  setWithdrawalAmount: (value) => set({ withdrawalAmount: value }),
  setIulStartingBalance: (value) => set({ iulStartingBalance: value }),
  setCalculatorAge: (value) => set({ calculatorAge: value }),
  setCalculatorTaxRate: (value) => set({ calculatorTaxRate: value }),
  setStartingBalance: (value) => set({ startingBalance: value }),
  setAnnualContributions: (value) => set({ annualContributions: value }),
  setAnnualEmployerMatch: (value) => set({ annualEmployerMatch: value }),
  fields: {
    illustration_date: null,
    insured_name: null,
    initial_death_benefit: null,
    assumed_ror: null,
    minimum_initial_pmt: null,
  },
  setFields: (fields) => set({ fields }),
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
    {
      id: "inflationCalculator",
      name: "Inflation Calculator Redesign",
      type: "inflationCalculator",
      isVisible: true,
    },
    {
      id: "cagrChart",
      name: "S&P Average vs Tax Free Plan",
      type: "cagrChart",
      isVisible: true,
    },
  ],
  setTabs: (tabs) => set({ tabs }),
  clearStore: () =>
    set((state) => ({
      tables: [],
      fields: {
        illustration_date: null,
        insured_name: null,
        initial_death_benefit: null,
        assumed_ror: null,
        minimum_initial_pmt: null,
      },
      yearsRunOutOfMoney: state.yearsRunOutOfMoney, // Preserve
      isYearsRunOutOfMoneyUserSelected: state.isYearsRunOutOfMoneyUserSelected, // Preserve
      futureAge: state.futureAge, // Preserve
      boxesData: state.boxesData, // Preserve
      startingBalance: state.startingBalance, // Preserve
      annualContributions: state.annualContributions, // Preserve
      annualEmployerMatch: state.annualEmployerMatch, // Preserve
      withdrawalAmount: state.withdrawalAmount, // Preserve
      iulStartingBalance: state.iulStartingBalance, // Preserve
      calculatorAge: state.calculatorAge, // Preserve
      calculatorTaxRate: state.calculatorTaxRate, // Preserve
      tabs: state.tabs, // Preserve static tabs
    })),
}));
