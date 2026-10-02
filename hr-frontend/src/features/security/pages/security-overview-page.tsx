import { AppWindow, KeyRound, ScrollText, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { StatCard } from "@/features/dashboard/components/stat-card";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useSecurityDashboard } from "@/features/security/api/use-security-dashboard";
import { SecurityCard } from "@/features/security/components/security-card";
import { ErrorState } from "@/features/security/components/security-states";
import { Skeleton } from "@/components/ui/skeleton";

type AreaLink = { to: string; labelKey: string; descriptionKey: string; icon: LucideIcon };

function formatCount(value: number | null | undefined) {
  return value == null ? "—" : value.toLocaleString("en-US");
}

export function SecurityOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const access = useSecurityAccess();
  const dashboard = useSecurityDashboard();
  const { capabilities } = access;

  const stats = [
    {
      label: t("security.overview.activeUsers"),
      value: dashboard.data?.activeUsers,
      color: "#2ecc71",
      icon: Users,
      to: "/security/users",
    },
    {
      label: t("security.overview.activeRoles"),
      value: dashboard.data?.activeRoles,
      color: "#3498db",
      icon: ShieldCheck,
      to: "/security/roles",
    },
    {
      label: t("security.overview.activePermissions"),
      value: dashboard.data?.activePermissions,
      color: "#f5841f",
      icon: KeyRound,
      to: "/security/permissions",
    },
    {
      label: t("security.overview.activeModules"),
      value: dashboard.data?.activeModules,
      color: "#9b59b6",
      icon: AppWindow,
      to: "/security/modules",
    },
  ];

  const areas: AreaLink[] = [
    { to: "/security/users", labelKey: "security.nav.users", descriptionKey: "security.overview.usersHint", icon: Users },
    { to: "/security/roles", labelKey: "security.nav.roles", descriptionKey: "security.overview.rolesHint", icon: ShieldCheck },
    {
      to: "/security/permissions",
      labelKey: "security.nav.permissions",
      descriptionKey: "security.overview.permissionsHint",
      icon: KeyRound,
    },
    {
      to: "/security/modules",
      labelKey: "security.nav.modules",
      descriptionKey: "security.overview.modulesHint",
      icon: AppWindow,
    },
    ...(capabilities.canViewAuditLogs
      ? [
          {
            to: "/security/audit-logs",
            labelKey: "security.nav.auditLogs",
            descriptionKey: "security.overview.auditHint",
            icon: ScrollText,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8"
        style={{ background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)" }}
      >
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 sm:flex rtl:left-8 rtl:right-auto">
          <div className="size-16 rounded-full bg-[#f5841f]/25" />
          <div className="-ml-6 size-16 rounded-full bg-[#2ecc71]/25" />
        </div>
        <div className="relative">
          <h1 className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-white">
            {t("security.overview.title")}
          </h1>
          <p className="mt-1 font-['Inter',sans-serif] text-sm text-[#a4aab6]">
            {access.data?.username
              ? t("security.overview.signedInAs", {
                  username: access.data.username,
                  role: capabilities.isSystemAdmin ? "SYSTEM_ADMIN" : "HR_ADMIN",
                })
              : t("security.overview.subtitle")}
          </p>
        </div>
      </div>

      {dashboard.isError ? (
        <SecurityCard>
          <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />
        </SecurityCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) =>
            dashboard.isLoading ? (
              <Skeleton key={stat.to} className="h-[132px] rounded-[12px] bg-white" />
            ) : (
              <StatCard
                key={stat.to}
                label={stat.label}
                value={formatCount(stat.value)}
                color={stat.color}
                icon={stat.icon}
                onClick={() => navigate(stat.to)}
              />
            ),
          )}
        </div>
      )}

      <SecurityCard title={t("security.overview.areas")}>
        <nav aria-label={t("security.overview.areas")}>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area.to}>
                <Link
                  to={area.to}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-gray-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5841f] hover:bg-[#f5841f]/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5841f]/50"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f6f9] text-gray-500 transition-colors group-hover:bg-[#f5841f]/10 group-hover:text-[#f5841f]">
                    <area.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                      {t(area.labelKey)}
                    </span>
                    <span className="mt-0.5 block font-['Inter',sans-serif] text-xs text-gray-400">
                      {t(area.descriptionKey)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SecurityCard>
    </div>
  );
}
