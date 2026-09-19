export default function AiBadge({ label = 'AI estimate' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-navy-light/10 px-2 py-0.5 text-[11px] font-medium text-navy-light">
      {label}
    </span>
  );
}
