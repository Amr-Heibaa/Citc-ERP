import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type { SecurityModuleSummary } from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useSecurityModules } from "@/features/security/api/use-security-modules";
import { ModuleFormDialog } from "@/features/security/components/forms/module-form-dialog";
import { SecurityCard } from "@/features/security/components/security-card";
import {
  SecurityDataTable,
  type SecurityColumn,
} from "@/features/security/components/security-data-table";
import { SecurityPageHeader } from "@/features/security/components/security-page-header";
import { SecurityPagination } from "@/features/security/components/security-pagination";
import { FilterSelect, SecurityToolbar } from "@/features/security/components/security-toolbar";
import { CODE_TEXT, TABLE_CELL_TEXT } from "@/features/security/components/tab-styles";
import {
  activeFilterValue,
  useSecurityFiltersStore,
} from "@/features/security/store/security-filters-store";
import { useDebouncedValue } from "@/features/security/utils/use-debounced-value";

export function SecurityModulesPage() {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const filters = useSecurityFiltersStore((state) => state.lists.modules);
  const setFilters = useSecurityFiltersStore((state) => state.setFilters);
  const setPage = useSecurityFiltersStore((state) => state.setPage);
  const search = useDebouncedValue(filters.search.trim());
  const [createOpen, setCreateOpen] = useState(false);

  const modules = useSecurityModules({
    page: filters.page,
    size: SECURITY_DEFAULT_PAGE_SIZE,
    search: search || undefined,
    active: activeFilterValue(filters.status),
  });

  const columns: SecurityColumn<SecurityModuleSummary>[] = [
    {
      key: "code",
      header: t("security.fields.code"),
      className: CODE_TEXT,
      cell: (module) => module.applicationCode,
    },
    {
      key: "name",
      header: t("security.fields.name"),
      cell: (module) => (
        <Link
          to={`/security/modules/${module.applicationModuleId}`}
          className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535] hover:text-[#f5841f] focus-visible:text-[#f5841f] focus-visible:outline-none"
        >
          {module.applicationName}
        </Link>
      ),
    },
    {
      key: "description",
      header: t("security.fields.description"),
      className: `${TABLE_CELL_TEXT} max-w-xs truncate`,
      cell: (module) => module.description ?? "—",
    },
    {
      key: "permissions",
      header: t("security.modules.columns.permissions"),
      className: `${TABLE_CELL_TEXT} text-center`,
      cell: (module) => module.permissionCount,
    },
    {
      key: "status",
      header: t("security.fields.status"),
      cell: (module) => <StatusBadge active={module.active} />,
    },
    {
      key: "open",
      header: "",
      className: "w-10 text-right",
      cell: (module) => (
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link
            to={`/security/modules/${module.applicationModuleId}`}
            aria-label={t("security.modules.open", { name: module.applicationName })}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityPageHeader
        title={t("security.modules.title")}
        subtitle={t("security.modules.subtitle")}
        actions={
          capabilities.canManageDefinitions && (
            <Button
              className="h-10 bg-[#f5841f] text-white hover:bg-[#e07413]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {t("security.modules.create")}
            </Button>
          )
        }
      />

      <SecurityToolbar
        search={filters.search}
        onSearchChange={(value) => setFilters("modules", { search: value })}
        searchPlaceholder={t("security.modules.searchPlaceholder")}
      >
        <FilterSelect
          value={filters.status}
          onChange={(value) => setFilters("modules", { status: value })}
          allLabel={t("security.filters.allStatuses")}
          ariaLabel={t("security.filters.status")}
          options={[
            { value: "active", label: t("common.active") },
            { value: "inactive", label: t("common.inactive") },
          ]}
        />
      </SecurityToolbar>

      <SecurityCard flush>
        <SecurityDataTable
          columns={columns}
          rows={modules.data?.content ?? []}
          getRowKey={(module) => module.applicationModuleId}
          isLoading={modules.isLoading}
          error={modules.error}
          onRetry={() => modules.refetch()}
          emptyTitle={t("security.modules.empty")}
          isFiltered={Boolean(filters.search || filters.status)}
          minWidth={760}
          caption={t("security.modules.title")}
          footer={
            modules.data && (
              <SecurityPagination
                page={modules.data.page}
                size={modules.data.size}
                totalPages={modules.data.totalPages}
                totalElements={modules.data.totalElements}
                onPageChange={(page) => setPage("modules", page)}
                disabled={modules.isFetching}
              />
            )
          }
        />
      </SecurityCard>

      {capabilities.canManageDefinitions && (
        <ModuleFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
