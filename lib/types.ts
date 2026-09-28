export type DownPaymentMode = 'dollar' | 'percent';
export type InsuranceMode = 'annual' | 'monthly';
export type LoanTerm = 15 | 20 | 30;

export interface MortgageInputs {
  purchasePrice: number;
  downPaymentMode: DownPaymentMode;
  downPaymentDollar: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: LoanTerm;
  pmiEnabled: boolean;
  pmiMonthly: number;
  pmiManualOverride: boolean;
}

export interface TaxesInsuranceInputs {
  annualPropertyTax: number;
  insuranceMode: InsuranceMode;
  homeownersInsuranceAnnual: number;
  homeownersInsuranceMonthly: number;
  hoaMonthly: number;
}

export interface UtilityFieldState {
  value: number;
  isAiEstimate: boolean;
  // Overrides the default "AI estimate" badge text (e.g. "Local rate" for a sourced
  // county-level figure, "Estimate" for a statewide fallback). Ignored when isAiEstimate is false.
  badgeLabel?: string;
  // Short note shown under the field explaining where the value came from. Set alongside
  // badgeLabel for sourced/fallback values; omitted for the default AI-estimate path.
  sourceNote?: string;
}

export interface UtilitiesInputs {
  electricity: UtilityFieldState;
  gas: UtilityFieldState;
  waterSewer: UtilityFieldState;
  trash: UtilityFieldState;
  internet: UtilityFieldState;
  other: UtilityFieldState;
  // Luxury-mode-only fields: recurring monthly bills, same nature as the fields above, shown
  // only when isLuxuryMode is true.
  poolSpa: number;
  landscapingCrew: number;
  housekeeping: number;
  security: number;
}

export interface SystemInputs {
  ageYears: number;
}

export interface RepairsInputs {
  roof: SystemInputs;
  hvac: SystemInputs;
  waterHeater: SystemInputs;
  startingCashReserve: number;
  dedicatedCreditLine: number;
}

export type LuxuryThresholdSource = 'zillow' | 'ai-estimate' | null;

export interface CalculatorState {
  zip: string;
  isLuxuryMode: boolean;
  luxuryThresholdSource: LuxuryThresholdSource;
  marketEstimateFailed: boolean;
  mortgage: MortgageInputs;
  taxesInsurance: TaxesInsuranceInputs;
  utilities: UtilitiesInputs;
  repairs: RepairsInputs;
}

export interface UtilityEstimateResponse {
  electricity: number;
  gas: number;
  waterSewer: number;
  trash: number;
  // Set when waterSewer/trash came from a sourced rate table (currently Washington only) instead
  // of the AI estimate. When sourced is false, source is omitted and the field is the usual AI
  // estimate.
  waterSewerSourced?: boolean;
  waterSewerSource?: string;
  trashSourced?: boolean;
  trashSource?: string;
}

export interface MarketEstimateResponse {
  countyMedianPrice: number;
  hoaLow: number;
  hoaHigh: number;
}

export interface ZipTopTierValueResponse {
  zip: string;
  value: number | null;
  asOf: string;
  source: string;
}

export interface SectionTotals {
  mortgageMonthly: number;
  pAndI: number;
  pmiMonthly: number;
  taxesInsuranceMonthly: number;
  propertyTaxMonthly: number;
  homeownersInsuranceMonthly: number;
  hoaMonthly: number;
  // House Payment total (Box 1): mortgageMonthly + taxesInsuranceMonthly.
  houseMonthly: number;
  utilitiesMonthly: number;
  maintenanceMonthly: number;
  // Monthly Operating Expenses total (Box 2): utilitiesMonthly + maintenanceMonthly.
  operatingExpensesMonthly: number;
  // Stage 1 result: houseMonthly + operatingExpensesMonthly. What the homeowner should expect
  // to pay out of pocket every month, before the Owner's Reserve set-aside.
  trueMonthlyCost: number;
  repairsMonthly: number;
  roofReserve: number;
  hvacReserve: number;
  waterHeaterReserve: number;
  // Labels of systems that received part of the reserve offset (starting cash + credit line),
  // in the order the offset was applied (soonest-due system first). Empty when no offset is set.
  reserveOffsetAppliedSystems: string[];
  // Stage 2 result: trueMonthlyCost + repairsMonthly. The site's namesake, full planning number.
  grandTotal: number;
}

export const SYSTEM_REFERENCE_DATA = {
  roof: { lifespan: 25, cost: 14500, label: 'Roof' },
  hvac: { lifespan: 17, cost: 9838, label: 'HVAC' },
  waterHeater: { lifespan: 10, cost: 1550, label: 'Water Heater' },
} as const;

// Used in place of SYSTEM_REFERENCE_DATA when luxury mode is triggered. Same lifespans, higher
// replacement costs reflecting luxury-tier system quality and installation complexity.
export const LUXURY_SYSTEM_REFERENCE_DATA = {
  roof: { lifespan: 25, cost: 40000, label: 'Roof' },
  hvac: { lifespan: 17, cost: 22000, label: 'HVAC' },
  waterHeater: { lifespan: 10, cost: 6500, label: 'Water Heater' },
} as const;

// NAHB home operating expense data: routine maintenance and repairs average this share of a
// home's purchase price per year. Replaces the old flat $0.14/sq ft HUD/VA figure, which didn't
// scale with home value.
export const MAINTENANCE_RATE_OF_VALUE = 0.0054;

// Max number of properties a visitor can run in a single sitting before getting one combined email.
export const MAX_PROPERTIES = 3;
