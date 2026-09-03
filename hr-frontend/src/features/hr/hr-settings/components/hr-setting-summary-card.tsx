import { useTranslation } from "react-i18next";

export function HrSettingSummaryCard({
  title,
  total,
  active,
  loading,
  error,
  actionLabel,
  onAction,
}: {
  title: string;
  total: number;
  active: number;
  loading?: boolean;
  error?: boolean;
  actionLabel: string;
  onAction: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 text-center">
      <h3 className="font-['Inter',sans-serif] text-base font-bold text-[#1a2535]">
        {title}
      </h3>

      <p className="mt-4 font-['Inter',sans-serif] text-4xl font-bold text-[#1a2535]">
        {loading || error ? "—" : total.toLocaleString()}
      </p>

      <p className="mt-1 font-['Inter',sans-serif] text-sm text-gray-400">
        {error ? t("hrSettings.summaryCard.unableToLoad") : t("hrSettings.summaryCard.totalRecords")}
      </p>

      <div className="my-5 h-px w-full bg-gray-100" />

      <p className="font-['Inter',sans-serif] text-sm text-gray-500">
        {loading || error ? "—" : t("hrSettings.summaryCard.activeSuffix", { count: active })}
      </p>

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
