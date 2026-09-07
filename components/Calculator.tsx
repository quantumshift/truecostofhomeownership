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
import TierGroup from './TierGroup';
import EducationBubble from './ui/EducationBubble';

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
      <TierGroup
        eyebrow="Tier 1"
        title="PITI"
        intro={
          <p>
            You may already know this term from elsewhere in the homebuying process: PITI stands for{' '}
            <strong>P</strong>rincipal, <strong>I</strong>nterest, <strong>T</strong>axes, and <strong>I</strong>
            nsurance — the four pieces that make up what most lenders and pre-approval letters call your
            &quot;monthly payment.&quot;
          </p>
        }
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
        <EducationBubble>
          <p>
            PITI is what most pre-approval letters, listing search filters, and lender conversations mean by
            &quot;monthly payment.&quot; For many buyers, it&apos;s the only number they see before making an
            offer — everything below adds the rest of what it actually costs to hold onto the home.
          </p>
        </EducationBubble>
      </TierGroup>

      <TierGroup
        eyebrow="Tier 2"
        title="Home Operating Costs"
        intro={
          <p>
            Beyond the mortgage, a home has its own ongoing operating costs — power, gas, water, trash, and
            internet — that show up every month whether or not they were part of the original budget.
          </p>
        }
      >
        <UtilitiesSection
          zip={state.zip}
          value={state.utilities}
          onChange={(patch) => setState((s) => ({ ...s, utilities: { ...s.utilities, ...patch } }))}
          monthlyTotal={totals.utilitiesMonthly}
        />
        <EducationBubble>
          <p>
            These costs don&apos;t appear on a pre-approval letter or a listing price — they start the month you
            move in, and they&apos;re yours to pay for as long as you own the home.
          </p>
        </EducationBubble>
      </TierGroup>

      <TierGroup
        eyebrow="Tier 3"
        title="Owner's Reserve"
        intro={
          <>
            <p>
              Think of this like paying yourself HOA dues — money set aside now so it&apos;s there when a big
              home expense eventually comes up, instead of being a surprise.
            </p>
            <p>
              You don&apos;t have to set money aside for this — most homeowners don&apos;t. But when you do,
              you&apos;ll be ready when the day comes, and there&apos;s real peace of mind in knowing it&apos;s
              already covered.
            </p>
          </>
        }
      >
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
        <EducationBubble>
          <p>
            This category doesn&apos;t usually come up in the homebuying process — it&apos;s not part of a
            pre-approval letter, a listing price, or a typical closing conversation — but it belongs on the table
            just as much as anything else here.
          </p>
          <p>
            Setting money aside for it is entirely optional. Plenty of homeowners don&apos;t. When a major repair
            comes up without a reserve in place, the common alternatives are a credit card with enough room on
            it, a family member with savings available, or a loan against home equity. Those are real options
            too — now you know the size of what you&apos;d be covering, whichever way you choose to handle it.
          </p>
        </EducationBubble>
        <p className="text-sm text-neutral-600 leading-relaxed border-t border-navy/10 pt-4">
          Not sure if this reserve estimate fits your situation? It&apos;s worth running past your financial
          advisor — they can tell you whether it&apos;s too high or too low for your specific plans.
        </p>
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
