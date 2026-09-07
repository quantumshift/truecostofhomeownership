'use client';

import { MaintenanceInputs } from '@/lib/types';
import CollapsibleSection from '../ui/CollapsibleSection';
import FieldRow from '../ui/FieldRow';
import NumberInput from '../ui/NumberInput';
import CurrencyInput from '../ui/CurrencyInput';
import SectionTotalRow from '../ui/SectionTotalRow';
import EducationBubble from '../ui/EducationBubble';

interface MaintenanceSectionProps {
  value: MaintenanceInputs;
  onChange: (patch: Partial<MaintenanceInputs>) => void;
  monthlyTotal: number;
  isLuxuryMode: boolean;
}

export default function MaintenanceSection({ value, onChange, monthlyTotal, isLuxuryMode }: MaintenanceSectionProps) {
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

      {isLuxuryMode && (
        <div className="mt-6 pt-5 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            Homes in this price range for the area often carry some additional ongoing costs. Add any that apply,
            and leave any that don&apos;t at $0.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldRow label="Pool / Spa Maintenance" htmlFor="poolSpa">
              <CurrencyInput id="poolSpa" value={value.poolSpa} onChange={(v) => onChange({ poolSpa: v })} />
            </FieldRow>
            <FieldRow label="Landscaping Crew" htmlFor="landscapingCrew" hint="Regular service, beyond basic lawn care">
              <CurrencyInput
                id="landscapingCrew"
                value={value.landscapingCrew}
                onChange={(v) => onChange({ landscapingCrew: v })}
              />
            </FieldRow>
            <FieldRow label="Housekeeping / Property Staff" htmlFor="housekeeping">
              <CurrencyInput
                id="housekeeping"
                value={value.housekeeping}
                onChange={(v) => onChange({ housekeeping: v })}
              />
            </FieldRow>
            <FieldRow label="Security System / Monitoring" htmlFor="security">
              <CurrencyInput id="security" value={value.security} onChange={(v) => onChange({ security: v })} />
            </FieldRow>
          </div>
        </div>
      )}

      <SectionTotalRow label="Total Monthly Maintenance & Upkeep" amount={monthlyTotal} />

      <EducationBubble>
        <p>
          This is separate from the big-ticket system replacements in the next section. Routine upkeep is regular
          and predictable, while system replacements are irregular and much larger.
        </p>
        <p>
          The $0.14/sq ft baseline above is the HUD/VA standard maintenance-and-utilities allowance figure used
          in reverse mortgage and VA loan residual income calculations, so it&apos;s grounded in something real.
          Still, it&apos;s a starting point, not a prediction. A newer home with modern systems and good bones can
          run well under this for 20–30 years, while a home over a century old with undocumented past work or
          areas that haven&apos;t been opened up in decades can run well above it. Age, condition, and how well
          the home has been maintained before you move in will move this number more than square footage alone.
        </p>
      </EducationBubble>
    </CollapsibleSection>
  );
}
