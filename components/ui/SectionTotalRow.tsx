import { formatCurrencyWhole } from '@/lib/format';

interface SectionTotalRowProps {
  label: string;
  amount: number;
}

export default function SectionTotalRow({ label, amount }: SectionTotalRowProps) {
  return (
    <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <span className="text-lg font-semibold text-navy tabular-nums">{formatCurrencyWhole(amount)}/mo</span>
    </div>
  );
}
