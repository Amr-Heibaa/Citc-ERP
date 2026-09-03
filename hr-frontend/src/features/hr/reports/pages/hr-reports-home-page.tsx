import { CalendarRange, FileBarChart2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export function HrReportsHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const REPORT_CARDS = [
    {
      id: "hires-resignations",
      title: t("reports.home.hiresResignations.title"),
      description: t("reports.home.hiresResignations.description"),
      icon: CalendarRange,
      to: "/hr/reports/hires-resignations",
    },
    {
      id: "contract-types",
      title: t("reports.home.contractTypes.title"),
      description: t("reports.home.contractTypes.description"),
      icon: FileBarChart2,
      to: "/hr/reports/contract-types",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
          {t("reports.home.title")}
        </h1>

        <p className="font-['Inter',sans-serif] text-sm text-gray-400">
          {t("reports.home.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {REPORT_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => navigate(card.to)}
            className="flex flex-col items-start gap-3 rounded-xl border border-gray-100 bg-white p-6 text-left transition-colors hover:border-[#f5841f] hover:bg-orange-50"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#f4f6f9]">
              <card.icon size={20} className="text-[#1a2535]" />
            </div>

            <h3 className="font-['Inter',sans-serif] text-base font-bold text-[#1a2535]">
              {card.title}
            </h3>

            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              {card.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
