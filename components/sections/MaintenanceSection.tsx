'use client';

import { MaintenanceInputs } from '@/lib/types';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import NumberInput from '../ui/NumberInput';
import SectionTotalRow from '../ui/SectionTotalRow';
import EducationBubble from '../ui/EducationBubble';

interface MaintenanceSectionProps {
  value: MaintenanceInputs;
  onChange: (patch: Partial<MaintenanceInputs>) => void;
  monthlyTotal: number;
}

export default function MaintenanceSection({ value, onChange, monthlyTotal }: MaintenanceSectionProps) {
  return (
    <CollapsibleSection
      id="maintenance"
      title="Maintenance & Upkeep"
      subtitle="Routine, predictable upkeep: lawn care, gutters, filters, pest control, general wear."
    >
      <div className="max-w-xs">
        <FieldRow label="Home Square Footage" htmlFor="squareFootage" hint="Heated/living space">
          <NumberInput
            id="squareFootage"
            value={value.squareFootage}
            onChange={(v) => onChange({ squareFootage: v })}
            suffix="sq ft"
          />
        </FieldRow>
      </div>

      <SectionTotalRow label="Total Monthly Maintenance & Upkeep" amount={monthlyTotal} />

      <EducationBubble>
        <p>
          This is separate from the big-ticket system replacements in the next section. Routine upkeep is regular
          and predictable, while system replacements are irregular and much larger.
        </p>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm border-collapse min-w-[380px]">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200">
                <th className="py-2 pr-3 font-medium">Figure</th>
                <th className="py-2 pr-1 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 pr-3 font-semibold text-navy tabular-nums whitespace-nowrap">
                  $0.14 / sq ft / month
                </td>
                <td className="py-3 pr-1 text-neutral-600">
                  HUD / VA standard maintenance-and-utilities allowance, used in reverse mortgage and VA loan
                  residual income calculations
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Still, it&apos;s a starting point, not a prediction. A newer home with modern systems and good bones can
          run well under this for 20–30 years, while a home over a century old with undocumented past work or
          areas that haven&apos;t been opened up in decades can run well above it. Age, condition, and how well
          the home has been maintained before you move in will move this number more than square footage alone.
        </p>
      </EducationBubble>
    </CollapsibleSection>
  );
}
