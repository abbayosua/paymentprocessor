import { Preset, RegexPattern } from '@/types';

/**
 * Parse amount from Indonesian currency format
 * Handles formats like: "103.433", "103,433", "103433", "Rp 103.433"
 */
export function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;

  // Remove "Rp" prefix and whitespace
  let cleaned = amountStr.replace(/Rp\.?\s*/i, '').trim();

  // Handle Indonesian format (dot as thousand separator, comma as decimal)
  // Example: "103.433" -> 103433
  // Example: "103,433" -> 103433 (treat comma as thousand separator in some cases)
  // Example: "103.433,50" -> 103433.50

  // Check if it has both dot and comma (e.g., "1.034.433,50")
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Remove dots (thousand separator), replace comma with dot (decimal)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes('.')) {
    // Only dots - could be thousand separator or decimal
    // Check if the last segment is 3 digits (thousand separator)
    const parts = cleaned.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      // Likely thousand separator
      cleaned = cleaned.replace(/\./g, '');
    } else {
      // Could be decimal separator
      // For Indonesian amounts, we'll treat as thousand separator if > 1000
      const noDots = cleaned.replace(/\./g, '');
      if (parseInt(noDots) > 100000) {
        cleaned = noDots;
      }
    }
  } else if (cleaned.includes(',')) {
    // Only comma - could be thousand separator or decimal
    const parts = cleaned.split(',');
    if (parts[parts.length - 1].length === 3) {
      // Likely thousand separator
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Decimal separator
      cleaned = cleaned.replace(',', '.');
    }
  }

  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.round(amount);
}

/**
 * Extract amount from notification text using patterns
 */
export function extractAmount(
  text: string,
  patterns: RegexPattern[]
): { amount: number; matchedPattern: string } | null {
  if (!text || !patterns.length) return null;

  for (const patternConfig of patterns) {
    try {
      const regex = new RegExp(patternConfig.pattern, 'i');
      const match = text.match(regex);

      if (match && match[1]) {
        const amount = parseAmount(match[1]);
        if (amount > 0) {
          return {
            amount,
            matchedPattern: patternConfig.name,
          };
        }
      }
    } catch (error) {
      console.error(`Invalid regex pattern: ${patternConfig.pattern}`, error);
    }
  }

  return null;
}

/**
 * Find preset by package name
 */
export function findPresetByPackage(
  presets: Preset[],
  packageName: string
): Preset | undefined {
  return presets.find(
    (p) => p.packageName === packageName && p.enabled
  );
}

/**
 * Process notification text and extract transaction info
 */
export function processNotification(
  text: string,
  packageName: string,
  presets: Preset[]
): { amount: number; sourceApp: string } | null {
  const preset = findPresetByPackage(presets, packageName);
  if (!preset) return null;

  const result = extractAmount(text, preset.patterns);
  if (!result) return null;

  return {
    amount: result.amount,
    sourceApp: preset.displayName,
  };
}

/**
 * Format amount to Indonesian currency string
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
