'use client';

import { formatCurrencyWhole } from '@/lib/format';
import { MAINTENANCE_RATE_OF_VALUE } from '@/lib/types';
import CollapsibleSection from '../ui/CollapsibleSection';
import SectionTotalRow from '../ui/SectionTotalRow';
import EducationBubble from '../ui/EducationBubble';

interface MaintenanceSectionProps {
  purchasePrice: number;
  monthlyTotal: number;
}

export default function MaintenanceSection({ purchasePrice, monthlyTotal }: MaintenanceSectionProps) {
  const ratePercent = (MAINTENANCE_RATE_OF_VALUE * 100).toFixed(2);

  return (
    <CollapsibleSection
      id="maintenance"
      title="Maintenance"
      subtitle="Routine, predictable upkeep: lawn care, gutters, filters, pest control, general wear."
    >
      <p className="text-sm text-neutral-600">
        {formatCurrencyWhole(purchasePrice)} × {ratePercent}% ÷ 12 = {formatCurrencyWhole(monthlyTotal)}/mo
      </p>

      <SectionTotalRow label="Total Monthly Maintenance" amount={monthlyTotal} />

      <EducationBubble>
        <p>
          Maintenance is estimated at {ratePercent}% of your home&apos;s purchase price per year, based on
          National Association of Home Builders (NAHB) data on typical routine maintenance and repair costs. This
          covers predictable, ongoing upkeep like lawn care, gutters, filters, and general wear, not major system
          replacements, which are calculated separately below in your Owner&apos;s Reserve.
        </p>
      </EducationBubble>
    </CollapsibleSection>
  );
}
