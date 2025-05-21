import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ClientFile, TableData, Results } from "./types";

// Utility to merge class names for Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to generate a cropped image from a source image and crop area
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
): Promise<string> {
  try {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise<void>((resolve) => (image.onload = () => resolve()));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return canvas.toDataURL("image/jpeg");
  } catch (error) {
    console.error("Error generating cropped image:", error);
    throw error;
  }
}

// Utility to generate a unique ID for client files
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Utility to format file size for display
export function formatFileSize(size: string): string {
  if (size === "N/A") return size;
  const sizeInKB = parseFloat(size);
  if (isNaN(sizeInKB)) return "N/A";
  if (sizeInKB >= 1000) {
    return `${(sizeInKB / 1000).toFixed(1)} MB`;
  }
  return `${sizeInKB} KB`;
}

// Utility to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility to validate phone number format (basic US format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}

// Utility to filter client files by category
export function filterClientFilesByCategory(
  files: ClientFile[],
  category: ClientFile["category"]
): ClientFile[] {
  return files.filter((file) => file.category === category);
}

// Utility to debounce a function with cancellation support
export function debounce<T extends (...args: Parameters<T>) => unknown>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {
    leading: false,
    trailing: true,
  }
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (options.trailing) {
        func(...args);
      }
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    if (options.leading && !timeout) {
      func(...args);
    }

    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as ((...args: Parameters<T>) => void) & {
    cancel: () => void;
  };
}

// Utility to throttle a function
export function throttle<T extends (...args: unknown[]) => R, R>(
  func: T,
  limit: number
): (...args: Parameters<T>) => R {
  let inThrottle: boolean = false;
  let lastResult: R;

  return (...args: Parameters<T>): R => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// Utility to calculate 401(k) results for the Current Plan (red column)
export function extractCurrentPlanResults(
  currentAge: number,
  yearsRunOutOfMoney: number,
  annualContribution: number = 10000,
  returnRate: number = 0.06,
  retirementTaxRate: number = 0.28,
  annualFee: number = 0.01,
  workingTaxRate: number = 0.22,
  startingBalance: number = 0, // Add startingBalance parameter
  annualEmployerMatch: number = 0 // Add annualEmployerMatch parameter
): Results {
  // Validate inputs
  if (
    currentAge < 0 ||
    yearsRunOutOfMoney < currentAge ||
    annualContribution < 0 ||
    startingBalance < 0 ||
    annualEmployerMatch < 0 ||
    returnRate < 0 ||
    annualFee < 0 ||
    retirementTaxRate < 0 ||
    workingTaxRate < 0
  ) {
    console.warn("Invalid input parameters for Current Plan calculations");
    return {
      xValue: 65,
      startingBalance,
      annualContributions: annualContribution,
      annualEmployerMatch,
      annualFees: `${(annualFee * 100).toFixed(2)}%`,
      grossRetirementIncome: 0,
      incomeTax: 0,
      netRetirementIncome: 0,
      cumulativeTaxesDeferred: 0,
      cumulativeTaxesPaid: 0,
      cumulativeFeesPaid: 0,
      cumulativeNetIncome: 0,
      cumulativeAccountBalance: 0,
      taxesDue: retirementTaxRate * 100,
      deathBenefits: 0,
      yearsRunOutOfMoney,
      currentAge,
    };
  }

  // Calculate years of contribution (from current age to retirement age 65)
  const contributionYears = 65 - currentAge;
  // Calculate retirement duration (from age 65 to yearsRunOutOfMoney)
  const retirementDuration = yearsRunOutOfMoney - 65;

  // Validate contribution and retirement periods
  if (contributionYears <= 0 || retirementDuration <= 0) {
    console.warn("Invalid age or retirement duration");
    return {
      xValue: 65,
      startingBalance,
      annualContributions: annualContribution,
      annualEmployerMatch,
      annualFees: `${(annualFee * 100).toFixed(2)}%`,
      grossRetirementIncome: 0,
      incomeTax: 0,
      netRetirementIncome: 0,
      cumulativeTaxesDeferred: 0,
      cumulativeTaxesPaid: 0,
      cumulativeFeesPaid: 0,
      cumulativeNetIncome: 0,
      cumulativeAccountBalance: 0,
      taxesDue: retirementTaxRate * 100,
      deathBenefits: 0,
      yearsRunOutOfMoney,
      currentAge,
    };
  }

  // Calculate future value of 401(k) at age 65
  const effectiveRate = returnRate - annualFee;
  const totalAnnualContribution = annualContribution + annualEmployerMatch;
  // Future value of starting balance
  const fvStarting =
    startingBalance * Math.pow(1 + effectiveRate, contributionYears);
  // Future value of contributions (annuity)
  const fvContributions =
    totalAnnualContribution *
    ((Math.pow(1 + effectiveRate, contributionYears) - 1) / effectiveRate);
  const fv = fvStarting + fvContributions;

  // Calculate annual withdrawal to deplete balance over retirement duration
  const annualWithdrawal = fv / retirementDuration;

  // Calculate after-tax income and taxes
  const netRetirementIncome = annualWithdrawal * (1 - retirementTaxRate);
  const incomeTax = annualWithdrawal * retirementTaxRate;

  // Calculate cumulative metrics
  const cumulativeNetIncome = netRetirementIncome * retirementDuration;
  const cumulativeTaxesPaid = incomeTax * retirementDuration;
  const cumulativeFeesPaid = fv * annualFee * retirementDuration;
  const cumulativeTaxesDeferred =
    totalAnnualContribution * contributionYears * workingTaxRate;

  return {
    xValue: 65, // Age when withdrawals start
    startingBalance,
    annualContributions: annualContribution,
    annualEmployerMatch,
    annualFees: `${(annualFee * 100).toFixed(2)}%`,
    grossRetirementIncome: annualWithdrawal,
    incomeTax,
    netRetirementIncome,
    cumulativeTaxesDeferred,
    cumulativeTaxesPaid,
    cumulativeFeesPaid,
    cumulativeNetIncome,
    cumulativeAccountBalance: fv,
    taxesDue: retirementTaxRate * 100,
    deathBenefits: 0, // Not applicable for 401(k)
    yearsRunOutOfMoney,
    currentAge,
  };
}

// Utility to calculate tax-free plan results (IRS 7702, green column)
export function extractTaxFreeResults(
  tables: TableData[],
  currentAge: number,
  yearsRunOutOfMoney: number
): Results {
  const mainTable = tables[0]?.data || [];
  const chargesTable = tables[1]?.data || [];

  // Validate inputs
  if (
    currentAge < 0 ||
    yearsRunOutOfMoney < currentAge ||
    !mainTable.length ||
    !mainTable.every((row) => typeof row.Age !== "undefined")
  ) {
    console.warn("Invalid inputs or empty mainTable for Tax-Free Plan");
    return {
      xValue: 0,
      startingBalance: 0,
      annualContributions: 0,
      annualEmployerMatch: "N/A",
      annualFees: "Included",
      grossRetirementIncome: 0,
      incomeTax: 0,
      netRetirementIncome: 0,
      cumulativeTaxesDeferred: 0,
      cumulativeTaxesPaid: 0,
      cumulativeFeesPaid: 0,
      cumulativeNetIncome: 0,
      cumulativeAccountBalance: 0,
      taxesDue: 0,
      deathBenefits: 0,
      yearsRunOutOfMoney,
      currentAge,
    };
  }

  // Parse currency values from strings
  const parseCurrency = (value: string | number): number => {
    if (typeof value === "number") return value;
    return Number(value.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // Convert Age to number while preserving other properties
  const parsedMainTable: Record<string, string | number>[] = mainTable.map(
    (row) => ({
      ...row,
      Age: Number(row.Age),
    })
  );

  // Get annualContributions from row where Age matches currentAge + 6
  const targetContributionRow = parsedMainTable.find(
    (row) => row.Age === currentAge + 6
  );
  const annualContributions = targetContributionRow
    ? parseCurrency(targetContributionRow["Premium Outlay"] || 0)
    : 0;

  // Find the age when "Net Outlay" first changes
  let xValue = (parsedMainTable[0]?.Age as number) || 65;
  for (let i = 0; i < parsedMainTable.length - 1; i++) {
    const row = parsedMainTable[i];
    const nextRow = parsedMainTable[i + 1];
    if (row["Net Outlay"] !== nextRow["Net Outlay"]) {
      xValue = nextRow.Age as number;
      break;
    }
  }

  let grossRetirementIncome = 0;
  let netRetirementIncome = 0;
  let cumulativeNetIncome = 0;

  if (yearsRunOutOfMoney < xValue) {
    grossRetirementIncome = 0;
    netRetirementIncome = 0;
    cumulativeNetIncome = 0;
  } else {
    // Find row where Age matches yearsRunOutOfMoney
    const targetRow =
      parsedMainTable.find((row) => row.Age === yearsRunOutOfMoney) ||
      parsedMainTable[parsedMainTable.length - 1];

    grossRetirementIncome = parseCurrency(targetRow["Net Outlay"] || 0);
    netRetirementIncome = grossRetirementIncome; // Tax-free, so no income tax
    cumulativeNetIncome = parsedMainTable
      .filter(
        (row) =>
          (row.Age as number) >= xValue &&
          (row.Age as number) <= yearsRunOutOfMoney
      )
      .reduce((sum, row) => sum + parseCurrency(row["Net Outlay"] || 0), 0);
  }

  let cumulativeFeesPaid = 0;
  if (chargesTable.length && mainTable.length) {
    const endIndex = parsedMainTable.findIndex(
      (row) => row.Age === yearsRunOutOfMoney
    );
    if (endIndex !== -1 && endIndex < chargesTable.length) {
      cumulativeFeesPaid = chargesTable
        .slice(0, endIndex + 1)
        .reduce((sum, row) => sum + parseCurrency(row.Charges || 0), 0);
    } else {
      console.warn("Charges table index out of bounds or mismatched");
    }
  }

  const targetRow =
    parsedMainTable.find((row) => row.Age === yearsRunOutOfMoney) ||
    parsedMainTable[parsedMainTable.length - 1];

  const cumulativeAccountBalance = parseCurrency(targetRow["Cash Value"] || 0);
  const deathBenefits = parseCurrency(targetRow["Death Benefit"] || 0);

  return {
    xValue,
    startingBalance: 0,
    annualContributions,
    annualEmployerMatch: "N/A",
    annualFees: "Included",
    grossRetirementIncome,
    incomeTax: 0,
    netRetirementIncome,
    cumulativeTaxesDeferred: 0,
    cumulativeTaxesPaid: 0,
    cumulativeFeesPaid,
    cumulativeNetIncome,
    cumulativeAccountBalance,
    taxesDue: 0,
    deathBenefits,
    yearsRunOutOfMoney,
    currentAge,
  };
}
