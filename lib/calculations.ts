import {
  CalculatorState,
  LUXURY_SYSTEM_REFERENCE_DATA,
  MAINTENANCE_RATE_PER_SQFT,
  RepairsInputs,
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

// Conservative middle-of-range annual PMI rates by down payment tier. Credit score isn't
// collected in this calculator, so pricing is based on down payment tier alone.
export function getAutoPmiAnnualRate(downPaymentPercent: number): number {
  if (downPaymentPercent < 5) return 0.013;
  if (downPaymentPercent < 10) return 0.01;
  if (downPaymentPercent < 15) return 0.007;
  if (downPaymentPercent < 20) return 0.004;
  return 0;
}

export function calculateAutoPmiMonthly(loanAmount: number, downPaymentPercent: number): number {
  const rate = getAutoPmiAnnualRate(downPaymentPercent);
  return Math.round(((loanAmount * rate) / 12) * 100) / 100;
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
    u.electricity.value +
    u.gas.value +
    u.waterSewer.value +
    u.trash.value +
    u.internet.value +
    u.other.value +
    u.poolSpa +
    u.landscapingCrew +
    u.housekeeping +
    u.security;

  const maintenanceMonthly = state.maintenance.squareFootage * MAINTENANCE_RATE_PER_SQFT;

  const referenceData = state.isLuxuryMode ? LUXURY_SYSTEM_REFERENCE_DATA : SYSTEM_REFERENCE_DATA;

  const { roofReserve, hvacReserve, waterHeaterReserve, appliedSystems } = calculateReserves(
    state.repairs,
    referenceData,
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
    reserveOffsetAppliedSystems: appliedSystems,
    grandTotal,
  };
}

type SystemKey = 'roof' | 'hvac' | 'waterHeater';

// Fixed tie-break order used when two systems have the same years remaining.
const TIE_BREAK_ORDER: SystemKey[] = ['roof', 'hvac', 'waterHeater'];

// One pooled reserve offset (starting cash + dedicated credit line) is credited against whichever
// system is soonest due, with any remainder rolling forward to the next-soonest system, down to a
// floor of $0 per system. When the combined offset is $0 (the default), this returns the same
// reserves as a plain cost / years-remaining / 12 calculation for every system.
interface SystemReferenceEntry {
  lifespan: number;
  cost: number;
  label: string;
}

function calculateReserves(
  repairs: RepairsInputs,
  referenceData: Record<SystemKey, SystemReferenceEntry>,
): {
  roofReserve: number;
  hvacReserve: number;
  waterHeaterReserve: number;
  appliedSystems: string[];
} {
  const systems = (['roof', 'hvac', 'waterHeater'] as SystemKey[]).map((key) => ({
    key,
    label: referenceData[key].label,
    cost: referenceData[key].cost,
    yearsRemaining: Math.max(1, referenceData[key].lifespan - repairs[key].ageYears),
  }));

  const soonestDueOrder = [...systems].sort((a, b) => {
    if (a.yearsRemaining !== b.yearsRemaining) return a.yearsRemaining - b.yearsRemaining;
    return TIE_BREAK_ORDER.indexOf(a.key) - TIE_BREAK_ORDER.indexOf(b.key);
  });

  const combinedOffset = Math.max(0, repairs.startingCashReserve) + Math.max(0, repairs.dedicatedCreditLine);
  let remainingOffset = combinedOffset;
  const adjustedCosts: Record<SystemKey, number> = { roof: 0, hvac: 0, waterHeater: 0 };
  const appliedSystems: string[] = [];

  for (const system of soonestDueOrder) {
    const applied = Math.min(remainingOffset, system.cost);
    adjustedCosts[system.key] = system.cost - applied;
    remainingOffset -= applied;
    if (applied > 0) appliedSystems.push(system.label);
  }

  const reserveFor = (key: SystemKey) => {
    const system = systems.find((s) => s.key === key)!;
    return adjustedCosts[key] / system.yearsRemaining / 12;
  };

  return {
    roofReserve: reserveFor('roof'),
    hvacReserve: reserveFor('hvac'),
    waterHeaterReserve: reserveFor('waterHeater'),
    appliedSystems,
  };
}
