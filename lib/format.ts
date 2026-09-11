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

// Plain-language sentence describing how a reserve offset (starting cash + dedicated credit
// line) was applied to the soonest-due systems. Returns null when there's nothing to report
// (no offset entered, or the offset didn't end up applied to any system).
export function formatReserveOffsetSentence(
  cash: number,
  creditLine: number,
  appliedSystems: string[],
): string | null {
  const combined = Math.max(0, cash) + Math.max(0, creditLine);
  if (combined <= 0 || appliedSystems.length === 0) return null;

  const parts: string[] = [];
  if (cash > 0) parts.push(`${formatCurrencyWhole(cash)} cash`);
  if (creditLine > 0) parts.push(`${formatCurrencyWhole(creditLine)} credit line`);
  const breakdown = parts.length > 0 ? ` (${parts.join(', ')})` : '';

  const systemsPhrase =
    appliedSystems.length === 1
      ? `the ${appliedSystems[0]}`
      : `the ${appliedSystems[0]} first, then the ${appliedSystems.slice(1).join(', then the ')}`;

  return `Your ${formatCurrencyWhole(combined)} reserve offset${breakdown} was applied to ${systemsPhrase}.`;
}
