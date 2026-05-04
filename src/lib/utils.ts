import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compact number formatter: 12345 -> "12.3k", 1234567 -> "1.23M".
 * For values < 1000, returns the integer (or up to 2 decimals if < 1).
 */
export function formatCompact(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}k`;
  if (abs >= 1) return `${sign}${Math.round(abs)}`;
  if (abs === 0) return "0";
  return `${sign}${abs.toFixed(2)}`;
}
