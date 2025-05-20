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

// for calculator page
export type Plan = {
  startingBalance: number;
  annualContribution: number;
  annualEmployerMatch: number;
  annualFees: number | "Included";
  rateOfReturn: number;
};

export type CalculatorData = {
  currentAge: number;
  stopSavingAge: number;
  retirementAge: number;
  workingTaxRate: number;
  retirementTaxRate: number;
  inflationRate: number;
  currentPlanFees: number;
  currentPlan: Plan;
  taxFreePlan: Plan;
  futureAgeYears: number;
};

export type Results = {
  startingBalance: number;
  annualContributions: number;
  annualEmployerMatch: string;
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
  currentAge?: number; // Optional, for cumulativeNetIncome calculation
};

export interface TableData {
  source: string; // Align with API response
  page_number: number;
  keyword?: string; // Optional, as per API
  extractor?: string; // Optional, as per API
  data: Record<string, string | number>[];
}

export interface TaxesData {
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
  yearsRunOutOfMoney: string;
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
