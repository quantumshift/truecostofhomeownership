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
          This figure is separate from system replacements, addressed below: routine upkeep is a predictable,
          recurring cost, while a system replacement is irregular and considerably larger. The $0.14 per square
          foot standard is a baseline, not a forecast. A newer home with well-maintained systems can run well
          under this figure for decades; an older home with undocumented past work or areas left unaddressed for
          years can run well above it. Condition and maintenance history move this number more than square
          footage alone.
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
      </EducationBubble>
    </CollapsibleSection>
  );
}
