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
  annualContribution: number,
  returnRate: number, // currentPlanROR (e.g., 6.3% as 0.063)
  retirementTaxRate: number, // e.g., 28% as 0.28
  annualFee: number, // currentPlanFees (e.g., 2.5% as 0.025)
  workingTaxRate: number, // e.g., 28% as 0.28
  startingBalance: number,
  annualEmployerMatch: number,
  retirementAge: number, // From BoxesData, replacing hardcoded 65
  withdrawalRate: number = 0.04 // Default to 4%, can be made configurable
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
    workingTaxRate < 0 ||
    retirementAge < currentAge ||
    withdrawalRate <= 0
  ) {
    console.warn("Invalid input parameters for Current Plan calculations");
    return {
      xValue: retirementAge,
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
      taxesDue: 0,
      deathBenefits: 0,
      yearsRunOutOfMoney,
      currentAge,
    };
  }

  // Calculate years of contribution (from current age to retirement age)
  const contributionYears = retirementAge - currentAge;
  const retirementDuration = yearsRunOutOfMoney - retirementAge;

  // Validate contribution and retirement periods
  if (contributionYears <= 0 || retirementDuration <= 0) {
    console.warn("Invalid age or retirement duration");
    return {
      xValue: retirementAge,
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
      taxesDue: 0,
      deathBenefits: 0,
      yearsRunOutOfMoney,
      currentAge,
    };
  }

  // 1. Cumulative Account Balance at retirement age (before withdrawals)
  let balance = startingBalance;
  for (let i = 0; i < contributionYears; i++) {
    balance += annualContribution + annualEmployerMatch;
    balance *= 1 + returnRate; // Apply growth
    balance -= balance * annualFee; // Apply fees after growth
  }

  // 2. Gross Retirement Income: Use the provided withdrawal rate
  const grossRetirementIncome = balance * withdrawalRate;

  // 3. Income Tax: retirementTaxRate of gross retirement income
  const incomeTax = grossRetirementIncome * retirementTaxRate;

  // 4. Net Retirement Income: Gross - Income Tax
  const netRetirementIncome = grossRetirementIncome - incomeTax;

  // 5. Cumulative Taxes Deferred: $0 (no pre-tax contributions)
  const cumulativeTaxesDeferred = 0;

  // 6. Cumulative Taxes Paid: Working taxes + retirement taxes
  const taxesDuringWorkingYears =
    annualContribution * workingTaxRate * contributionYears;
  const taxesDuringRetirement = incomeTax * retirementDuration;
  const cumulativeTaxesPaid = taxesDuringWorkingYears + taxesDuringRetirement;

  // 7. Cumulative Fees Paid: Accumulate fees over contribution and retirement periods
  let cumulativeFeesPaid = 0;
  let tempBalance = startingBalance;
  for (let i = 0; i < contributionYears + retirementDuration; i++) {
    if (i < contributionYears) {
      tempBalance += annualContribution + annualEmployerMatch;
      tempBalance *= 1 + returnRate;
      const fee = tempBalance * annualFee;
      cumulativeFeesPaid += fee;
      tempBalance -= fee;
    } else {
      tempBalance -= grossRetirementIncome;
      tempBalance *= 1 + returnRate; // Continue growth on remaining balance
      if (tempBalance < 0) tempBalance = 0;
      const fee = tempBalance * annualFee;
      cumulativeFeesPaid += fee;
      tempBalance -= fee;
    }
  }

  // 8. Cumulative Net Income: Net retirement income over retirement duration
  const cumulativeNetIncome = netRetirementIncome * retirementDuration;

  // 9. Cumulative Account Balance: Remaining balance after withdrawals and fees
  let remainingBalance = balance;
  for (let i = 0; i < retirementDuration; i++) {
    remainingBalance -= grossRetirementIncome;
    remainingBalance *= 1 + returnRate;
    if (remainingBalance < 0) remainingBalance = 0;
    remainingBalance -= remainingBalance * annualFee;
  }
  const cumulativeAccountBalance = remainingBalance;

  // 10. Taxes Due: retirementTaxRate of remaining balance at end of retirement
  const taxesDue = remainingBalance * retirementTaxRate;

  // 11. Death Benefits: Remaining balance after taxes due
  const deathBenefits = remainingBalance - taxesDue;

  return {
    xValue: retirementAge,
    startingBalance,
    annualContributions: annualContribution,
    annualEmployerMatch,
    annualFees: `${(annualFee * 100).toFixed(2)}%`,
    grossRetirementIncome,
    incomeTax,
    netRetirementIncome,
    cumulativeTaxesDeferred,
    cumulativeTaxesPaid,
    cumulativeFeesPaid,
    cumulativeNetIncome,
    cumulativeAccountBalance,
    taxesDue,
    deathBenefits: deathBenefits > 0 ? deathBenefits : 0,
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
