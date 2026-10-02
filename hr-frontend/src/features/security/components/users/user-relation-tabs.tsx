import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type {
  SecurityLoginActivity,
  SecurityPage,
  SecurityPermissionSummary,
  SecurityRoleSummary,
  SecuritySession,
} from "@/features/security/api/security-types";
import {
  useSecurityUserActivity,
  useSecurityUserPermissions,
  useSecurityUserRoles,
  useSecurityUserSessions,
} from "@/features/security/api/use-security-users";
import {
  PermissionsRelationTable,
  RolesRelationTable,
} from "@/features/security/components/relation-tables";
import { SecurityCard } from "@/features/security/components/security-card";
import {
  SecurityDataTable,
  type SecurityColumn,
} from "@/features/security/components/security-data-table";
import { SecurityPagination } from "@/features/security/components/security-pagination";
import { CODE_TEXT, TABLE_CELL_TEXT } from "@/features/security/components/tab-styles";
import { formatDateTime } from "@/features/security/utils/format";

const NOWRAP = `${TABLE_CELL_TEXT} whitespace-nowrap`;
const AGENT = `${TABLE_CELL_TEXT} max-w-[260px] truncate`;

function dash(value: string | number | null) {
  return value ?? "—";
}

export function UserRolesTab({
  userId,
  firstPage,
}: {
  userId: number;
  firstPage: SecurityPage<SecurityRoleSummary>;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const roles = useSecurityUserRoles(userId, { page, size: SECURITY_DEFAULT_PAGE_SIZE }, firstPage);

  return (
    <SecurityCard
      flush
      title={t("security.users.detail.assignedRoles", { count: roles.data?.totalElements ?? 0 })}
    >
      <RolesRelationTable
        query={roles}
        onPageChange={setPage}
        emptyTitle={t("security.users.detail.noRoles")}
        caption={t("security.users.detail.rolesTab")}
      />
    </SecurityCard>
  );
}

export function UserPermissionsTab({
  userId,
  firstPage,
}: {
  userId: number;
  firstPage: SecurityPage<SecurityPermissionSummary>;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const permissions = useSecurityUserPermissions(
    userId,
    { page, size: SECURITY_DEFAULT_PAGE_SIZE },
    firstPage,
  );

  return (
    <SecurityCard
      flush
      title={t("security.users.detail.effectivePermissions", {
        count: permissions.data?.totalElements ?? 0,
      })}
    >
      <p className="border-b border-gray-100 px-5 py-2.5 font-['Inter',sans-serif] text-xs text-gray-400">
        {t("security.users.detail.effectivePermissionsHint")}
      </p>
      <PermissionsRelationTable
        query={permissions}
        onPageChange={setPage}
        emptyTitle={t("security.users.detail.noPermissions")}
        caption={t("security.users.detail.permissionsTab")}
      />
    </SecurityCard>
  );
}

/** SYSTEM_ADMIN only — only mounted when telemetry is permitted. */
export function UserActivityTab({ userId }: { userId: number }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const activity = useSecurityUserActivity(userId, { page, size: SECURITY_DEFAULT_PAGE_SIZE }, true);

  const columns: SecurityColumn<SecurityLoginActivity>[] = [
    {
      key: "createdAt",
      header: t("security.activity.time"),
      className: NOWRAP,
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "result",
      header: t("security.activity.result"),
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 font-['Inter',sans-serif] text-xs font-medium ${
            row.success ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {row.success ? t("security.activity.success") : t("security.activity.failed")}
        </span>
      ),
    },
    {
      key: "failureReason",
      header: t("security.activity.failureReason"),
      className: TABLE_CELL_TEXT,
      cell: (row) => dash(row.failureReason),
    },
    { key: "ipAddress", header: t("security.activity.ipAddress"), className: CODE_TEXT, cell: (row) => dash(row.ipAddress) },
    {
      key: "userAgent",
      header: t("security.activity.userAgent"),
      className: AGENT,
      cell: (row) => <span title={row.userAgent ?? undefined}>{dash(row.userAgent)}</span>,
    },
    {
      key: "client",
      header: t("security.activity.clientApplication"),
      className: TABLE_CELL_TEXT,
      cell: (row) => dash(row.clientApplicationId),
    },
  ];

  return (
    <SecurityCard flush title={t("security.users.detail.activityTab")}>
      <p className="border-b border-gray-100 px-5 py-2.5 font-['Inter',sans-serif] text-xs text-gray-400">
        {t("security.users.detail.activityHint")}
      </p>
      <SecurityDataTable
        columns={columns}
        rows={activity.data?.content ?? []}
        getRowKey={(row) => row.loginAttemptId}
        isLoading={activity.isLoading}
        error={activity.error}
        onRetry={() => activity.refetch()}
        emptyTitle={t("security.users.detail.noActivity")}
        caption={t("security.users.detail.activityTab")}
        minWidth={880}
        footer={
          activity.data && (
            <SecurityPagination
              page={activity.data.page}
              size={activity.data.size}
              totalPages={activity.data.totalPages}
              totalElements={activity.data.totalElements}
              onPageChange={setPage}
              disabled={activity.isFetching}
            />
          )
        }
      />
    </SecurityCard>
  );
}

/** SYSTEM_ADMIN only — only mounted when telemetry is permitted. */
export function UserSessionsTab({ userId }: { userId: number }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const sessions = useSecurityUserSessions(userId, { page, size: SECURITY_DEFAULT_PAGE_SIZE }, true);

  const columns: SecurityColumn<SecuritySession>[] = [
    {
      key: "startedAt",
      header: t("security.sessions.startedAt"),
      className: NOWRAP,
      cell: (row) => formatDateTime(row.startedAt),
    },
    {
      key: "lastSeenAt",
      header: t("security.sessions.lastSeenAt"),
      className: NOWRAP,
      cell: (row) => formatDateTime(row.lastSeenAt),
    },
    {
      key: "expiresAt",
      header: t("security.sessions.expiresAt"),
      className: NOWRAP,
      cell: (row) => formatDateTime(row.expiresAt),
    },
    {
      key: "revoked",
      header: t("security.sessions.revoked"),
      className: TABLE_CELL_TEXT,
      cell: (row) =>
        row.revokedAt ? (
          <span title={row.revokeReason ?? undefined}>
            {formatDateTime(row.revokedAt)}
            {row.revokeReason && (
              <span className="block text-xs text-gray-400">{row.revokeReason}</span>
            )}
          </span>
        ) : (
          "—"
        ),
    },
    { key: "ipAddress", header: t("security.sessions.ipAddress"), className: CODE_TEXT, cell: (row) => dash(row.ipAddress) },
    {
      key: "userAgent",
      header: t("security.sessions.userAgent"),
      className: AGENT,
      cell: (row) => <span title={row.userAgent ?? undefined}>{dash(row.userAgent)}</span>,
    },
    {
      key: "client",
      header: t("security.sessions.clientApplication"),
      className: TABLE_CELL_TEXT,
      cell: (row) => dash(row.clientApplicationId),
    },
  ];

  return (
    <SecurityCard flush title={t("security.users.detail.sessionsTab")}>
      <SecurityDataTable
        columns={columns}
        rows={sessions.data?.content ?? []}
        getRowKey={(row) => row.sessionId}
        isLoading={sessions.isLoading}
        error={sessions.error}
        onRetry={() => sessions.refetch()}
        emptyTitle={t("security.users.detail.noSessions")}
        caption={t("security.users.detail.sessionsTab")}
        minWidth={980}
        footer={
          sessions.data && (
            <SecurityPagination
              page={sessions.data.page}
              size={sessions.data.size}
              totalPages={sessions.data.totalPages}
              totalElements={sessions.data.totalElements}
              onPageChange={setPage}
              disabled={sessions.isFetching}
            />
          )
        }
      />
    </SecurityCard>
  );
}
