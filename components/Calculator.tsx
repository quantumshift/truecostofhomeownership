'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalculatorState } from '@/lib/types';
import { calculateSectionTotals, getDownPaymentPercent, getLoanAmount } from '@/lib/calculations';
import { formatCurrencyWhole } from '@/lib/format';
import MortgageSection from './sections/MortgageSection';
import TaxesInsuranceSection from './sections/TaxesInsuranceSection';
import UtilitiesSection from './sections/UtilitiesSection';
import MaintenanceSection from './sections/MaintenanceSection';
import RepairsSection from './sections/RepairsSection';
import SummarySection from './sections/SummarySection';

const initialState: CalculatorState = {
  mortgage: {
    purchasePrice: 400000,
    downPaymentMode: 'percent',
    downPaymentDollar: 40000,
    downPaymentPercent: 10,
    interestRate: 6.5,
    loanTerm: 30,
    pmiEnabled: true,
    pmiMonthly: 150,
  },
  taxesInsurance: {
    annualPropertyTax: 4000,
    insuranceMode: 'annual',
    homeownersInsuranceAnnual: 1500,
    homeownersInsuranceMonthly: 125,
    hoaMonthly: 0,
  },
  utilities: {
    zip: '',
    electricitySummer: { value: 150, isAiEstimate: false },
    electricityWinter: { value: 120, isAiEstimate: false },
    gasSummer: { value: 20, isAiEstimate: false },
    gasWinter: { value: 100, isAiEstimate: false },
    waterSewer: { value: 70, isAiEstimate: false },
    trash: { value: 35, isAiEstimate: false },
    internet: { value: 70, isAiEstimate: false },
    other: { value: 0, isAiEstimate: false },
  },
  maintenance: {
    squareFootage: 1800,
  },
  repairs: {
    roof: { ageYears: 10 },
    hvac: { ageYears: 8 },
    waterHeater: { ageYears: 5 },
  },
};

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const prevPmiApplicable = useRef<boolean | null>(null);

  const downPaymentPercent = getDownPaymentPercent(state);
  const pmiApplicable = downPaymentPercent < 20;

  useEffect(() => {
    if (prevPmiApplicable.current === null) {
      prevPmiApplicable.current = pmiApplicable;
      if (pmiApplicable !== state.mortgage.pmiEnabled) {
        setState((s) => ({ ...s, mortgage: { ...s.mortgage, pmiEnabled: pmiApplicable } }));
      }
      return;
    }
    if (prevPmiApplicable.current !== pmiApplicable) {
      prevPmiApplicable.current = pmiApplicable;
      setState((s) => ({ ...s, mortgage: { ...s.mortgage, pmiEnabled: pmiApplicable } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pmiApplicable]);

  const loanAmount = getLoanAmount(state);
  const totals = useMemo(() => calculateSectionTotals(state), [state]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px] items-start">
      <div className="space-y-5">
        <MortgageSection
          value={state.mortgage}
          onChange={(patch) => setState((s) => ({ ...s, mortgage: { ...s.mortgage, ...patch } }))}
          loanAmount={loanAmount}
          monthlyMortgage={totals.mortgageMonthly}
          pmiApplicable={pmiApplicable}
        />
        <TaxesInsuranceSection
          value={state.taxesInsurance}
          onChange={(patch) => setState((s) => ({ ...s, taxesInsurance: { ...s.taxesInsurance, ...patch } }))}
          monthlyPropertyTax={totals.propertyTaxMonthly}
          monthlyInsurance={totals.homeownersInsuranceMonthly}
          monthlyTotal={totals.taxesInsuranceMonthly}
        />
        <UtilitiesSection
          value={state.utilities}
          onChange={(patch) => setState((s) => ({ ...s, utilities: { ...s.utilities, ...patch } }))}
          monthlyTotal={totals.utilitiesMonthly}
        />
        <MaintenanceSection
          value={state.maintenance}
          onChange={(patch) => setState((s) => ({ ...s, maintenance: { ...s.maintenance, ...patch } }))}
          monthlyTotal={totals.maintenanceMonthly}
        />
        <RepairsSection
          value={state.repairs}
          onChange={(patch) => setState((s) => ({ ...s, repairs: { ...s.repairs, ...patch } }))}
          roofReserve={totals.roofReserve}
          hvacReserve={totals.hvacReserve}
          waterHeaterReserve={totals.waterHeaterReserve}
          monthlyTotal={totals.repairsMonthly}
        />
      </div>

      <div className="lg:sticky lg:top-6">
        <SummarySection state={state} totals={totals} />
      </div>

      <a
        href="#summary"
        className="lg:hidden fixed bottom-0 inset-x-0 z-20 flex items-center justify-between bg-navy text-white px-5 py-3 shadow-lg"
      >
        <span className="text-sm text-white/70">Your monthly true cost</span>
        <span className="text-lg font-semibold tabular-nums">{formatCurrencyWhole(totals.grandTotal)}/mo ↓</span>
      </a>
      <div className="lg:hidden h-16" aria-hidden="true" />
    </div>
  );
}
