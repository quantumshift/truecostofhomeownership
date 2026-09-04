'use client';

import { useState } from 'react';
import { UtilitiesInputs, UtilityEstimateResponse, UtilityFieldState } from '@/lib/types';
import { isValidZip } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import CurrencyInput from '../ui/CurrencyInput';
import AiBadge from '../ui/AiBadge';
import SectionTotalRow from '../ui/SectionTotalRow';

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
        electricity: { value: data.electricity, isAiEstimate: true },
        gas: { value: data.gas, isAiEstimate: true },
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
    <CollapsibleSection id="utilities" title="Utilities" subtitle="Power, gas, water, trash, internet">
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
          Rough estimate only, built from general regional knowledge (climate, typical rates for that area) — not
          a live utility-rate lookup. A house that&apos;s bigger, older, or less insulated than average will run
          higher than this; a newer, well-insulated one will often run lower. Always compare against actual bills
          from the seller or local utility providers before relying on these numbers.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow
          label="Electricity — Monthly Average"
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
          label="Gas / Heating — Monthly Average"
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

      <SectionTotalRow label="Total Monthly Utilities" amount={monthlyTotal} />
    </CollapsibleSection>
  );
}
