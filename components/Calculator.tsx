'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalculatorState, MarketEstimateResponse, ZipTopTierValueResponse } from '@/lib/types';
import {
  calculateAutoPmiMonthly,
  calculateSectionTotals,
  getDownPaymentPercent,
  getLoanAmount,
} from '@/lib/calculations';
import { formatCurrencyWhole, isValidZip } from '@/lib/format';
import MortgageSection from './sections/MortgageSection';
import TaxesInsuranceSection from './sections/TaxesInsuranceSection';
import UtilitiesSection from './sections/UtilitiesSection';
import MaintenanceSection from './sections/MaintenanceSection';
import RepairsSection from './sections/RepairsSection';
import SummarySection from './sections/SummarySection';
import TierGroup from './TierGroup';

const initialState: CalculatorState = {
  zip: '',
  isLuxuryMode: false,
  luxuryThresholdSource: null,
  marketEstimateFailed: false,
  mortgage: {
    purchasePrice: 400000,
    downPaymentMode: 'percent',
    downPaymentDollar: 40000,
    downPaymentPercent: 10,
    interestRate: 6.5,
    loanTerm: 30,
    pmiEnabled: true,
    pmiMonthly: 150,
    pmiManualOverride: false,
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
    poolSpa: 0,
    landscapingCrew: 0,
    housekeeping: 0,
    security: 0,
  },
  maintenance: {
    squareFootage: 1800,
  },
  repairs: {
    roof: { ageYears: 10 },
    hvac: { ageYears: 8 },
    waterHeater: { ageYears: 5 },
    startingCashReserve: 0,
    dedicatedCreditLine: 0,
  },
};

interface MarketEstimateState extends MarketEstimateResponse {
  zip: string;
}

interface ZipTopTierState {
  zip: string;
  value: number | null;
}

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const prevPmiApplicable = useRef<boolean | null>(null);
  const [marketEstimate, setMarketEstimate] = useState<MarketEstimateState | null>(null);
  const [zipTopTier, setZipTopTier] = useState<ZipTopTierState | null>(null);
  const fetchedZips = useRef<Set<string>>(new Set());

  const downPaymentPercent = getDownPaymentPercent(state);
  const pmiApplicable = downPaymentPercent < 20;

  async function fetchMarketEstimate(zip: string): Promise<MarketEstimateResponse | null> {
    const res = await fetch('/api/estimate-market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip }),
    });
    if (!res.ok) return null;
    return (await res.json()) as MarketEstimateResponse;
  }

  async function fetchZipTopTierValue(zip: string): Promise<ZipTopTierValueResponse | null> {
    try {
      const res = await fetch('/api/zip-top-tier-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip }),
      });
      if (!res.ok) return null;
      return (await res.json()) as ZipTopTierValueResponse;
    } catch {
      return null;
    }
  }

  async function handleZipBlur(zip: string) {
    if (!isValidZip(zip) || fetchedZips.current.has(zip)) return;
    fetchedZips.current.add(zip);

    const topTierData = await fetchZipTopTierValue(zip);
    setZipTopTier({ zip, value: topTierData?.value ?? null });

    // The AI county-median estimate is still needed for the HOA range (unaffected by this fix)
    // and as the luxury-threshold fallback for ZIPs Zillow doesn't cover.
    let data: MarketEstimateResponse | null = null;
    try {
      data = await fetchMarketEstimate(zip);
    } catch {
      // First attempt failed — fall through to a single retry below.
    }
    if (!data) {
      try {
        data = await fetchMarketEstimate(zip);
      } catch {
        // Retry also failed — surfaced via marketEstimateFailed below.
      }
    }
    if (data) {
      setMarketEstimate({ zip, ...data });
      setState((s) => (s.marketEstimateFailed ? { ...s, marketEstimateFailed: false } : s));
    } else {
      setState((s) => ({ ...s, marketEstimateFailed: true }));
    }
  }

  const zipTopTierValue = zipTopTier && zipTopTier.zip === state.zip ? zipTopTier.value : null;

  const isLuxuryMode =
    zipTopTierValue !== null
      ? state.mortgage.purchasePrice >= zipTopTierValue
      : !!marketEstimate &&
        marketEstimate.zip === state.zip &&
        state.mortgage.purchasePrice >= marketEstimate.countyMedianPrice * 2;

  const luxuryThresholdSource: CalculatorState['luxuryThresholdSource'] =
    zipTopTierValue !== null ? 'zillow' : marketEstimate && marketEstimate.zip === state.zip ? 'ai-estimate' : null;

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

  useEffect(() => {
    setState((s) =>
      s.isLuxuryMode === isLuxuryMode && s.luxuryThresholdSource === luxuryThresholdSource
        ? s
        : { ...s, isLuxuryMode, luxuryThresholdSource }
    );
  }, [isLuxuryMode, luxuryThresholdSource]);

  const loanAmount = getLoanAmount(state);

  useEffect(() => {
    if (state.mortgage.pmiManualOverride) return;
    const autoPmi = calculateAutoPmiMonthly(loanAmount, downPaymentPercent);
    if (autoPmi !== state.mortgage.pmiMonthly) {
      setState((s) => ({ ...s, mortgage: { ...s.mortgage, pmiMonthly: autoPmi } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanAmount, downPaymentPercent, state.mortgage.pmiManualOverride]);

  const totals = useMemo(() => calculateSectionTotals(state), [state]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <TierGroup
        eyebrow="Tier 1"
        title="The House Payment"
        intro={<p>Together, these make up the house payment, the figure lenders use to calculate your debt-to-income (DTI) ratio.</p>}
      >
        <MortgageSection
          value={state.mortgage}
          onChange={(patch) => setState((s) => ({ ...s, mortgage: { ...s.mortgage, ...patch } }))}
          loanAmount={loanAmount}
          monthlyMortgage={totals.mortgageMonthly}
          pmiApplicable={pmiApplicable}
          zip={state.zip}
          onZipChange={(zip) => setState((s) => ({ ...s, zip }))}
          onZipBlur={handleZipBlur}
          marketEstimateFailed={state.marketEstimateFailed}
        />
        <TaxesInsuranceSection
          value={state.taxesInsurance}
          onChange={(patch) => setState((s) => ({ ...s, taxesInsurance: { ...s.taxesInsurance, ...patch } }))}
          monthlyPropertyTax={totals.propertyTaxMonthly}
          monthlyInsurance={totals.homeownersInsuranceMonthly}
          monthlyTotal={totals.taxesInsuranceMonthly}
          isLuxuryMode={isLuxuryMode}
          luxuryThresholdSource={luxuryThresholdSource}
          hoaRange={hoaRange}
        />
        <p className="text-sm text-neutral-600 leading-relaxed border-t border-navy/10 pt-4">
          P&amp;I, taxes, insurance, and any HOA dues together make up your house payment, the figure lenders use
          to calculate your debt-to-income ratio. The tiers below add the additional monthly costs of owning
          this home beyond what a lender requires you to disclose upfront.
        </p>
      </TierGroup>

      <TierGroup
        eyebrow="Tier 2"
        title="Home Operating Costs"
        intro={
          <p>
            The ongoing costs of running the home day to day, power, gas, water, trash, and internet, plus
            anything else that keeps the property running month to month.
          </p>
        }
      >
        <UtilitiesSection
          zip={state.zip}
          value={state.utilities}
          onChange={(patch) => setState((s) => ({ ...s, utilities: { ...s.utilities, ...patch } }))}
          monthlyTotal={totals.utilitiesMonthly}
          isLuxuryMode={isLuxuryMode}
        />
      </TierGroup>

      <TierGroup
        eyebrow="Tier 3"
        title="Owner's Reserve"
        intro={
          <p>
            Think of this like paying yourself HOA dues: money set aside now so it&apos;s there when a big home
            expense eventually comes up, instead of being a surprise.
          </p>
        }
      >
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
          isLuxuryMode={isLuxuryMode}
          reserveOffsetAppliedSystems={totals.reserveOffsetAppliedSystems}
        />
      </TierGroup>

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
