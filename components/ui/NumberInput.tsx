'use client';

import { ChangeEvent, useEffect, useState } from 'react';

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  decimals?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}

export default function NumberInput({
  id,
  value,
  onChange,
  suffix,
  decimals = 0,
  min = 0,
  max,
  placeholder,
}: NumberInputProps) {
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
    const pattern = decimals > 0 ? new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`) : /^\d*$/;
    if (!pattern.test(raw)) return;
    setText(raw);
    let parsed = raw === '' ? 0 : parseFloat(raw);
    if (Number.isFinite(parsed)) {
      if (max !== undefined) parsed = Math.min(max, parsed);
      onChange(Math.max(min, parsed));
    } else {
      onChange(0);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{suffix}</span>
      )}
    </div>
  );
}
