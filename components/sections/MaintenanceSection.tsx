'use client';

import { MaintenanceInputs } from '@/lib/types';
import { formatCurrencyWhole } from '@/lib/format';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import NumberInput from '../ui/NumberInput';

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
      subtitle="Routine, predictable upkeep"
      monthlyTotal={formatCurrencyWhole(monthlyTotal)}
    >
      <p className="text-sm text-neutral-600 mb-5">
        This covers the small, regular stuff — lawn care, gutters, filters, pest control, general wear and tear.
        It&apos;s separate from the big-ticket system replacements in the next section, which are irregular and
        much larger.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldRow label="Home Square Footage" htmlFor="squareFootage" hint="Heated/living space">
          <NumberInput
            id="squareFootage"
            value={value.squareFootage}
            onChange={(v) => onChange({ squareFootage: v })}
            suffix="sq ft"
          />
        </FieldRow>

        <FieldRow label="Monthly Maintenance" htmlFor="maintenanceMonthlyCalc">
          <div className="rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
            {formatCurrencyWhole(monthlyTotal)}
          </div>
        </FieldRow>
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        Based on $0.14/sq ft/month — the HUD/VA standard maintenance-and-utilities allowance figure used in
        reverse mortgage and VA loan residual income calculations.
      </p>
    </CollapsibleSection>
  );
}
