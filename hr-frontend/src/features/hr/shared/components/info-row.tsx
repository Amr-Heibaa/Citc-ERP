export function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : value;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f4f6f9] px-4 py-3">
      <span className="font-['Inter',sans-serif] text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`text-right font-['Inter',sans-serif] text-sm font-medium ${
          accent
            ? "text-emerald-600"
            : "text-[#1a2535]"
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}

export function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </h3>
  );
}