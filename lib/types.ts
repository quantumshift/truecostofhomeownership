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
  zip: string;
  electricitySummer: UtilityFieldState;
  electricityWinter: UtilityFieldState;
  gasSummer: UtilityFieldState;
  gasWinter: UtilityFieldState;
  waterSewer: UtilityFieldState;
  trash: UtilityFieldState;
  internet: UtilityFieldState;
  other: UtilityFieldState;
}

export interface MaintenanceInputs {
  squareFootage: number;
}

export interface SystemInputs {
  ageYears: number;
}

export interface RepairsInputs {
  roof: SystemInputs;
  hvac: SystemInputs;
  waterHeater: SystemInputs;
}

export interface CalculatorState {
  mortgage: MortgageInputs;
  taxesInsurance: TaxesInsuranceInputs;
  utilities: UtilitiesInputs;
  maintenance: MaintenanceInputs;
  repairs: RepairsInputs;
}

export interface UtilityEstimateResponse {
  electricitySummer: number;
  electricityWinter: number;
  gasSummer: number;
  gasWinter: number;
  waterSewer: number;
  trash: number;
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
  grandTotal: number;
}

export const SYSTEM_REFERENCE_DATA = {
  roof: { lifespan: 25, cost: 14500, label: 'Roof' },
  hvac: { lifespan: 17, cost: 9838, label: 'HVAC' },
  waterHeater: { lifespan: 10, cost: 1550, label: 'Water Heater' },
} as const;

export const MAINTENANCE_RATE_PER_SQFT = 0.14;
