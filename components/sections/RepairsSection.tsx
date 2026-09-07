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
      title="Repairs & System Replacements"
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

      <SectionTotalRow label="Total Monthly Repairs Reserve" amount={monthlyTotal} />

      <EducationBubble>
        <p>
          Replacement costs vary by region. Coastal and West Coast markets often run higher than the rural
          Midwest or Southeast due to labor rates and local codes, so a local contractor quote will always beat a
          national average for a specific property. When a system is already past its typical lifespan, we treat
          it as due within the next year for this calculation, since replacement could reasonably happen anytime.
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
        <p className="text-xs text-neutral-500">
          Luxury-tier figures are based on research across three luxury real estate markets: King County, WA;
          Los Angeles County, CA; and the Hamptons, NY.
        </p>
        <p>
          This category doesn&apos;t usually come up in the homebuying process. It&apos;s not part of a
          pre-approval letter, a listing price, or a typical closing conversation, but it belongs on the table
          just as much as anything else here. Building this reserve is entirely optional, and plenty of
          homeowners don&apos;t. When a major repair comes up without one in place, the common alternatives are a
          credit card with enough room on it, a family member with savings available, or a loan against home
          equity. Those are real options too. The point here is simply to show the size of what&apos;s being
          covered, whichever way you choose to handle it.
        </p>
        <p>
          Not sure if this reserve estimate fits your situation? It&apos;s worth running it past your financial
          advisor, who can tell you whether it&apos;s too high or too low for your plans.
        </p>
      </EducationBubble>
    </CollapsibleSection>
  );
}
