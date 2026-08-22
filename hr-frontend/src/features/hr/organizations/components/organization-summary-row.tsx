export function OrganizationSummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : value;

  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <span className="font-['Inter',sans-serif] text-xs text-gray-400">
        {label}
      </span>

      <span className="font-['Inter',sans-serif] text-xs font-semibold text-[#1a2535]">
        {displayValue}
      </span>
    </div>
  );
}