'use client';

import { RepairsInputs, SYSTEM_REFERENCE_DATA } from '@/lib/types';
import { formatCurrency, formatCurrencyWhole } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import NumberInput from '../ui/NumberInput';
import SectionTotalRow from '../ui/SectionTotalRow';

interface RepairsSectionProps {
  value: RepairsInputs;
  onChange: (patch: Partial<RepairsInputs>) => void;
  roofReserve: number;
  hvacReserve: number;
  waterHeaterReserve: number;
  monthlyTotal: number;
}

const SYSTEMS = [
  { key: 'roof' as const, ...SYSTEM_REFERENCE_DATA.roof },
  { key: 'hvac' as const, ...SYSTEM_REFERENCE_DATA.hvac },
  { key: 'waterHeater' as const, ...SYSTEM_REFERENCE_DATA.waterHeater },
];

export default function RepairsSection({
  value,
  onChange,
  roofReserve,
  hvacReserve,
  waterHeaterReserve,
  monthlyTotal,
}: RepairsSectionProps) {
  const reserves = { roof: roofReserve, hvac: hvacReserve, waterHeater: waterHeaterReserve };

  return (
    <CollapsibleSection
      id="repairs"
      title="Repairs & System Replacements"
      subtitle="Big-ticket items most buyers don't budget for"
    >
      <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
        Roofs, HVAC systems, and water heaters don&apos;t last forever, and replacing one is a large one-time
        cost — often several thousand dollars at once, and often at an inconvenient time. Most buyers budget for
        the mortgage and simply forget these are coming.
      </p>

      <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
        The numbers below spread that eventual cost into a monthly reserve, based on national median lifespans
        and replacement costs. Actual costs vary by region — coastal and West Coast markets often run higher than
        the rural Midwest or Southeast due to labor rates and local codes — so a local contractor quote will
        always beat a national average for a specific property. If a system is already past its typical
        lifespan, we treat it as due within the next year for this calculation, since replacement could
        reasonably happen anytime.
      </p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">System</th>
              <th className="py-2 pr-3 font-medium">Age (years)</th>
              <th className="py-2 pr-3 font-medium">Typical lifespan</th>
              <th className="py-2 pr-3 font-medium">Median replacement cost</th>
              <th className="py-2 pr-1 font-medium text-right">Monthly reserve</th>
            </tr>
          </thead>
          <tbody>
            {SYSTEMS.map((system) => (
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
    </CollapsibleSection>
  );
}
