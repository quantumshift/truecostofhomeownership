'use client';

import { MaintenanceInputs } from '@/lib/types';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import NumberInput from '../ui/NumberInput';
import SectionTotalRow from '../ui/SectionTotalRow';

interface MaintenanceSectionProps {
  value: MaintenanceInputs;
  onChange: (patch: Partial<MaintenanceInputs>) => void;
  monthlyTotal: number;
}

export default function MaintenanceSection({ value, onChange, monthlyTotal }: MaintenanceSectionProps) {
  return (
    <CollapsibleSection id="maintenance" title="Maintenance & Upkeep" subtitle="Routine, predictable upkeep">
      <p className="text-sm text-neutral-600 mb-5">
        This covers the small, regular stuff — lawn care, gutters, filters, pest control, general wear and tear.
        It&apos;s separate from the big-ticket system replacements in the next section, which are irregular and
        much larger.
      </p>

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

      <p className="text-xs text-neutral-500 mt-5 leading-relaxed">
        This starting point is based on $0.14/sq ft/month — the HUD/VA standard maintenance-and-utilities
        allowance figure used in reverse mortgage and VA loan residual income calculations. Treat it as a
        baseline, not a prediction: a newer home with modern systems and good bones can run well under this for
        20–30 years, while a century-old house with original systems, undocumented past work, or areas that
        haven&apos;t been opened up in decades can run well above it. Age, condition, and how well the home has
        been maintained before you move in will move this number more than square footage alone.
      </p>

      <SectionTotalRow label="Total Monthly Maintenance & Upkeep" amount={monthlyTotal} />
    </CollapsibleSection>
  );
}
