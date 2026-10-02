import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DualPanelTransfer,
  type TransferItem,
} from "@/features/security/components/dual-panel-transfer";
import { MAX_ASSIGNMENT_IDS } from "@/features/security/schemas/assignment-limits";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

export function WarningNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 font-['Inter',sans-serif] text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

function sameSet(first: number[], second: number[]) {
  if (first.length !== second.length) return false;
  const lookup = new Set(first);
  return second.every((id) => lookup.has(id));
}

/**
 * Stateful body of a replace-style assignment (PUT …/{id}/{relation} with the
 * complete id set). Mount it only once the current assignment has loaded and
 * remount (key) to reset — it seeds its state from initialIds.
 */
export function AssignmentEditor({
  items,
  initialIds,
  availableLabel,
  assignedLabel,
  searchPlaceholder,
  onSave,
  onCancel,
  onSaved,
  saveLabel,
  successMessage,
  errorFallbackKey,
  footerStart,
}: {
  items: TransferItem[];
  initialIds: number[];
  availableLabel: string;
  assignedLabel: string;
  searchPlaceholder: string;
  onSave: (ids: number[]) => Promise<unknown>;
  onCancel: () => void;
  onSaved: () => void;
  saveLabel: string;
  successMessage: string;
  errorFallbackKey: string;
  footerStart?: ReactNode;
}) {
  const { t } = useTranslation();
  const [ids, setIds] = useState(initialIds);
  const [saving, setSaving] = useState(false);

  const initial = new Set(initialIds);
  const current = new Set(ids);
  const added = ids.filter((id) => !initial.has(id)).length;
  const removed = initialIds.filter((id) => !current.has(id)).length;
  const unchanged = sameSet(ids, initialIds);
  const overLimit = ids.length > MAX_ASSIGNMENT_IDS;

  async function save() {
    setSaving(true);
    try {
      await onSave(ids);
      toast.success(successMessage);
      onSaved();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, errorFallbackKey));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DualPanelTransfer
        items={items}
        value={ids}
        onChange={setIds}
        availableLabel={availableLabel}
        assignedLabel={assignedLabel}
        searchPlaceholder={searchPlaceholder}
        disabled={saving}
      />

      {overLimit && (
        <p role="alert" className="font-['Inter',sans-serif] text-sm text-red-600">
          {t("security.transfer.overLimit", { max: MAX_ASSIGNMENT_IDS })}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-['Inter',sans-serif] text-sm text-gray-500" aria-live="polite">
          {footerStart ??
            (unchanged
              ? t("security.transfer.noChanges")
              : t("security.transfer.changes", { added, removed }))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={saving || unchanged || overLimit}
            className="bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            {saving ? t("security.transfer.saving") : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
