export function formatCurrency(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) value = 0;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrencyWhole(value: number): string {
  return formatCurrency(value, 0);
}

export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
