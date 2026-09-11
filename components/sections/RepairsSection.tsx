'use client';

import { LUXURY_SYSTEM_REFERENCE_DATA, RepairsInputs, SYSTEM_REFERENCE_DATA } from '@/lib/types';
import { formatCurrency, formatCurrencyWhole, formatReserveOffsetSentence } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import NumberInput from '../ui/NumberInput';
import CurrencyInput from '../ui/CurrencyInput';
import FieldRow from '../ui/FieldRow';
import SectionTotalRow from '../ui/SectionTotalRow';
import EducationBubble from '../ui/EducationBubble';

interface RepairsSectionProps {
  value: RepairsInputs;
  onChange: (patch: Partial<RepairsInputs>) => void;
  roofReserve: number;
  hvacReserve: number;
  waterHeaterReserve: number;
  monthlyTotal: number;
  isLuxuryMode: boolean;
  reserveOffsetAppliedSystems: string[];
}

export default function RepairsSection({
  value,
  onChange,
  roofReserve,
  hvacReserve,
  waterHeaterReserve,
  monthlyTotal,
  isLuxuryMode,
  reserveOffsetAppliedSystems,
}: RepairsSectionProps) {
  const reserves = { roof: roofReserve, hvac: hvacReserve, waterHeater: waterHeaterReserve };
  const offsetSentence = formatReserveOffsetSentence(
    value.startingCashReserve,
    value.dedicatedCreditLine,
    reserveOffsetAppliedSystems,
  );
  const systems = [
    { key: 'roof' as const, ...SYSTEM_REFERENCE_DATA.roof, luxuryCost: LUXURY_SYSTEM_REFERENCE_DATA.roof.cost },
    { key: 'hvac' as const, ...SYSTEM_REFERENCE_DATA.hvac, luxuryCost: LUXURY_SYSTEM_REFERENCE_DATA.hvac.cost },
    {
      key: 'waterHeater' as const,
      ...SYSTEM_REFERENCE_DATA.waterHeater,
      luxuryCost: LUXURY_SYSTEM_REFERENCE_DATA.waterHeater.cost,
    },
  ];

  return (
    <CollapsibleSection
      id="repairs"
      title="System Replacements"
      subtitle="A monthly reserve based on how old each system is."
    >
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Reserve Offset</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldRow
            label="Starting Cash Reserve"
            htmlFor="startingCashReserve"
            hint="If you're starting with money already set aside for repairs and replacements, enter it here."
          >
            <CurrencyInput
              id="startingCashReserve"
              value={value.startingCashReserve}
              onChange={(v) => onChange({ startingCashReserve: v })}
            />
          </FieldRow>
          <FieldRow
            label="Dedicated Credit Line"
            htmlFor="dedicatedCreditLine"
            hint="A credit line reserved only for system repairs and replacements, not other spending. This is borrowing capacity, not savings, using it creates a balance you'd need to repay with interest."
          >
            <CurrencyInput
              id="dedicatedCreditLine"
              value={value.dedicatedCreditLine}
              onChange={(v) => onChange({ dedicatedCreditLine: v })}
            />
          </FieldRow>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className={`w-full text-sm border-collapse ${isLuxuryMode ? 'min-w-[680px]' : 'min-w-[560px]'}`}>
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">System</th>
              <th className="py-2 pr-3 font-medium">Age (years)</th>
              <th className="py-2 pr-3 font-medium">Typical lifespan</th>
              <th className="py-2 pr-3 font-medium">Median replacement cost</th>
              {isLuxuryMode && <th className="py-2 pr-3 font-medium">Luxury-tier median cost</th>}
              <th className="py-2 pr-1 font-medium text-right">Monthly reserve</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system) => (
              <tr key={system.key} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 pr-3 font-medium text-neutral-800">{system.label}</td>
                <td className="py-3 pr-3 w-28">
                  <NumberInput
                    id={`${system.key}Age`}
                    value={value[system.key].ageYears}
                    onChange={(v) => onChange({ [system.key]: { ageYears: v } } as Partial<RepairsInputs>)}
                    suffix="yrs"
                  />
                </td>
                <td className="py-3 pr-3 text-neutral-500">{system.lifespan} years</td>
                <td className="py-3 pr-3 text-neutral-500">{formatCurrencyWhole(system.cost)}</td>
                {isLuxuryMode && (
                  <td className="py-3 pr-3 text-neutral-500">{formatCurrencyWhole(system.luxuryCost)}</td>
                )}
                <td className="py-3 pr-1 text-right font-semibold text-navy tabular-nums">
                  {formatCurrency(reserves[system.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTotalRow label="Total Monthly System Replacement Reserve" amount={monthlyTotal} />

      {offsetSentence && <p className="text-xs text-neutral-500 mt-1.5">{offsetSentence}</p>}

      <EducationBubble>
        <p>
          Replacement costs vary by region: coastal and West Coast markets often exceed the rural Midwest or
          Southeast due to labor rates and building codes, so a local contractor quote will be more accurate than
          any national figure. A system already past its typical lifespan is treated as due within the next
          year. This reserve is not part of a pre-approval letter or closing disclosure, but it&apos;s a real,
          recurring cost of ownership. Building it is optional, common alternatives without one include a credit
          card, a family loan, or borrowing against home equity. It&apos;s worth reviewing this estimate with a
          financial advisor to confirm it fits your specific plans.
        </p>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Roof cost is based on{' '}
          <a
            href="https://www.angi.com/articles/architectural-shingles-cost.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-light"
          >
            Angi&apos;s 2026 cost data
          </a>{' '}
          for architectural shingle roof replacement. HVAC cost is based on 2026 data from{' '}
          <a
            href="https://www.angi.com/articles/insider-s-price-guide-new-heating-and-cooling-system.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-light"
          >
            Angi
          </a>{' '}
          and{' '}
          <a
            href="https://pearlscore.com/news/average-hvac-replacement-cost"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-light"
          >
            Pearl
          </a>
          , reflecting a full system replacement rather than a single component. Water heater cost is based on
          2026 data from Angi, HomeAdvisor, and{' '}
          <a
            href="https://www.homewyse.com/services/cost_to_replace_hot_water_heater.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-light"
          >
            Homewyse
          </a>{' '}
          for a standard tank-style unit, not tankless.
        </p>
        <p className="text-xs text-neutral-500">
          Luxury-tier figures are based on research across three luxury real estate markets: King County, WA;
          Los Angeles County, CA; and the Hamptons, NY.
        </p>
      </EducationBubble>
    </CollapsibleSection>
  );
}
