/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    cellPhone: z.string().min(1, "Cell phone is required"),
    officePhone: z.string().min(1, "Office phone is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Passwords must match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  loginEmail: z.string().email("Invalid email address"),
  loginPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const companyInfoSchema = z.object({
  logoSrc: z.union([z.string(), z.instanceof(File)]).optional(),
  profilePicSrc: z.union([z.string(), z.instanceof(File)]).optional(),
  businessName: z.string().min(1),
  agentName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
});

export type CompanyInfo = {
  id?: string;
  businessName: string;
  agentName: string;
  email: string;
  phone: string;
  logoSrc?: string | File;
  profilePicSrc?: string | File;
};

export interface TablesData {
  tables: TableData[];
  startingBalance: number | string;
  annualContributions: number | string;
  annualEmployerMatch: number | string;
  yearsRunOutOfMoney: number | string;
}

export type ClientFile = {
  id: string;
  userId: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  createdByRole: string;
  category: string;
  boxesData?: BoxesData;
  tablesData?: TablesData;
  combinedResults?: any;
};

export type CropState = {
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  croppedAreaPixels?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

export interface BoxesData {
  currentAge: number | string;
  stopSavingAge: number | string;
  retirementAge: number | string;
  workingTaxRate: number | string;
  retirementTaxRate: number | string;
  inflationRate: number | string;
  currentPlanFees: number | string;
  currentPlanROR: number | string;
  taxFreePlanROR: number | string;
}

export type BoxesInputField = {
  label: string;
  key: keyof BoxesData;
  value: string | number;
};

export type Results = {
  xValue: number;
  startingBalance: number;
  annualContributions: number;
  annualEmployerMatch: number | "N/A";
  annualFees: string; // e.g., "1.00%" or "Included"
  grossRetirementIncome: number;
  incomeTax: number;
  netRetirementIncome: number;
  cumulativeTaxesDeferred: number;
  cumulativeTaxesPaid: number;
  cumulativeFeesPaid: number;
  cumulativeNetIncome: number;
  cumulativeAccountBalance: number;
  taxesDue: number; // Percentage
  deathBenefits: number;
  yearsRunOutOfMoney: number | string;
  currentAge: number;
};

export interface CombinedResult {
  year: number;
  age: number;
  annualContribution: number;
  tfpAnnualContribution: number;
  grossRetirementIncome: number;
  retirementTaxes: number;
  retirementIncome: number;
  tfpRetirementIncome: number;
  managementFee: number;
  tfpFee: string | number;
  interest: number;
  endOfYearBalance: number;
  tfpCumulativeBalance: number;
  cumulativeIncome: number;
  tfpCumulativeIncome: number;
  cumulativeFees: number;
  tfpCumulativeFees: number;
  cumulativeTaxesDeferred: number;
  deathBenefit: number;
  tfpDeathBenefit: number;
  [key: string]: number | string; // Index signature for string keys
}

export interface TableData {
  id?: string;
  source: string;
  page_number: number;
  keyword?: string;
  extractor?: string;
  data: Record<string, string | number>[]; // Each object in data may include Age for mainTable
}

export interface TaxesData {
  startingBalance: number | string;
  annualContributions: number | string;
  annualEmployerMatch: number | string;
  annualFees: number | string;
  grossRetirementIncome: number | string;
  incomeTax: number | string;
  netRetirementIncome: number | string;
  cumulativeTaxesDeferred: number | string;
  cumulativeTaxesPaid: number | string;
  cumulativeFeesPaid: number | string;
  cumulativeNetIncome: number | string;
  cumulativeAccountBalance: number | string;
  taxesDue: number | string;
  deathBenefits: number | string;
  yearsRunOutOfMoney: number | string;
}

export interface RowData {
  taxesDuePercentage?: string | null;
  startingBalance: string;
  annualContributions: string;
  annualEmployerMatch: string;
  annualFees: string;
  grossRetirementIncome: string;
  incomeTax: string;
  netRetirementIncome: string;
  cumulativeTaxesDeferred: string;
  cumulativeTaxesPaid: string;
  cumulativeFeesPaid: string;
  cumulativeNetIncome: string;
  cumulativeAccountBalance: string;
  taxesDue: string;
  deathBenefits: string;
  yearsRunOutOfMoney: number | string;
}

export interface SelectedRowData {
  current: RowData;
  taxFree: RowData;
}

// export type TabContent = {
//   id: string;
//   name: string;
//   file?: File;
//   src?: string;
//   type:
//     | "image"
//     | "video"
//     | "pdf"
//     | "other"
//     | "totalAdvantage"
//     | "calculator"
//     | "inflationCalculator"
//     | "cagrChart";
//   isVisible: boolean;
// };

export interface TabContent {
  id: string;
  name: string;

  type:
    | "totalAdvantage"
    | "calculator"
    | "inflationCalculator"
    | "cagrChart"
    | "image"
    | "video"
    | "pdf"
    | "link"
    | "other";
  isVisible: boolean;
  filePath?: string | null;
  fileFormat?: string | null;
  link?: string | null;
  createdByRole?: string;
  userId?: string;
}

export type TotalAdvantage = {
  total: number;
  cumulativeTaxesPaid: number;
  fees: number;
  cumulativeIncome: number;
  deathBenefits: number;
};
