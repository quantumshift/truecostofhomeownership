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
  utilitiesMonthly: number;
  maintenanceMonthly: number;
  repairsMonthly: number;
  roofReserve: number;
  hvacReserve: number;
  waterHeaterReserve: number;
  // Labels of systems that received part of the reserve offset (starting cash + credit line),
  // in the order the offset was applied (soonest-due system first). Empty when no offset is set.
  reserveOffsetAppliedSystems: string[];
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
