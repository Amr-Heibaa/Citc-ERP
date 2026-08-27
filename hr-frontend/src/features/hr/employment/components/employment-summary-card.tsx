export function EmploymentSummaryCard({
  title,
  headline,
  headlineLabel,
  stats,
  actionLabel,
  onAction,
  loading,
}: {
  title: string;
  headline: number;
  headlineLabel: string;
  stats: { value: number; label: string }[];
  actionLabel: string;
  onAction: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6">
      <h3 className="font-['Inter',sans-serif] text-base font-bold text-[#1a2535]">
        {title}
      </h3>

      <div className="mt-4 text-center">
        <p className="font-['Inter',sans-serif] text-4xl font-bold text-[#1a2535]">
          {loading ? "—" : headline.toLocaleString()}
        </p>

        <p className="mt-1 font-['Inter',sans-serif] text-sm text-gray-400">
          {headlineLabel}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-['Inter',sans-serif] text-lg font-bold text-[#1a2535]">
              {loading ? "—" : stat.value}
            </p>

            <p className="font-['Inter',sans-serif] text-xs text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-lg bg-[#f4f6f9] py-2.5 text-center font-['Inter',sans-serif] text-sm font-medium text-[#1a2535] transition-colors hover:bg-gray-200"
      >
        {actionLabel} →
      </button>
    </div>
  );
}
