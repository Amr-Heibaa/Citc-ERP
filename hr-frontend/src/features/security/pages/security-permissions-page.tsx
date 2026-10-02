import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type { SecurityPermissionSummary } from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useAllSecurityModules } from "@/features/security/api/use-security-modules";
import { useSecurityPermissions } from "@/features/security/api/use-security-permissions";
import { PermissionFormDialog } from "@/features/security/components/forms/permission-form-dialog";
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
import { formatDateTime } from "@/features/security/utils/format";
import { useDebouncedValue } from "@/features/security/utils/use-debounced-value";

export function SecurityPermissionsPage() {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const filters = useSecurityFiltersStore((state) => state.lists.permissions);
  const setFilters = useSecurityFiltersStore((state) => state.setFilters);
  const setPage = useSecurityFiltersStore((state) => state.setPage);
  const search = useDebouncedValue(filters.search.trim());
  const [createOpen, setCreateOpen] = useState(false);

  const modules = useAllSecurityModules();
  const permissions = useSecurityPermissions({
    page: filters.page,
    size: SECURITY_DEFAULT_PAGE_SIZE,
    search: search || undefined,
    active: activeFilterValue(filters.status),
    moduleId: filters.moduleId ? Number(filters.moduleId) : undefined,
  });

  const columns: SecurityColumn<SecurityPermissionSummary>[] = [
    {
      key: "permission",
      header: t("security.permissions.columns.permission"),
      cell: (permission) => (
        <div className="min-w-0">
          <Link
            to={`/security/permissions/${permission.permissionId}`}
            className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535] hover:text-[#f5841f] focus-visible:text-[#f5841f] focus-visible:outline-none"
          >
            {permission.permissionName}
          </Link>
          {permission.description && (
            <p className="max-w-xs truncate font-['Inter',sans-serif] text-xs text-gray-400">
              {permission.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "code",
      header: t("security.fields.code"),
      className: CODE_TEXT,
      cell: (permission) => permission.permissionCode,
    },
    {
      key: "module",
      header: t("security.fields.module"),
      className: TABLE_CELL_TEXT,
      cell: (permission) =>
        permission.applicationModuleId != null ? (
          <Link
            to={`/security/modules/${permission.applicationModuleId}`}
            className="hover:text-[#f5841f]"
          >
            {permission.applicationName ?? permission.applicationCode}
          </Link>
        ) : (
          t("security.permissions.noModule")
        ),
    },
    {
      key: "status",
      header: t("security.fields.status"),
      cell: (permission) => <StatusBadge active={permission.active} />,
    },
    {
      key: "createdAt",
      header: t("security.fields.createdAt"),
      className: `${TABLE_CELL_TEXT} whitespace-nowrap`,
      cell: (permission) => formatDateTime(permission.createdAt),
    },
    {
      key: "open",
      header: "",
      className: "w-10 text-right",
      cell: (permission) => (
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link
            to={`/security/permissions/${permission.permissionId}`}
            aria-label={t("security.permissions.open", { code: permission.permissionCode })}
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
        title={t("security.permissions.title")}
        subtitle={t("security.permissions.subtitle")}
        actions={
          capabilities.canManageDefinitions && (
            <Button
              className="h-10 bg-[#1a2535] text-white hover:bg-[#243347]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {t("security.permissions.create")}
            </Button>
          )
        }
      />

      <SecurityToolbar
        search={filters.search}
        onSearchChange={(value) => setFilters("permissions", { search: value })}
        searchPlaceholder={t("security.permissions.searchPlaceholder")}
      >
        <FilterSelect
          value={filters.moduleId}
          onChange={(value) => setFilters("permissions", { moduleId: value })}
          allLabel={t("security.filters.allModules")}
          ariaLabel={t("security.filters.module")}
          className="lg:w-56"
          options={(modules.data ?? []).map((module) => ({
            value: String(module.applicationModuleId),
            label: module.applicationName,
          }))}
        />
        <FilterSelect
          value={filters.status}
          onChange={(value) => setFilters("permissions", { status: value })}
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
          rows={permissions.data?.content ?? []}
          getRowKey={(permission) => permission.permissionId}
          isLoading={permissions.isLoading}
          error={permissions.error}
          onRetry={() => permissions.refetch()}
          emptyTitle={t("security.permissions.empty")}
          isFiltered={Boolean(filters.search || filters.status || filters.moduleId)}
          minWidth={860}
          caption={t("security.permissions.title")}
          footer={
            permissions.data && (
              <SecurityPagination
                page={permissions.data.page}
                size={permissions.data.size}
                totalPages={permissions.data.totalPages}
                totalElements={permissions.data.totalElements}
                onPageChange={(page) => setPage("permissions", page)}
                disabled={permissions.isFetching}
              />
            )
          }
        />
      </SecurityCard>

      {capabilities.canManageDefinitions && (
        <PermissionFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
