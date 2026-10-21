/**
 * Utilities for formatting and validating UK Family Court (HMCTS) 16-digit case numbers.
 * Standard format: 16 digits grouped into 4 groups of 4 digits separated by spaces:
 * "1792 1487 9533 6269"
 */

/**
 * Formats a raw court case number into standard 4x4 digit blocks: "XXXX XXXX XXXX XXXX".
 * Preserves legacy or internal auto-generated IDs (e.g., CASE_xxxx).
 */
export function formatCaseNumberInput(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // Preserve internal auto-generated tracking IDs
  if (trimmed.startsWith('CASE_') || trimmed.startsWith('case_')) {
    return raw;
  }

  // Extract digits only and limit to 16
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  if (!digits) return '';

  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : digits;
}

export interface CaseNumberValidationResult {
  isValid: boolean;
  error?: string;
  digitsCount: number;
}

/**
 * Validates whether an entered case ID / court case number matches the
 * required 16-digit format (e.g. 1792 1487 9533 6269).
 * Returns validity status, digit count, and user-facing error message.
 */
export function validateCaseNumber(raw?: string): CaseNumberValidationResult {
  if (!raw || !raw.trim()) {
    return { isValid: true, digitsCount: 0 }; // Optional field
  }

  const trimmed = raw.trim();

  // Allow existing internal auto-generated bundle IDs
  if (trimmed.startsWith('CASE_') || trimmed.startsWith('case_')) {
    return { isValid: true, digitsCount: 0 };
  }

  // Check for disallowed characters (only digits, spaces, and hyphens permitted)
  if (/[^\d\s-]/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, '');
    return {
      isValid: false,
      digitsCount: digits.length,
      error: 'Case ID must contain only numbers (e.g. 1792 1487 9533 6269)',
    };
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length !== 16) {
    return {
      isValid: false,
      digitsCount: digits.length,
      error: `Case ID must be a 16-digit number formatted like 1792 1487 9533 6269 (${digits.length}/16 digits)`,
    };
  }

  return { isValid: true, digitsCount: 16 };
}
