import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAccessGrants,
  useMyHrAccess,
} from "@/features/hr/access-delegation/api/use-hr-access";
import { GrantAccessDialog } from "@/features/hr/access-delegation/components/grant-access-dialog";
import { RevokeAccessDialog } from "@/features/hr/access-delegation/components/revoke-access-dialog";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { HrAccessGrantView } from "@/lib/api/generated/model";

function RevokeButton({ grant, onRevoke }: { grant: HrAccessGrantView; onRevoke: () => void }) {
  const { t } = useTranslation();

  if (!grant.active) {
    return (
      <span className="font-['Inter',sans-serif] text-xs text-gray-400">
        {t("accessDelegation.revoked")}
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={onRevoke}
    >
      {t("accessDelegation.revoke")}
    </Button>
  );
}

export function AccessDelegationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const myAccess = useMyHrAccess();
  const grants = useAccessGrants();
  const rows = grants.data ?? [];

  const [grantOpen, setGrantOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<HrAccessGrantView | undefined>();

  const canGrantAccess = myAccess.data?.canViewHr ?? false;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/hr/settings")}
            className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
          >
            ← {t("accessDelegation.backLabel")}
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {t("accessDelegation.title")}
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            {t("accessDelegation.subtitle")}
          </p>
        </div>

        {canGrantAccess && (
          <Button onClick={() => setGrantOpen(true)}>
            <Plus className="size-4" />
            {t("accessDelegation.grantAccess")}
          </Button>
        )}
      </div>

      {!myAccess.isLoading && !canGrantAccess ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-100 bg-white font-['Inter',sans-serif] text-sm text-gray-400">
          {t("accessDelegation.noPermission")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {grants.isLoading ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("accessDelegation.loading")}
            </div>
          ) : grants.isError ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
              {t("accessDelegation.unableToLoad")}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("accessDelegation.noGrants")}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#f4f6f9]">
                <TableRow>
                  <TableHead>{t("accessDelegation.columns.employee")}</TableHead>
                  <TableHead>{t("accessDelegation.columns.startDate")}</TableHead>
                  <TableHead>{t("accessDelegation.columns.endDate")}</TableHead>
                  <TableHead>{t("accessDelegation.columns.status")}</TableHead>
                  <TableHead>{t("accessDelegation.columns.reason")}</TableHead>
                  <TableHead className="text-right">{t("accessDelegation.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((grant) => (
                  <TableRow key={grant.hrAccessGrantId}>
                    <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                      {grant.displayName} ({grant.employeeNumber})
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(grant.startDate)}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(grant.endDate)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge active={grant.effective ?? false} />
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {grant.grantReason ?? "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <RevokeButton grant={grant} onRevoke={() => setRevokeTarget(grant)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <GrantAccessDialog open={grantOpen} onOpenChange={setGrantOpen} />

      {revokeTarget && (
        <RevokeAccessDialog
          open={revokeTarget != null}
          onOpenChange={(next) => !next && setRevokeTarget(undefined)}
          grant={revokeTarget}
        />
      )}
    </div>
  );
}
