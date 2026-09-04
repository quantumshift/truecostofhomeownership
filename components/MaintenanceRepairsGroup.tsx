import { ReactNode } from 'react';

interface MaintenanceRepairsGroupProps {
  children: ReactNode;
}

export default function MaintenanceRepairsGroup({ children }: MaintenanceRepairsGroupProps) {
  return (
    <div className="rounded-xl border-2 border-navy/15 bg-navy/[0.03] p-4 sm:p-5 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-light mb-1.5">
          What other calculators skip
        </p>
        <p className="text-sm text-neutral-700 leading-relaxed">
          Most mortgage calculators stop at principal, interest, taxes, and insurance. But owning a home also
          means routine upkeep and, eventually, expensive system replacements — a roof, an HVAC system, a water
          heater. These two sections cover exactly that: the numbers virtually every other homeownership
          calculator acts like don&apos;t exist.
        </p>
      </div>

      {children}

      <p className="text-sm text-neutral-600 leading-relaxed border-t border-navy/10 pt-4">
        Not sure if this reserve estimate fits your situation? It&apos;s worth running past your financial
        advisor — they can tell you whether it&apos;s too high or too low for your specific plans.
      </p>
    </div>
  );
}
