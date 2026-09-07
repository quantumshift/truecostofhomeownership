import { ReactNode } from 'react';

interface TierGroupProps {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}

export default function TierGroup({ eyebrow, title, intro, children }: TierGroupProps) {
  return (
    <div className="rounded-xl border-2 border-navy/15 bg-navy/[0.03] p-4 sm:p-5 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-light mb-1.5">{eyebrow}</p>
        <h2 className="text-xl font-bold text-navy mb-2">{title}</h2>
        <div className="text-sm text-neutral-700 leading-relaxed space-y-2.5">{intro}</div>
      </div>

      {children}
    </div>
  );
}
