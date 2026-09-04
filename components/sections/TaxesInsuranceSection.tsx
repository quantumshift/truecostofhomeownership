'use client';

import { TaxesInsuranceInputs } from '@/lib/types';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import CurrencyInput from '../ui/CurrencyInput';
import ToggleGroup from '../ui/ToggleGroup';
import ReadOnlyCurrency from '../ui/ReadOnlyCurrency';
import SectionTotalRow from '../ui/SectionTotalRow';

interface TaxesInsuranceSectionProps {
  value: TaxesInsuranceInputs;
  onChange: (patch: Partial<TaxesInsuranceInputs>) => void;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyTotal: number;
}

export default function TaxesInsuranceSection({
  value,
  onChange,
  monthlyPropertyTax,
  monthlyInsurance,
  monthlyTotal,
}: TaxesInsuranceSectionProps) {
  function handleInsuranceModeChange(mode: 'annual' | 'monthly') {
    if (mode === value.insuranceMode) return;
    if (mode === 'monthly') {
      onChange({ insuranceMode: 'monthly', homeownersInsuranceMonthly: round2(value.homeownersInsuranceAnnual / 12) });
    } else {
      onChange({ insuranceMode: 'annual', homeownersInsuranceAnnual: Math.round(value.homeownersInsuranceMonthly * 12) });
    }
  }

  return (
    <CollapsibleSection
      id="taxes-insurance"
      title="Property Taxes & Insurance"
      subtitle="What the county and your insurer expect"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow label="Annual Property Tax" htmlFor="annualPropertyTax">
          <CurrencyInput
            id="annualPropertyTax"
            value={value.annualPropertyTax}
            onChange={(v) => onChange({ annualPropertyTax: v })}
          />
        </FieldRow>

        <FieldRow
          label="Monthly Property Tax"
          htmlFor="monthlyPropertyTax"
          hint="Auto-calculated from the annual figure"
        >
          <ReadOnlyCurrency id="monthlyPropertyTax" value={monthlyPropertyTax} />
        </FieldRow>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-neutral-700">Homeowners Insurance</label>
            <ToggleGroup
              ariaLabel="Insurance input mode"
              value={value.insuranceMode}
              onChange={handleInsuranceModeChange}
              options={[
                { value: 'annual', label: 'Annual' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </div>
          {value.insuranceMode === 'annual' ? (
            <CurrencyInput
              id="homeownersInsuranceAnnual"
              value={value.homeownersInsuranceAnnual}
              onChange={(v) => onChange({ homeownersInsuranceAnnual: v })}
            />
          ) : (
            <CurrencyInput
              id="homeownersInsuranceMonthly"
              value={value.homeownersInsuranceMonthly}
              onChange={(v) => onChange({ homeownersInsuranceMonthly: v })}
            />
          )}
        </div>

        <FieldRow
          label="Monthly Homeowners Insurance"
          htmlFor="monthlyInsuranceCalc"
          hint="This is the number that feeds your total"
        >
          <ReadOnlyCurrency id="monthlyInsuranceCalc" value={monthlyInsurance} />
        </FieldRow>

        <FieldRow label="HOA Fees (monthly)" htmlFor="hoaMonthly" hint="Enter 0 if there's no HOA">
          <CurrencyInput id="hoaMonthly" value={value.hoaMonthly} onChange={(v) => onChange({ hoaMonthly: v })} />
        </FieldRow>
      </div>

      <SectionTotalRow label="Total Monthly Taxes & Insurance" amount={monthlyTotal} />
    </CollapsibleSection>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
