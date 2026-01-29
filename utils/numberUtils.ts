/**
 * Normalize decimal input - accepts both comma and dot
 * Turkish users often use comma (,) as decimal separator
 */
export function normalizeDecimal(value: string): string {
  // Replace comma with dot for parseFloat
  return value.replace(',', '.');
}

/**
 * Safe parseFloat that handles both comma and dot
 */
export function parseNumberSafe(value: string): number {
  const normalized = normalizeDecimal(value.trim());
  const result = parseFloat(normalized);
  return isNaN(result) ? 0 : result;
}

/**
 * Format number for display - use dot (standard)
 * Could optionally use comma for Turkish locale
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
