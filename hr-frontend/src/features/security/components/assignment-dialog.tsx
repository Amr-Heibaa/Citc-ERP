import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentEditor } from "@/features/security/components/assignment-editor";
import type { TransferItem } from "@/features/security/components/dual-panel-transfer";
import { ErrorState, PanelSkeleton } from "@/features/security/components/security-states";

/** Dialog wrapper around AssignmentEditor for role/permission/module membership. */
export function AssignmentDialog({
  open,
  onOpenChange,
  title,
  description,
  warning,
  isLoading,
  error,
  onRetry,
  items,
  initialIds,
  availableLabel,
  assignedLabel,
  searchPlaceholder,
  onSave,
  saveLabel,
  successMessage,
  errorFallbackKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  warning?: ReactNode;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  items: TransferItem[];
  initialIds: number[] | undefined;
  availableLabel: string;
  assignedLabel: string;
  searchPlaceholder: string;
  onSave: (ids: number[]) => Promise<unknown>;
  saveLabel: string;
  successMessage: string;
  errorFallbackKey: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="font-['Space_Grotesk',sans-serif] text-xl text-[#1a2535]">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          {warning}

          {error ? (
            <ErrorState error={error} onRetry={onRetry} />
          ) : isLoading || !initialIds ? (
            <PanelSkeleton rows={6} />
          ) : (
            <AssignmentEditor
              items={items}
              initialIds={initialIds}
              availableLabel={availableLabel}
              assignedLabel={assignedLabel}
              searchPlaceholder={searchPlaceholder}
              onSave={onSave}
              onCancel={() => onOpenChange(false)}
              onSaved={() => onOpenChange(false)}
              saveLabel={saveLabel}
              successMessage={successMessage}
              errorFallbackKey={errorFallbackKey}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
