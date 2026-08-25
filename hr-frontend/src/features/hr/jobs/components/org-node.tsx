export function OrgNode({
  title,
  subtitle,
  highlight,
}: {
  title: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-3 text-center shadow-sm ${
        highlight ? "border-[#f5841f] bg-[#f5841f]/5" : "border-gray-100 bg-white"
      }`}
    >
      <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
        {title}
      </p>

      {subtitle && (
        <p className="mt-0.5 font-['Inter',sans-serif] text-xs text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function OrgConnector() {
  return (
    <div className="flex justify-center py-1.5">
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none" className="text-gray-300">
        <path d="M8 0V22" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3 17L8 23L13 17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
