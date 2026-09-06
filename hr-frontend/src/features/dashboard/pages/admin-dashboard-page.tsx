import { Clock, FileBarChart2, Settings, ShieldCheck, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { EmployeesBreakdownCard } from "@/features/dashboard/components/employees-breakdown-card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { formatDate, initials } from "@/features/hr/shared/utils/format";
import { useUserStore } from "@/stores/user-store";
import { useGetMyEmployee } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { useListHistory } from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

const NO_DATA_COLOR = "#9ca3af";

const quickActions = [
  { id: "add-employee", labelKey: "dashboard.addEmployee", icon: UserPlus, to: "/hr/employees/new" },
  { id: "grant-access", labelKey: "dashboard.grantHrAccess", icon: ShieldCheck, to: "/hr/settings/access-delegation" },
  { id: "reports", labelKey: "dashboard.hrReports", icon: FileBarChart2, to: "/hr/reports" },
  { id: "settings", labelKey: "dashboard.hrSettings", icon: Settings, to: "/hr/settings" },
];

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const username = useUserStore((s) => s.user?.username);
  const myEmployee = useGetMyEmployee({ query: { retry: false } });

  const today = new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const displayName = myEmployee.data?.displayName ?? username ?? t("common.admin");
  const employeeNumber = myEmployee.data?.employeeNumber ?? "—";

  const history = useListHistory({ size: 5 });

  const recentEvents = history.data?.content ?? [];

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ backgroundImage: "linear-gradient(174deg, #1a2535 25%, #243347 75%)" }}
      >
        <div className="pointer-events-none absolute -left-12 -top-12 size-[200px] opacity-5">
          <svg viewBox="0 0 200 200" fill="none">
            <path
              d="M10 10 L190 10 M10 50 L190 50 M10 90 L190 90 M10 130 L190 130 M10 170 L190 170 M10 10 L10 190 M50 10 L50 190 M90 10 L90 190 M130 10 L130 190 M170 10 L170 190"
              stroke="#F5841F"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 px-5 py-5 sm:flex-row sm:items-center md:h-[120px] md:px-8 md:py-0">
          <div className="flex flex-col gap-1">
            <p className="font-['Inter',sans-serif] text-[20px] font-bold text-white md:text-[28px]">
              {t("dashboard.goodMorning", { name: displayName })}
            </p>
            <p className="font-['Inter',sans-serif] text-[13px] text-[#a4aab6] md:text-[15px]">
              {t("dashboard.orgSubtitle")}
            </p>
          </div>

          <p className="hidden font-['Inter',sans-serif] text-[13px] text-white md:block md:text-[20px]">
            {today}
          </p>

          <div className="relative hidden sm:block">
            <div className="flex">
              <div className="size-16 rounded-full bg-[#f5841f]/20 md:size-20" />
              <div className="-ml-8 size-16 rounded-full bg-[#2ecc71]/20 md:-ml-10 md:size-20" />
            </div>
            <p className="absolute inset-0 flex items-center justify-center font-['Inter',sans-serif] text-[14px] font-bold text-white md:text-[16px]">
              {employeeNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 md:gap-4">
        <div className="lg:col-span-2">
          <EmployeesBreakdownCard />
        </div>

        <StatCard
          label={t("dashboard.pendingApprovals")}
          value="—"
          color={NO_DATA_COLOR}
          icon={Clock}
          subText={t("dashboard.noDataYet")}
          subColor={NO_DATA_COLOR}
        />
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 md:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-['Inter',sans-serif] text-[16px] font-bold text-[#1a2535] md:text-[18px]">
              {t("dashboard.recentHrActivity")}
            </p>

            <button
              type="button"
              onClick={() => navigate("/hr/settings/history")}
              className="font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] hover:underline"
            >
              {t("common.viewAll")}
            </button>
          </div>

          {history.isLoading ? (
            <p className="font-['Inter',sans-serif] text-sm text-gray-400">{t("dashboard.loadingActivity")}</p>
          ) : recentEvents.length === 0 ? (
            <p className="font-['Inter',sans-serif] text-sm text-gray-400">{t("dashboard.noRecentActivity")}</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {recentEvents.map((event) => (
                <div key={event.hrSettingEventId} className="flex items-center gap-3 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1a2535]">
                    <span className="font-['Inter',sans-serif] text-[11px] font-bold text-white">
                      {initials(event.performedByName)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-['Inter',sans-serif] text-sm text-[#1a2535]">
                      <span className="font-semibold">{event.performedByName ?? t("common.system")}</span>{" "}
                      {event.description}
                    </p>
                    <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 md:p-6">
          <p className="font-['Inter',sans-serif] text-[16px] font-bold text-[#1a2535] md:text-[18px]">
            {t("dashboard.quickActions")}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.to)}
                className="flex h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f4f6f9] p-3 transition-all hover:-translate-y-0.5 hover:border-[#f5841f]/50 hover:bg-[#f5841f]/5 hover:shadow-sm"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm">
                  <action.icon size={20} className="text-[#1a2535]" />
                </div>
                <p className="text-center font-['Inter',sans-serif] text-[11px] font-semibold leading-tight text-[#1a2535]">
                  {t(action.labelKey)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
