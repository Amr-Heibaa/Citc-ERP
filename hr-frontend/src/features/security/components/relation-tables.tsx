import type { UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import type {
  SecurityPage,
  SecurityPermissionSummary,
  SecurityRoleSummary,
  SecurityUserSummary,
} from "@/features/security/api/security-types";
import { RoleChips } from "@/features/security/components/role-chips";
import {
  SecurityDataTable,
  type SecurityColumn,
} from "@/features/security/components/security-data-table";
import { SecurityPagination } from "@/features/security/components/security-pagination";
import { CODE_TEXT, TABLE_CELL_TEXT } from "@/features/security/components/tab-styles";
import { isUserActive, userLabel } from "@/features/security/utils/assignment-items";
import { formatDateTime } from "@/features/security/utils/format";

const LINK_CLASS =
  "font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535] hover:text-[#f5841f] focus-visible:text-[#f5841f] focus-visible:outline-none";

type PagedQuery<T> = Pick<
  UseQueryResult<SecurityPage<T>, unknown>,
  "data" | "isLoading" | "isFetching" | "error" | "refetch"
>;

function PagedRelationTable<T>({
  query,
  columns,
  getRowKey,
  onPageChange,
  emptyTitle,
  caption,
  minWidth,
}: {
  query: PagedQuery<T>;
  columns: SecurityColumn<T>[];
  getRowKey: (row: T) => number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  caption: string;
  minWidth?: number;
}) {
  return (
    <SecurityDataTable
      columns={columns}
      rows={query.data?.content ?? []}
      getRowKey={getRowKey}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      emptyTitle={emptyTitle}
      caption={caption}
      minWidth={minWidth ?? 640}
      footer={
        query.data && (
          <SecurityPagination
            page={query.data.page}
            size={query.data.size}
            totalPages={query.data.totalPages}
            totalElements={query.data.totalElements}
            onPageChange={onPageChange}
            disabled={query.isFetching}
          />
        )
      }
    />
  );
}

export function RolesRelationTable({
  query,
  onPageChange,
  emptyTitle,
  caption,
}: {
  query: PagedQuery<SecurityRoleSummary>;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  caption: string;
}) {
  const { t } = useTranslation();

  return (
    <PagedRelationTable
      query={query}
      getRowKey={(role) => role.roleId}
      onPageChange={onPageChange}
      emptyTitle={emptyTitle}
      caption={caption}
      columns={[
        {
          key: "name",
          header: t("security.roles.columns.role"),
          cell: (role) => (
            <Link to={`/security/roles/${role.roleId}`} className={LINK_CLASS}>
              {role.roleName}
            </Link>
          ),
        },
        { key: "code", header: t("security.fields.code"), className: CODE_TEXT, cell: (role) => role.roleCode },
        {
          key: "status",
          header: t("security.fields.status"),
          cell: (role) => <StatusBadge active={role.active} />,
        },
      ]}
    />
  );
}

export function PermissionsRelationTable({
  query,
  onPageChange,
  emptyTitle,
  caption,
  showModule = true,
}: {
  query: PagedQuery<SecurityPermissionSummary>;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  caption: string;
  showModule?: boolean;
}) {
  const { t } = useTranslation();

  const columns: SecurityColumn<SecurityPermissionSummary>[] = [
    {
      key: "name",
      header: t("security.permissions.columns.permission"),
      cell: (permission) => (
        <Link to={`/security/permissions/${permission.permissionId}`} className={LINK_CLASS}>
          {permission.permissionName}
        </Link>
      ),
    },
    {
      key: "code",
      header: t("security.fields.code"),
      className: CODE_TEXT,
      cell: (permission) => permission.permissionCode,
    },
    ...(showModule
      ? [
          {
            key: "module",
            header: t("security.fields.module"),
            className: TABLE_CELL_TEXT,
            cell: (permission: SecurityPermissionSummary) =>
              permission.applicationName ?? t("security.permissions.noModule"),
          },
        ]
      : [
          {
            key: "description",
            header: t("security.fields.description"),
            className: `${TABLE_CELL_TEXT} max-w-xs truncate`,
            cell: (permission: SecurityPermissionSummary) => permission.description ?? "—",
          },
        ]),
    {
      key: "status",
      header: t("security.fields.status"),
      cell: (permission) => <StatusBadge active={permission.active} />,
    },
  ];

  return (
    <PagedRelationTable
      query={query}
      getRowKey={(permission) => permission.permissionId}
      onPageChange={onPageChange}
      emptyTitle={emptyTitle}
      caption={caption}
      columns={columns}
    />
  );
}

export function UsersRelationTable({
  query,
  onPageChange,
  emptyTitle,
  caption,
}: {
  query: PagedQuery<SecurityUserSummary>;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  caption: string;
}) {
  const { t } = useTranslation();

  return (
    <PagedRelationTable
      query={query}
      getRowKey={(user) => user.userId}
      onPageChange={onPageChange}
      emptyTitle={emptyTitle}
      caption={caption}
      minWidth={760}
      columns={[
        {
          key: "user",
          header: t("security.users.columns.user"),
          cell: (user) => (
            <div>
              <Link to={`/security/users/${user.userId}`} className={LINK_CLASS}>
                {userLabel(user)}
              </Link>
              <p className="font-['Inter',sans-serif] text-xs text-gray-400">{user.username}</p>
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
          key: "status",
          header: t("security.fields.status"),
          cell: (user) => <StatusBadge active={isUserActive(user)} />,
        },
        {
          key: "roles",
          header: t("security.users.columns.roles"),
          cell: (user) => <RoleChips roles={user.roles} max={2} />,
        },
        {
          key: "lastAccess",
          header: t("security.users.columns.lastAccess"),
          className: `${TABLE_CELL_TEXT} whitespace-nowrap`,
          cell: (user) => formatDateTime(user.lastAccess),
        },
      ]}
    />
  );
}
