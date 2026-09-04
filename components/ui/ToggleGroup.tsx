'use client';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export default function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: ToggleGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-md border border-neutral-300 p-0.5 bg-neutral-50">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              active ? 'bg-navy text-white' : 'text-neutral-600 hover:text-navy'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
