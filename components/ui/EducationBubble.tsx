'use client';

import { ReactNode, useId, useState } from 'react';

interface EducationBubbleProps {
  children: ReactNode;
}

function LightbulbIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.5.4.8 1 .8 1.7v.5h5.6v-.5c0-.7.3-1.3.8-1.7A6 6 0 0012 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EducationBubble({ children }: EducationBubbleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="rounded-lg bg-navy-light/[0.06] border border-navy-light/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="sm:hidden w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <LightbulbIcon className="h-4 w-4 text-navy-light shrink-0" />
        <span className="text-sm font-medium text-navy-light">Learn more</span>
        <svg
          className={`h-4 w-4 text-navy-light ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
      <div
        id={panelId}
        className={`${open ? 'flex' : 'hidden'} sm:flex gap-3 px-4 pb-4 pt-0 sm:p-5`}
      >
        <LightbulbIcon className="hidden sm:block h-5 w-5 text-navy-light shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 text-sm text-neutral-700 leading-relaxed space-y-2.5">{children}</div>
      </div>
    </div>
  );
}
