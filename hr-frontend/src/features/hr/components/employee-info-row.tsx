export function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#f4f6f9] px-4 py-3">
      <span className="font-['Inter',sans-serif] text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`font-['Inter',sans-serif] text-sm font-medium ${
          accent ? "text-emerald-600" : "text-[#1a2535]"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </h3>
  );
}

export function ContractValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="font-['Inter',sans-serif] text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 font-['Inter',sans-serif] text-xs font-medium text-[#1a2535]">
        {value}
      </p>
    </div>
  );
}
