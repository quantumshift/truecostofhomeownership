'use client';

import { ChangeEvent, useEffect, useState } from 'react';

interface CurrencyInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
}

export default function CurrencyInput({ id, value, onChange, disabled, placeholder, min = 0 }: CurrencyInputProps) {
  const [text, setText] = useState(value ? String(value) : '');

  useEffect(() => {
    const asNumber = text === '' ? 0 : parseFloat(text);
    if (asNumber !== value) {
      setText(value ? String(value) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
    setText(raw);
    const parsed = raw === '' ? 0 : parseFloat(raw);
    onChange(Number.isFinite(parsed) ? Math.max(min, parsed) : 0);
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={text}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        className="w-full rounded-md border border-neutral-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light disabled:bg-neutral-100 disabled:text-neutral-500"
      />
    </div>
  );
}
