'use client';

import { LUXURY_SYSTEM_REFERENCE_DATA, RepairsInputs, SYSTEM_REFERENCE_DATA } from '@/lib/types';
import { formatCurrency, formatCurrencyWhole } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import NumberInput from '../ui/NumberInput';
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
}

export default function RepairsSection({
  value,
  onChange,
  roofReserve,
  hvacReserve,
  waterHeaterReserve,
  monthlyTotal,
  isLuxuryMode,
}: RepairsSectionProps) {
  const reserves = { roof: roofReserve, hvac: hvacReserve, waterHeater: waterHeaterReserve };
  const referenceData = isLuxuryMode ? LUXURY_SYSTEM_REFERENCE_DATA : SYSTEM_REFERENCE_DATA;
  const systems = [
    { key: 'roof' as const, ...referenceData.roof },
    { key: 'hvac' as const, ...referenceData.hvac },
    { key: 'waterHeater' as const, ...referenceData.waterHeater },
  ];

  return (
    <CollapsibleSection
      id="repairs"
      title="System Replacements"
      subtitle="Roofs, HVAC systems, and water heaters don't last forever. They're the big-ticket items most buyers don't budget for."
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">System</th>
              <th className="py-2 pr-3 font-medium">Age (years)</th>
              <th className="py-2 pr-3 font-medium">Typical lifespan</th>
              <th className="py-2 pr-3 font-medium">
                {isLuxuryMode ? 'Luxury-tier median replacement cost' : 'Median replacement cost'}
              </th>
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
                <td className="py-3 pr-1 text-right font-semibold text-navy tabular-nums">
                  {formatCurrency(reserves[system.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTotalRow label="Total Monthly System Replacement Reserve" amount={monthlyTotal} />

      <EducationBubble>
        <p>
          Costs vary by region, coastal and West Coast markets often run higher due to labor and codes, so a
          local quote beats a national average. A system past its typical lifespan is treated as due within a
          year. This reserve isn&apos;t part of a pre-approval letter or closing conversation, but it&apos;s a
          real cost. Building it is optional, common alternatives without one include a credit card, family
          support, or a home equity loan. Worth checking this estimate against your financial advisor&apos;s
          take.
        </p>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200">
                <th className="py-2 pr-3 font-medium">System</th>
                <th className="py-2 pr-3 font-medium">Typical lifespan</th>
                <th className="py-2 pr-3 font-medium">National median cost</th>
                <th className="py-2 pr-1 font-medium">Luxury-tier median cost</th>
              </tr>
            </thead>
            <tbody>
              {(['roof', 'hvac', 'waterHeater'] as const).map((key) => (
                <tr key={key} className="border-b border-neutral-100 last:border-0">
                  <td className="py-3 pr-3 font-medium text-neutral-800">{SYSTEM_REFERENCE_DATA[key].label}</td>
                  <td className="py-3 pr-3 text-neutral-600">{SYSTEM_REFERENCE_DATA[key].lifespan} years</td>
                  <td className="py-3 pr-3 text-neutral-600 tabular-nums">
                    {formatCurrencyWhole(SYSTEM_REFERENCE_DATA[key].cost)}
                  </td>
                  <td className="py-3 pr-1 text-neutral-600 tabular-nums">
                    {formatCurrencyWhole(LUXURY_SYSTEM_REFERENCE_DATA[key].cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
