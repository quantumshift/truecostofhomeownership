'use client';

import { useState } from 'react';
import { UtilitiesInputs, UtilityEstimateResponse, UtilityFieldState } from '@/lib/types';
import { formatCurrencyWhole, isValidZip } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import CurrencyInput from '../ui/CurrencyInput';
import AiBadge from '../ui/AiBadge';

interface UtilitiesSectionProps {
  value: UtilitiesInputs;
  onChange: (patch: Partial<UtilitiesInputs>) => void;
  monthlyTotal: number;
}

export default function UtilitiesSection({ value, onChange, monthlyTotal }: UtilitiesSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof UtilitiesInputs, patch: Partial<UtilityFieldState>) {
    const current = value[key] as UtilityFieldState;
    onChange({ [key]: { ...current, ...patch } } as Partial<UtilitiesInputs>);
  }

  async function handleEstimate() {
    if (!isValidZip(value.zip)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/estimate-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip: value.zip }),
      });
      if (!res.ok) {
        throw new Error('estimate failed');
      }
      const data: UtilityEstimateResponse = await res.json();
      onChange({
        electricitySummer: { value: data.electricitySummer, isAiEstimate: true },
        electricityWinter: { value: data.electricityWinter, isAiEstimate: true },
        gasSummer: { value: data.gasSummer, isAiEstimate: true },
        gasWinter: { value: data.gasWinter, isAiEstimate: true },
        waterSewer: { value: data.waterSewer, isAiEstimate: true },
        trash: { value: data.trash, isAiEstimate: true },
      });
    } catch {
      setError("Couldn't get an estimate for that ZIP right now — go ahead and enter your own numbers below.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CollapsibleSection
      id="utilities"
      title="Utilities"
      subtitle="Power, gas, water, trash, internet"
      monthlyTotal={formatCurrencyWhole(monthlyTotal)}
    >
      <div className="rounded-md bg-neutral-50 border border-neutral-200 p-4 mb-6">
        <p className="text-sm font-medium text-neutral-800 mb-2">
          Not sure what utilities run in this area? Enter a ZIP code and we&apos;ll fill in a rough starting point.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="ZIP code"
            value={value.zip}
            onChange={(e) => onChange({ zip: e.target.value.replace(/[^0-9]/g, '').slice(0, 5) })}
            className="w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light"
            aria-label="ZIP code"
          />
          <button
            type="button"
            onClick={handleEstimate}
            disabled={!isValidZip(value.zip) || loading}
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Estimating…' : 'Estimate costs for this ZIP'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <p className="text-xs text-neutral-500 mt-3">
          Rough estimate only. This is an AI-generated approximation based on general regional knowledge — not
          live utility rates. Always verify with actual bills from the seller or local utility providers before
          relying on these numbers.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow
          label="Electricity — Summer average"
          htmlFor="electricitySummer"
          badge={value.electricitySummer.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="electricitySummer"
            value={value.electricitySummer.value}
            onChange={(v) => updateField('electricitySummer', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow
          label="Electricity — Winter average"
          htmlFor="electricityWinter"
          badge={value.electricityWinter.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="electricityWinter"
            value={value.electricityWinter.value}
            onChange={(v) => updateField('electricityWinter', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow
          label="Gas / Heating — Summer average"
          htmlFor="gasSummer"
          badge={value.gasSummer.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="gasSummer"
            value={value.gasSummer.value}
            onChange={(v) => updateField('gasSummer', { value: v, isAiEstimate: false })}
          />
        </FieldRow>

        <FieldRow
          label="Gas / Heating — Winter average"
          htmlFor="gasWinter"
          badge={value.gasWinter.isAiEstimate ? <AiBadge /> : undefined}
        >
          <CurrencyInput
            id="gasWinter"
            value={value.gasWinter.value}
            onChange={(v) => updateField('gasWinter', { value: v, isAiEstimate: false })}
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
    </CollapsibleSection>
  );
}
