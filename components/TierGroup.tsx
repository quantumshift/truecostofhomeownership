'use client';

import { useState, ReactNode } from 'react';

interface TierGroupProps {
  id: string;
  title: string;
  subtitle?: string;
  intro?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function TierGroup({ id, title, subtitle, intro, defaultOpen = false, children }: TierGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id}-panel`;

  return (
    <div className="rounded-xl border-2 border-navy/15 bg-navy/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-4 px-4 py-4 sm:px-5 text-left hover:bg-navy/5 transition-colors"
      >
        <div>
          <h2 className="text-xl font-bold text-navy">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-600 mt-0.5">{subtitle}</p>}
        </div>
        <svg
          className={`h-5 w-5 text-navy shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div id={panelId} hidden={!open} className="px-4 pb-5 sm:px-5 space-y-5 border-t border-navy/10 pt-4">
        {intro && <div className="text-sm text-neutral-700 leading-relaxed space-y-2.5">{intro}</div>}
        {children}
      </div>
    </div>
  );
}
