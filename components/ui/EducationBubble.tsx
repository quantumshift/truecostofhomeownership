import { ReactNode } from 'react';

interface EducationBubbleProps {
  children: ReactNode;
}

export default function EducationBubble({ children }: EducationBubbleProps) {
  return (
    <div className="rounded-lg bg-navy-light/[0.06] border border-navy-light/20 p-4 sm:p-5 flex gap-3">
      <svg
        className="h-5 w-5 text-navy-light shrink-0 mt-0.5"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.5.4.8 1 .8 1.7v.5h5.6v-.5c0-.7.3-1.3.8-1.7A6 6 0 0012 3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="min-w-0 flex-1 text-sm text-neutral-700 leading-relaxed space-y-2.5">{children}</div>
    </div>
  );
}
