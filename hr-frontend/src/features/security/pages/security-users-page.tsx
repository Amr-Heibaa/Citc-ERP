import { ChevronRight, Plus, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type {
  SecurityUserStatus,
  SecurityUserSummary,
} from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useAllSecurityRoles } from "@/features/security/api/use-security-roles";
import { useSecurityUsers } from "@/features/security/api/use-security-users";
import { BulkUserRolesDialog } from "@/features/security/components/bulk/bulk-user-roles-dialog";
import { CreateUserDialog } from "@/features/security/components/forms/create-user-dialog";
import { RoleChips } from "@/features/security/components/role-chips";
import { SecurityCard } from "@/features/security/components/security-card";
import {
  SecurityDataTable,
  type SecurityColumn,
} from "@/features/security/components/security-data-table";
import { SecurityPageHeader } from "@/features/security/components/security-page-header";
import { SecurityPagination } from "@/features/security/components/security-pagination";
import { FilterSelect, SecurityToolbar } from "@/features/security/components/security-toolbar";
import { TABLE_CELL_TEXT } from "@/features/security/components/tab-styles";
import { useSecurityFiltersStore } from "@/features/security/store/security-filters-store";
import { isUserActive, userLabel } from "@/features/security/utils/assignment-items";
import { formatDateTime } from "@/features/security/utils/format";
import { useDebouncedValue } from "@/features/security/utils/use-debounced-value";
import { initials } from "@/features/hr/shared/utils/format";

// IAM status codes accepted by the users status filter.
const USER_STATUSES: SecurityUserStatus[] = ["ACTIVE", "INACTIVE"];

export function SecurityUsersPage() {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const filters = useSecurityFiltersStore((state) => state.lists.users);
  const setFilters = useSecurityFiltersStore((state) => state.setFilters);
  const setPage = useSecurityFiltersStore((state) => state.setPage);
  const search = useDebouncedValue(filters.search.trim());

  const [bulkOpen, setBulkOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const roles = useAllSecurityRoles();
  const users = useSecurityUsers({
    page: filters.page,
    size: SECURITY_DEFAULT_PAGE_SIZE,
    search: search || undefined,
    status: (filters.status || undefined) as SecurityUserStatus | undefined,
    roleId: filters.roleId ? Number(filters.roleId) : undefined,
  });

  const columns: SecurityColumn<SecurityUserSummary>[] = [
    {
      key: "user",
      header: t("security.users.columns.user"),
      cell: (user) => (
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5841f] font-['Inter',sans-serif] text-xs font-bold text-white"
          >
            {initials(userLabel(user))}
          </span>
          <div className="min-w-0">
            <Link
              to={`/security/users/${user.userId}`}
              className="block truncate font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535] hover:text-[#f5841f] focus-visible:text-[#f5841f] focus-visible:outline-none"
            >
              {userLabel(user)}
            </Link>
            <p className="truncate font-['Inter',sans-serif] text-xs text-gray-400">{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "employee",
      header: t("security.users.columns.employee"),
      className: TABLE_CELL_TEXT,
      cell: (user) => user.employeeNumber ?? t("security.users.notLinked"),
    },
    {
      key: "email",
      header: t("security.users.columns.email"),
      className: `${TABLE_CELL_TEXT} max-w-[220px] truncate`,
      cell: (user) => user.email ?? "—",
    },
    {
      key: "status",
      header: t("security.users.columns.status"),
      cell: (user) => <StatusBadge active={isUserActive(user)} />,
    },
    {
      key: "roles",
      header: t("security.users.columns.roles"),
      cell: (user) => <RoleChips roles={user.roles} />,
    },
    {
      key: "lastAccess",
      header: t("security.users.columns.lastAccess"),
      className: `${TABLE_CELL_TEXT} whitespace-nowrap`,
      cell: (user) => (user.lastAccess ? formatDateTime(user.lastAccess) : t("security.users.never")),
    },
    {
      key: "open",
      header: "",
      className: "w-10 text-right",
      cell: (user) => (
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link
            to={`/security/users/${user.userId}`}
            aria-label={t("security.users.open", { name: userLabel(user) })}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      ),
    },
  ];

  const isFiltered = Boolean(filters.search || filters.status || filters.roleId);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityPageHeader
        title={t("security.users.title")}
        subtitle={t("security.users.subtitle")}
        actions={
          <>
            {capabilities.canManageRoleAssignments && (
              <Button variant="outline" className="h-10" onClick={() => setBulkOpen(true)}>
                <UsersRound className="size-4" />
                {t("security.bulk.userRolesButton")}
              </Button>
            )}
            {capabilities.isSystemAdmin && (
              <Button
                className="h-10 bg-[#1a2535] text-white hover:bg-[#243347]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                {t("security.users.addUser")}
              </Button>
            )}
          </>
        }
      />

      <SecurityToolbar
        search={filters.search}
        onSearchChange={(value) => setFilters("users", { search: value })}
        searchPlaceholder={t("security.users.searchPlaceholder")}
      >
        <FilterSelect
          value={filters.status}
          onChange={(value) => setFilters("users", { status: value })}
          allLabel={t("security.filters.allStatuses")}
          ariaLabel={t("security.filters.status")}
          options={USER_STATUSES.map((status) => ({
            value: status,
            label: status === "ACTIVE" ? t("common.active") : t("common.inactive"),
          }))}
        />
        <FilterSelect
          value={filters.roleId}
          onChange={(value) => setFilters("users", { roleId: value })}
          allLabel={t("security.filters.allRoles")}
          ariaLabel={t("security.filters.role")}
          className="lg:w-56"
          options={(roles.data ?? []).map((role) => ({
            value: String(role.roleId),
            label: role.roleName,
          }))}
        />
      </SecurityToolbar>

      <SecurityCard flush>
        <SecurityDataTable
          columns={columns}
          rows={users.data?.content ?? []}
          getRowKey={(user) => user.userId}
          isLoading={users.isLoading}
          error={users.error}
          onRetry={() => users.refetch()}
          emptyTitle={t("security.users.empty")}
          isFiltered={isFiltered}
          minWidth={960}
          caption={t("security.users.title")}
          footer={
            users.data && (
              <SecurityPagination
                page={users.data.page}
                size={users.data.size}
                totalPages={users.data.totalPages}
                totalElements={users.data.totalElements}
                onPageChange={(page) => setPage("users", page)}
                disabled={users.isFetching}
              />
            )
          }
        />
      </SecurityCard>

      {capabilities.canManageRoleAssignments && (
        <BulkUserRolesDialog open={bulkOpen} onOpenChange={setBulkOpen} />
      )}
      {capabilities.isSystemAdmin && (
        <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
