import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
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

export type CompanyInfo = {
  businessName: string;
  agentName: string;
  email: string;
  phone: string;
  logoSrc?: string;
  profilePicSrc?: string;
};

export type ClientFile = {
  id: string;
  name: string;
  size: string;
  category:
    | "Pro Sample Files"
    | "Your Sample Files"
    | "Your Prospect Files"
    | "Your Closed Sales";
};

export type CropState = {
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  croppedAreaPixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

export type BoxesData = {
  currentAge: number | string;
  stopSavingAge: number | string;
  retirementAge: number | string;
  workingTaxRate: number | string;
  retirementTaxRate: number | string;
  inflationRate: number | string;
  currentPlanFees: number | string;
  currentPlanROR: number | string;
  taxFreePlanROR: number | string;
};
export type BoxesInputField = {
  label: string;
  key: keyof BoxesData;
  value: string | number;
};

export type Results = {
  xValue: number;
  startingBalance: number;
  annualContributions: number;
  annualEmployerMatch: string | number;
  annualFees: string;
  grossRetirementIncome: number;
  incomeTax: number;
  netRetirementIncome: number;
  cumulativeTaxesDeferred: number;
  cumulativeTaxesPaid: number;
  cumulativeFeesPaid: number;
  cumulativeNetIncome: number;
  cumulativeAccountBalance: number;
  taxesDue: number;
  deathBenefits: number;
  yearsRunOutOfMoney: number;
  currentAge: number | string;
};

export interface TableData {
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

export type TabContent = {
  id: string;
  name: string;
  file?: File;
  src?: string;
  type: "image" | "video" | "pdf" | "other" | "totalAdvantage" | "calculator";
  isVisible: boolean;
};

export type TotalAdvantage = {
  total: number;
  taxes: number;
  fees: number;
  cumulativeIncome: number;
  deathBenefits: number;
};

export type CompanyDetails = {
  businessName: string;
  agentName: string;
  email: string;
  phone: string;
};

export type ImageAsset = {
  src: string;
  name: string;
};
