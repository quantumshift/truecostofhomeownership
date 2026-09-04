'use client';

import { MortgageInputs, LoanTerm } from '@/lib/types';
import { formatCurrencyWhole } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import CurrencyInput from '../ui/CurrencyInput';
import NumberInput from '../ui/NumberInput';
import ToggleGroup from '../ui/ToggleGroup';
import ReadOnlyCurrency from '../ui/ReadOnlyCurrency';
import SectionTotalRow from '../ui/SectionTotalRow';

interface MortgageSectionProps {
  value: MortgageInputs;
  onChange: (patch: Partial<MortgageInputs>) => void;
  loanAmount: number;
  monthlyMortgage: number;
  pmiApplicable: boolean;
}

export default function MortgageSection({
  value,
  onChange,
  loanAmount,
  monthlyMortgage,
  pmiApplicable,
}: MortgageSectionProps) {
  function handleDownPaymentModeChange(mode: 'dollar' | 'percent') {
    if (mode === value.downPaymentMode) return;
    if (mode === 'percent') {
      const percent = value.purchasePrice > 0 ? (value.downPaymentDollar / value.purchasePrice) * 100 : 0;
      onChange({ downPaymentMode: 'percent', downPaymentPercent: round2(percent) });
    } else {
      const dollar = (value.purchasePrice * value.downPaymentPercent) / 100;
      onChange({ downPaymentMode: 'dollar', downPaymentDollar: Math.round(dollar) });
    }
  }

  function handlePurchasePriceChange(price: number) {
    if (value.downPaymentMode === 'percent') {
      onChange({ purchasePrice: price });
    } else {
      onChange({ purchasePrice: price });
    }
  }

  const downPaymentPercentEffective =
    value.downPaymentMode === 'percent'
      ? value.downPaymentPercent
      : value.purchasePrice > 0
        ? (value.downPaymentDollar / value.purchasePrice) * 100
        : 0;

  function handlePmiToggle(checked: boolean) {
    onChange({ pmiEnabled: checked });
  }

  return (
    <CollapsibleSection id="mortgage" title="Mortgage & Financing" subtitle="Your loan payment">
      <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
        This is principal and interest, calculated from the loan amount, rate, and term you enter below — usually
        the single biggest piece of your monthly cost, and the one most people already have a decent handle on
        before they start shopping. If you&apos;re putting down less than 20%, lenders typically require PMI
        (private mortgage insurance) until you build enough equity, which we&apos;ve factored in separately here.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow label="Purchase Price" htmlFor="purchasePrice">
          <CurrencyInput
            id="purchasePrice"
            value={value.purchasePrice}
            onChange={handlePurchasePriceChange}
          />
        </FieldRow>

        <FieldRow label="Interest Rate" htmlFor="interestRate">
          <NumberInput
            id="interestRate"
            value={value.interestRate}
            onChange={(v) => onChange({ interestRate: v })}
            decimals={3}
            suffix="%"
          />
        </FieldRow>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-neutral-700">Down Payment</label>
            <ToggleGroup
              ariaLabel="Down payment mode"
              value={value.downPaymentMode}
              onChange={handleDownPaymentModeChange}
              options={[
                { value: 'dollar', label: '$' },
                { value: 'percent', label: '%' },
              ]}
            />
          </div>
          {value.downPaymentMode === 'dollar' ? (
            <CurrencyInput
              id="downPaymentDollar"
              value={value.downPaymentDollar}
              onChange={(v) => onChange({ downPaymentDollar: v })}
            />
          ) : (
            <NumberInput
              id="downPaymentPercent"
              value={value.downPaymentPercent}
              onChange={(v) => onChange({ downPaymentPercent: v })}
              decimals={2}
              suffix="%"
              max={100}
            />
          )}
          <p className="text-xs text-neutral-500 mt-1">
            {value.downPaymentMode === 'dollar'
              ? `≈ ${downPaymentPercentEffective.toFixed(1)}% of purchase price`
              : `≈ ${formatCurrencyWhole((value.purchasePrice * value.downPaymentPercent) / 100)}`}
          </p>
        </div>

        <FieldRow label="Loan Term" htmlFor="loanTerm">
          <select
            id="loanTerm"
            value={value.loanTerm}
            onChange={(e) => onChange({ loanTerm: Number(e.target.value) as LoanTerm })}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light bg-white"
          >
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
            <option value={30}>30 years</option>
          </select>
        </FieldRow>

        <FieldRow label="Loan Amount" htmlFor="loanAmount" hint="Purchase price minus down payment">
          <ReadOnlyCurrency id="loanAmount" value={loanAmount} />
        </FieldRow>

        {pmiApplicable && (
          <>
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={value.pmiEnabled}
                  onChange={(e) => handlePmiToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-navy focus:ring-navy-light"
                />
                Private Mortgage Insurance (PMI)
              </label>
              <p className="text-xs text-neutral-500 mt-1 ml-6">
                Turned on automatically since your down payment is under 20% — uncheck it if yours doesn&apos;t apply.
              </p>
            </div>

            {value.pmiEnabled && (
              <FieldRow label="Monthly PMI" htmlFor="pmiMonthly" hint="Enter your own estimate or lender quote">
                <CurrencyInput
                  id="pmiMonthly"
                  value={value.pmiMonthly}
                  onChange={(v) => onChange({ pmiMonthly: v })}
                />
              </FieldRow>
            )}
          </>
        )}
      </div>

      <SectionTotalRow label="Total Monthly Mortgage" amount={monthlyMortgage} />
    </CollapsibleSection>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
