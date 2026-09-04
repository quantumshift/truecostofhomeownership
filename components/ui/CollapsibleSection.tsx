'use client';

import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  monthlyTotal?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({
  id,
  title,
  subtitle,
  monthlyTotal,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id}-panel`;

  return (
    <section
      id={id}
      className="rounded-lg border border-neutral-200 bg-white overflow-hidden scroll-mt-6"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <div>
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {monthlyTotal && (
            <span className="text-base font-semibold text-navy tabular-nums">{monthlyTotal}/mo</span>
          )}
          <svg
            className={`h-5 w-5 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
        </div>
      </button>
      <div id={panelId} hidden={!open} className="px-5 pb-6 pt-1 border-t border-neutral-100">
        {children}
      </div>
    </section>
  );
}
