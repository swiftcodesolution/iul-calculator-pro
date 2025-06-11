import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ClientFile } from "./types";

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

export const getImageSrc = (
  src: string | File | undefined
): string | undefined => {
  if (typeof src === "string") return src;
  if (src instanceof File) return URL.createObjectURL(src);
  return undefined;
};
