'use client';

import { useState } from 'react';
import { UtilitiesInputs, UtilityEstimateResponse, UtilityFieldState } from '@/lib/types';
import { isValidZip } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import CurrencyInput from '../ui/CurrencyInput';
import AiBadge from '../ui/AiBadge';
import SectionTotalRow from '../ui/SectionTotalRow';
import EducationBubble from '../ui/EducationBubble';

interface UtilitiesSectionProps {
  zip: string;
  value: UtilitiesInputs;
  onChange: (patch: Partial<UtilitiesInputs>) => void;
  monthlyTotal: number;
  isLuxuryMode: boolean;
}

export default function UtilitiesSection({
  zip,
  value,
  onChange,
  monthlyTotal,
  isLuxuryMode,
}: UtilitiesSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof UtilitiesInputs, patch: Partial<UtilityFieldState>) {
    const current = value[key] as UtilityFieldState;
    onChange({ [key]: { ...current, ...patch } } as Partial<UtilitiesInputs>);
  }

  async function handleEstimate() {
    if (!isValidZip(zip)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/estimate-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip }),
      });
      if (!res.ok) {
        throw new Error('estimate failed');
      }
      const data: UtilityEstimateResponse = await res.json();
      onChange({
        electricity: { value: data.electricity, isAiEstimate: true },
        gas: { value: data.gas, isAiEstimate: true },
        waterSewer: { value: data.waterSewer, isAiEstimate: true },
        trash: { value: data.trash, isAiEstimate: true },
      });
    } catch {
      setError("Couldn't get an estimate for that ZIP right now. Go ahead and enter your own numbers below.");
    } finally {
      setLoading(false);
    }
  }

  const hasEstimate =
    value.electricity.isAiEstimate ||
    value.gas.isAiEstimate ||
    value.waterSewer.isAiEstimate ||
    value.trash.isAiEstimate;

  return (
    <CollapsibleSection id="utilities" title="Monthly Operating Costs">
      <div className="rounded-md bg-neutral-50 border border-neutral-200 p-4 mb-6">
        <p className="text-sm font-medium text-neutral-800 mb-2">
          {hasEstimate
            ? "These numbers are already averages for the ZIP code you entered. Feel free to adjust any of them. We encourage it, since actual costs vary from home to home."
            : "We'll estimate typical utility costs using the ZIP code you entered above."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEstimate}
            disabled={!isValidZip(zip) || loading}
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Estimating…' : 'Estimate costs for this ZIP'}
          </button>
          {!isValidZip(zip) && (
            <span className="text-xs text-neutral-500">
              Enter a ZIP code in Mortgage above to enable this.
            </span>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow
          label="Electricity: Monthly Average"
          htmlFor="electricity"
          badge={value.electricity.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="electricity"
            value={value.electricity.value}
            onChange={(v) => updateField('electricity', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow
          label="Gas / Heating: Monthly Average"
          htmlFor="gas"
          badge={value.gas.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="gas"
            value={value.gas.value}
            onChange={(v) => updateField('gas', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow
          label="Water & Sewer"
          htmlFor="waterSewer"
          badge={value.waterSewer.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="waterSewer"
            value={value.waterSewer.value}
            onChange={(v) => updateField('waterSewer', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow label="Trash / Recycling" htmlFor="trash" badge={value.trash.isAiEstimate ? <AiBadge /> : undefined}>
          <CurrencyInput
            id="trash"
            value={value.trash.value}
            onChange={(v) => updateField('trash', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow label="Internet / Cable" htmlFor="internet">
          <CurrencyInput
            id="internet"
            value={value.internet.value}
            onChange={(v) => updateField('internet', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow label="Other (pool, security, gardening…)" htmlFor="other">
          <CurrencyInput
            id="other"
            value={value.other.value}
            onChange={(v) => updateField('other', { value: v, isAiEstimate: false })}
          />
        </FieldRow>
      </div>

      {isLuxuryMode && (
        <div className="mt-6 pt-5 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            Homes in this price range for the area often carry some additional recurring bills. Add any that
            apply, and leave any that don&apos;t at $0.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldRow label="Pool / Spa Maintenance" htmlFor="poolSpa">
              <CurrencyInput
                id="poolSpa"
                value={value.poolSpa}
                onChange={(v) => onChange({ poolSpa: v })}
              />
            </FieldRow>
            <FieldRow label="Landscaping Crew" htmlFor="landscapingCrew" hint="Regular service, beyond basic lawn care">
              <CurrencyInput
                id="landscapingCrew"
                value={value.landscapingCrew}
                onChange={(v) => onChange({ landscapingCrew: v })}
              />
            </FieldRow>
            <FieldRow label="Housekeeping / Property Staff" htmlFor="housekeeping">
              <CurrencyInput
                id="housekeeping"
                value={value.housekeeping}
                onChange={(v) => onChange({ housekeeping: v })}
              />
            </FieldRow>
            <FieldRow label="Security System / Monitoring" htmlFor="security">
              <CurrencyInput
                id="security"
                value={value.security}
                onChange={(v) => onChange({ security: v })}
              />
            </FieldRow>
          </div>
        </div>
      )}

      <SectionTotalRow label="Total Monthly Operating Costs" amount={monthlyTotal} />

      <EducationBubble>
        <p>
          Utility costs vary with home size, age, insulation quality, and climate. This estimate is built from
          general regional data, not live utility rates, compare it against actual bills from the seller or
          local utility provider before relying on it. These costs begin the month you take ownership and
          continue for as long as you hold the property.
        </p>
      </EducationBubble>
    </CollapsibleSection>
  );
}
