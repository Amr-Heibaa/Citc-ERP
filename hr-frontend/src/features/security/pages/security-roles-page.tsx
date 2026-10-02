import { ChevronRight, Lock, Plus, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type { SecurityRoleSummary } from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useSecurityRoles } from "@/features/security/api/use-security-roles";
import { BulkRolePermissionsDialog } from "@/features/security/components/bulk/bulk-role-permissions-dialog";
import { BulkUserRolesDialog } from "@/features/security/components/bulk/bulk-user-roles-dialog";
import { RoleFormDialog } from "@/features/security/components/forms/role-form-dialog";
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
import { isProtectedRole } from "@/features/security/utils/security-access";
import { formatDateTime } from "@/features/security/utils/format";
import { useDebouncedValue } from "@/features/security/utils/use-debounced-value";

export function SecurityRolesPage() {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const filters = useSecurityFiltersStore((state) => state.lists.roles);
  const setFilters = useSecurityFiltersStore((state) => state.setFilters);
  const setPage = useSecurityFiltersStore((state) => state.setPage);
  const search = useDebouncedValue(filters.search.trim());

  const [createOpen, setCreateOpen] = useState(false);
  const [bulkUsersOpen, setBulkUsersOpen] = useState(false);
  const [bulkPermissionsOpen, setBulkPermissionsOpen] = useState(false);

  const roles = useSecurityRoles({
    page: filters.page,
    size: SECURITY_DEFAULT_PAGE_SIZE,
    search: search || undefined,
    active: activeFilterValue(filters.status),
  });

  // The role summary has no single "module" field, so no module column.
  const columns: SecurityColumn<SecurityRoleSummary>[] = [
    {
      key: "role",
      header: t("security.roles.columns.role"),
      cell: (role) => (
        <div className="min-w-0">
          <Link
            to={`/security/roles/${role.roleId}`}
            className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535] hover:text-[#f5841f] focus-visible:text-[#f5841f] focus-visible:outline-none"
          >
            {role.roleName}
          </Link>
          {role.description && (
            <p className="max-w-xs truncate font-['Inter',sans-serif] text-xs text-gray-400">
              {role.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "code",
      header: t("security.fields.code"),
      cell: (role) => (
        <span className="inline-flex items-center gap-1.5">
          <span className={CODE_TEXT}>{role.roleCode}</span>
          {isProtectedRole(role.roleCode) && (
            <Lock
              className="size-3 text-[#f5841f]"
              aria-label={t("security.roles.builtIn")}
            />
          )}
        </span>
      ),
    },
    {
      key: "permissions",
      header: t("security.roles.columns.permissions"),
      className: `${TABLE_CELL_TEXT} text-center`,
      cell: (role) => role.permissionCount,
    },
    {
      key: "users",
      header: t("security.roles.columns.users"),
      className: `${TABLE_CELL_TEXT} text-center`,
      cell: (role) => role.userCount,
    },
    {
      key: "status",
      header: t("security.fields.status"),
      cell: (role) => <StatusBadge active={role.active} />,
    },
    {
      key: "createdAt",
      header: t("security.fields.createdAt"),
      className: `${TABLE_CELL_TEXT} whitespace-nowrap`,
      cell: (role) => formatDateTime(role.createdAt),
    },
    {
      key: "open",
      header: "",
      className: "w-10 text-right",
      cell: (role) => (
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link
            to={`/security/roles/${role.roleId}`}
            aria-label={t("security.roles.open", { name: role.roleName })}
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
        title={t("security.roles.title")}
        subtitle={t("security.roles.subtitle")}
        actions={
          <>
            {capabilities.canManageRoleAssignments && (
              <Button variant="outline" className="h-10" onClick={() => setBulkUsersOpen(true)}>
                <UsersRound className="size-4" />
                {t("security.bulk.userRolesButton")}
              </Button>
            )}
            {capabilities.canManagePermissionAssignments && (
              <Button variant="outline" className="h-10" onClick={() => setBulkPermissionsOpen(true)}>
                <Lock className="size-4" />
                {t("security.bulk.rolePermissionsButton")}
              </Button>
            )}
            {capabilities.canManageDefinitions && (
              <Button
                className="h-10 bg-[#1a2535] text-white hover:bg-[#243347]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                {t("security.roles.create")}
              </Button>
            )}
          </>
        }
      />

      <SecurityToolbar
        search={filters.search}
        onSearchChange={(value) => setFilters("roles", { search: value })}
        searchPlaceholder={t("security.roles.searchPlaceholder")}
      >
        <FilterSelect
          value={filters.status}
          onChange={(value) => setFilters("roles", { status: value })}
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
          rows={roles.data?.content ?? []}
          getRowKey={(role) => role.roleId}
          isLoading={roles.isLoading}
          error={roles.error}
          onRetry={() => roles.refetch()}
          emptyTitle={t("security.roles.empty")}
          isFiltered={Boolean(filters.search || filters.status)}
          minWidth={860}
          caption={t("security.roles.title")}
          footer={
            roles.data && (
              <SecurityPagination
                page={roles.data.page}
                size={roles.data.size}
                totalPages={roles.data.totalPages}
                totalElements={roles.data.totalElements}
                onPageChange={(page) => setPage("roles", page)}
                disabled={roles.isFetching}
              />
            )
          }
        />
      </SecurityCard>

      {capabilities.canManageDefinitions && (
        <RoleFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
      {capabilities.canManageRoleAssignments && (
        <BulkUserRolesDialog open={bulkUsersOpen} onOpenChange={setBulkUsersOpen} />
      )}
      {capabilities.canManagePermissionAssignments && (
        <BulkRolePermissionsDialog open={bulkPermissionsOpen} onOpenChange={setBulkPermissionsOpen} />
      )}
    </div>
  );
}
