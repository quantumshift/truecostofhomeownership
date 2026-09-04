import { formatCurrency } from '@/lib/format';

interface ReadOnlyCurrencyProps {
  value: number;
  id?: string;
}

export default function ReadOnlyCurrency({ value, id }: ReadOnlyCurrencyProps) {
  return (
    <div
      id={id}
      className="w-full rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-700 tabular-nums"
    >
      {formatCurrency(value)}
    </div>
  );
}
