'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalculatorState, MarketEstimateResponse } from '@/lib/types';
import { calculateSectionTotals, getDownPaymentPercent, getLoanAmount } from '@/lib/calculations';
import { formatCurrencyWhole, isValidZip } from '@/lib/format';
import MortgageSection from './sections/MortgageSection';
import TaxesInsuranceSection from './sections/TaxesInsuranceSection';
import UtilitiesSection from './sections/UtilitiesSection';
import MaintenanceSection from './sections/MaintenanceSection';
import RepairsSection from './sections/RepairsSection';
import SummarySection from './sections/SummarySection';
import MaintenanceRepairsGroup from './MaintenanceRepairsGroup';

const initialState: CalculatorState = {
  zip: '',
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
    electricity: { value: 135, isAiEstimate: false },
    gas: { value: 60, isAiEstimate: false },
    waterSewer: { value: 70, isAiEstimate: false },
    trash: { value: 35, isAiEstimate: false },
    internet: { value: 70, isAiEstimate: false },
    other: { value: 0, isAiEstimate: false },
  },
  maintenance: {
    squareFootage: 1800,
    poolSpa: 0,
    landscapingCrew: 0,
    housekeeping: 0,
    security: 0,
  },
  repairs: {
    roof: { ageYears: 10 },
    hvac: { ageYears: 8 },
    waterHeater: { ageYears: 5 },
  },
};

interface MarketEstimateState extends MarketEstimateResponse {
  zip: string;
}

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const prevPmiApplicable = useRef<boolean | null>(null);
  const [marketEstimate, setMarketEstimate] = useState<MarketEstimateState | null>(null);
  const fetchedZips = useRef<Set<string>>(new Set());

  const downPaymentPercent = getDownPaymentPercent(state);
  const pmiApplicable = downPaymentPercent < 20;

  async function handleZipBlur(zip: string) {
    if (!isValidZip(zip) || fetchedZips.current.has(zip)) return;
    fetchedZips.current.add(zip);
    try {
      const res = await fetch('/api/estimate-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip }),
      });
      if (!res.ok) return;
      const data: MarketEstimateResponse = await res.json();
      setMarketEstimate({ zip, ...data });
    } catch {
      // Silent — high-end mode just won't activate for this ZIP.
    }
  }

  const isLuxuryMode =
    !!marketEstimate &&
    marketEstimate.zip === state.zip &&
    state.mortgage.purchasePrice >= marketEstimate.countyMedianPrice * 1.25;

  const hoaRange =
    marketEstimate && marketEstimate.zip === state.zip
      ? { low: marketEstimate.hoaLow, high: marketEstimate.hoaHigh }
      : null;

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
    <div className="max-w-2xl mx-auto space-y-5">
      <MortgageSection
        value={state.mortgage}
        onChange={(patch) => setState((s) => ({ ...s, mortgage: { ...s.mortgage, ...patch } }))}
        loanAmount={loanAmount}
        monthlyMortgage={totals.mortgageMonthly}
        pmiApplicable={pmiApplicable}
        zip={state.zip}
        onZipChange={(zip) => setState((s) => ({ ...s, zip }))}
        onZipBlur={handleZipBlur}
      />
      <TaxesInsuranceSection
        value={state.taxesInsurance}
        onChange={(patch) => setState((s) => ({ ...s, taxesInsurance: { ...s.taxesInsurance, ...patch } }))}
        monthlyPropertyTax={totals.propertyTaxMonthly}
        monthlyInsurance={totals.homeownersInsuranceMonthly}
        monthlyTotal={totals.taxesInsuranceMonthly}
        isLuxuryMode={isLuxuryMode}
        hoaRange={hoaRange}
      />
      <UtilitiesSection
        zip={state.zip}
        value={state.utilities}
        onChange={(patch) => setState((s) => ({ ...s, utilities: { ...s.utilities, ...patch } }))}
        monthlyTotal={totals.utilitiesMonthly}
      />
      <MaintenanceRepairsGroup>
        <MaintenanceSection
          value={state.maintenance}
          onChange={(patch) => setState((s) => ({ ...s, maintenance: { ...s.maintenance, ...patch } }))}
          monthlyTotal={totals.maintenanceMonthly}
          isLuxuryMode={isLuxuryMode}
        />
        <RepairsSection
          value={state.repairs}
          onChange={(patch) => setState((s) => ({ ...s, repairs: { ...s.repairs, ...patch } }))}
          roofReserve={totals.roofReserve}
          hvacReserve={totals.hvacReserve}
          waterHeaterReserve={totals.waterHeaterReserve}
          monthlyTotal={totals.repairsMonthly}
        />
      </MaintenanceRepairsGroup>

      <SummarySection state={state} totals={totals} />

      <a
        href="#summary"
        className="fixed bottom-0 inset-x-0 z-20 flex items-center justify-between bg-navy text-white px-5 py-3 shadow-lg"
      >
        <span className="text-sm text-white/70">Your monthly true cost so far</span>
        <span className="text-lg font-semibold tabular-nums">{formatCurrencyWhole(totals.grandTotal)}/mo ↓</span>
      </a>
      <div className="h-16" aria-hidden="true" />
    </div>
  );
}
