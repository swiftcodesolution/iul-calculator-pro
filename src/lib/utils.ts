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

export function extractTaxFreeResults(
  tables: TableData[],
  currentAge: number,
  yearsRunOutOfMoney: number
): Results {
  // First table for Premium Outlay, Net Outlay, Cash Value, Death Benefit
  const mainTable = tables[0]?.data || [];
  // Second table for Charges
  const chargesTable = tables[1]?.data || [];

  if (!mainTable.length) {
    return {
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

  // Helper to parse currency strings (e.g., "$6,000.00" -> 6000)
  const parseCurrency = (value: string | number): number => {
    if (typeof value === "number") return value;
    return Number(value.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // Annual Contributions: 7th row of "Premium Outlay"
  const annualContributions = parseCurrency(
    mainTable[6]?.["Premium Outlay"] || 0
  );

  // Gross Retirement Income: First different value in "Net Outlay"
  let grossRetirementIncome = 0;
  for (let i = 1; i < mainTable.length; i++) {
    if (mainTable[i]["Net Outlay"] !== mainTable[i - 1]["Net Outlay"]) {
      grossRetirementIncome = parseCurrency(mainTable[i]["Net Outlay"]);
      break;
    }
  }
  // Fallback: If all Net Outlay values are the same (e.g., $0), use a default or last value
  if (grossRetirementIncome === 0) {
    grossRetirementIncome = parseCurrency(
      mainTable[mainTable.length - 1]?.["Net Outlay"] || 0
    );
  }

  // Cumulative Fees Paid: Sum of "Charges" up to yearsRunOutOfMoney row
  let cumulativeFeesPaid = 0;
  for (let i = 0; i < Math.min(yearsRunOutOfMoney, chargesTable.length); i++) {
    cumulativeFeesPaid += parseCurrency(chargesTable[i]?.["Charges"] || 0);
  }

  // Cumulative Account Balance: "Cash Value" at yearsRunOutOfMoney row
  const rowIndex = Math.min(yearsRunOutOfMoney - 1, mainTable.length - 1);
  const cumulativeAccountBalance = parseCurrency(
    mainTable[rowIndex]?.["Cash Value"] || 0
  );

  // Death Benefits: "Death Benefit" at yearsRunOutOfMoney row
  const deathBenefits = parseCurrency(
    mainTable[rowIndex]?.["Death Benefit"] || 0
  );

  // Net Retirement Income: Same as grossRetirementIncome
  const netRetirementIncome = grossRetirementIncome;

  // Cumulative Net Income: grossRetirementIncome * (currentAge - yearsRunOutOfMoney)
  const yearsDifference = Math.max(currentAge - yearsRunOutOfMoney, 0);
  const cumulativeNetIncome = grossRetirementIncome * yearsDifference;

  return {
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
