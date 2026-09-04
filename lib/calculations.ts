import {
  CalculatorState,
  MAINTENANCE_RATE_PER_SQFT,
  SYSTEM_REFERENCE_DATA,
  SectionTotals,
} from './types';

export function getDownPaymentDollar(state: CalculatorState): number {
  const { mortgage } = state;
  if (mortgage.downPaymentMode === 'dollar') return mortgage.downPaymentDollar;
  return (mortgage.purchasePrice * mortgage.downPaymentPercent) / 100;
}

export function getDownPaymentPercent(state: CalculatorState): number {
  const { mortgage } = state;
  if (mortgage.downPaymentMode === 'percent') return mortgage.downPaymentPercent;
  if (mortgage.purchasePrice <= 0) return 0;
  return (mortgage.downPaymentDollar / mortgage.purchasePrice) * 100;
}

export function getLoanAmount(state: CalculatorState): number {
  const loanAmount = state.mortgage.purchasePrice - getDownPaymentDollar(state);
  return Math.max(0, loanAmount);
}

export function calculateMonthlyPAndI(state: CalculatorState): number {
  const loanAmount = getLoanAmount(state);
  const monthlyRate = state.mortgage.interestRate / 100 / 12;
  const numPayments = state.mortgage.loanTerm * 12;

  if (loanAmount <= 0 || numPayments <= 0) return 0;
  if (monthlyRate === 0) return loanAmount / numPayments;

  const factor = Math.pow(1 + monthlyRate, numPayments);
  const payment = (loanAmount * (monthlyRate * factor)) / (factor - 1);
  return Number.isFinite(payment) ? payment : 0;
}

export function calculateSectionTotals(state: CalculatorState): SectionTotals {
  const pAndI = calculateMonthlyPAndI(state);
  const pmiMonthly = state.mortgage.pmiEnabled ? state.mortgage.pmiMonthly : 0;
  const mortgageMonthly = pAndI + pmiMonthly;

  const propertyTaxMonthly = state.taxesInsurance.annualPropertyTax / 12;
  const homeownersInsuranceMonthly =
    state.taxesInsurance.insuranceMode === 'annual'
      ? state.taxesInsurance.homeownersInsuranceAnnual / 12
      : state.taxesInsurance.homeownersInsuranceMonthly;
  const hoaMonthly = state.taxesInsurance.hoaMonthly;
  const taxesInsuranceMonthly = propertyTaxMonthly + homeownersInsuranceMonthly + hoaMonthly;

  const u = state.utilities;
  const utilitiesMonthly =
    u.electricity.value + u.gas.value + u.waterSewer.value + u.trash.value + u.internet.value + u.other.value;

  const m = state.maintenance;
  const maintenanceMonthly =
    m.squareFootage * MAINTENANCE_RATE_PER_SQFT + m.poolSpa + m.landscapingCrew + m.housekeeping + m.security;

  const roofReserve = calculateSystemReserve(
    state.repairs.roof.ageYears,
    SYSTEM_REFERENCE_DATA.roof.lifespan,
    SYSTEM_REFERENCE_DATA.roof.cost,
  );
  const hvacReserve = calculateSystemReserve(
    state.repairs.hvac.ageYears,
    SYSTEM_REFERENCE_DATA.hvac.lifespan,
    SYSTEM_REFERENCE_DATA.hvac.cost,
  );
  const waterHeaterReserve = calculateSystemReserve(
    state.repairs.waterHeater.ageYears,
    SYSTEM_REFERENCE_DATA.waterHeater.lifespan,
    SYSTEM_REFERENCE_DATA.waterHeater.cost,
  );
  const repairsMonthly = roofReserve + hvacReserve + waterHeaterReserve;

  const grandTotal =
    mortgageMonthly + taxesInsuranceMonthly + utilitiesMonthly + maintenanceMonthly + repairsMonthly;

  return {
    mortgageMonthly,
    pAndI,
    pmiMonthly,
    taxesInsuranceMonthly,
    propertyTaxMonthly,
    homeownersInsuranceMonthly,
    hoaMonthly,
    utilitiesMonthly,
    maintenanceMonthly,
    repairsMonthly,
    roofReserve,
    hvacReserve,
    waterHeaterReserve,
    grandTotal,
  };
}

function calculateSystemReserve(ageYears: number, lifespan: number, replacementCost: number): number {
  const yearsRemaining = Math.max(1, lifespan - ageYears);
  return replacementCost / yearsRemaining / 12;
}
