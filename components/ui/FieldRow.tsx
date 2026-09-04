import { ReactNode } from 'react';

interface FieldRowProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  badge?: ReactNode;
}

export default function FieldRow({ label, htmlFor, hint, children, badge }: FieldRowProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        {badge}
      </div>
      {children}
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
}
