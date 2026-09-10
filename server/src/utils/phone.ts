/**
 * Validate 10-digit Indian Mobile number (starting with 6, 7, 8, or 9)
 */
export function isValidIndianMobile(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // Matches 10 digits starting with 6-9, optionally prefixed by 91 or 0
  return /^(?:91|0)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Normalize phone number into standard international format (+91 XXXXX XXXXX)
 */
export function normalizeIndianMobile(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  const digits = cleaned.slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone.trim();
}

