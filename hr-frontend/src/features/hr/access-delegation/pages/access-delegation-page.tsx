import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

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
  useRevokeHrAccess,
} from "@/features/hr/access-delegation/api/use-hr-access";
import { GrantAccessDialog } from "@/features/hr/access-delegation/components/grant-access-dialog";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { HrAccessGrantView } from "@/lib/api/generated/model";

function RevokeButton({ grant }: { grant: HrAccessGrantView }) {
  const revokeAccess = useRevokeHrAccess(grant.hrAccessGrantId ?? 0);

  async function handleRevoke() {
    const reason = window.prompt("Reason for revoking this access?");

    if (!reason || reason.trim().length < 5) {
      if (reason !== null) {
        toast.error("Reason must be at least 5 characters");
      }
      return;
    }

    try {
      await revokeAccess.mutateAsync({ reason: reason.trim() });
      toast.success("Access revoked");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to revoke access",
      );
    }
  }

  if (!grant.active) {
    return <span className="font-['Inter',sans-serif] text-xs text-gray-400">Revoked</span>;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      disabled={revokeAccess.isPending}
      onClick={handleRevoke}
    >
      Revoke
    </Button>
  );
}

export function AccessDelegationPage() {
  const navigate = useNavigate();
  const myAccess = useMyHrAccess();
  const grants = useAccessGrants();
  const rows = grants.data ?? [];

  const [grantOpen, setGrantOpen] = useState(false);

  const canManageDelegation = myAccess.data?.canManageDelegation ?? false;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/hr/settings")}
            className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
          >
            ← HR Settings
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            HR Access Delegation
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            Grant employees temporary HR view and edit access
          </p>
        </div>

        {canManageDelegation && (
          <Button onClick={() => setGrantOpen(true)}>
            <Plus className="size-4" />
            Grant Access
          </Button>
        )}
      </div>

      {!myAccess.isLoading && !canManageDelegation ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-100 bg-white font-['Inter',sans-serif] text-sm text-gray-400">
          You don&apos;t have permission to manage HR access delegation.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {grants.isLoading ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              Loading access grants…
            </div>
          ) : grants.isError ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
              Unable to load access grants.
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              No HR access has been granted yet.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#f4f6f9]">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <RevokeButton grant={grant} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <GrantAccessDialog open={grantOpen} onOpenChange={setGrantOpen} />
    </div>
  );
}
