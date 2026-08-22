import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  useOrganizationUnitRelationships,
  useRemoveOrganizationUnitRelationship,
} from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import { UnitRelationshipFormDialog } from "@/features/hr/organizations/components/unit-relationship-form-dialog";
import { UnitTabToolbar } from "@/features/hr/organizations/components/unit-tab-toolbar";
import { downloadUnitCsv } from "@/features/hr/organizations/utils/organization-unit-export";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { UnitRelationship } from "@/lib/api/generated/model";

const NO_RELATIONSHIPS: UnitRelationship[] = [];

export function UnitRelationshipsTab({
  organizationId,
  orgUnitId,
}: {
  organizationId: number;
  orgUnitId: number;
}) {
  const [search, setSearch] =
    useState("");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingRelationship,
    setEditingRelationship,
  ] =
    useState<UnitRelationship>();

  const [
    removingRelationship,
    setRemovingRelationship,
  ] =
    useState<UnitRelationship>();

  const relationshipsQuery =
    useOrganizationUnitRelationships(
      orgUnitId,
    );

  const removeRelationship =
    useRemoveOrganizationUnitRelationship(
      orgUnitId,
    );

  const relationships =
    relationshipsQuery.data ??
    NO_RELATIONSHIPS;

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return relationships;
    }

    return relationships.filter(
      (relationship) =>
        relationship.fromUnit
          ?.toLowerCase()
          .includes(query) ||
        relationship.toUnit
          ?.toLowerCase()
          .includes(query) ||
        relationship.type
          ?.toLowerCase()
          .includes(query) ||
        relationship.status
          ?.toLowerCase()
          .includes(query),
    );
  }, [
    relationships,
    search,
  ]);

  function handleExport() {
    downloadUnitCsv(
      `unit-${orgUnitId}-relationships.csv`,
      filtered.map(
        (relationship) => ({
          "From Unit":
            relationship.fromUnit,
          "Relationship Type":
            relationship.type,
          "To Unit":
            relationship.toUnit,
          "Start Date":
            relationship.startDate,
          "End Date":
            relationship.endDate,
          Status:
            relationship.status,
        }),
      ),
    );
  }

  function openCreate() {
    setEditingRelationship(
      undefined,
    );
    setFormOpen(true);
  }

  function openEdit(
    relationship:
      UnitRelationship,
  ) {
    setEditingRelationship(
      relationship,
    );
    setFormOpen(true);
  }

  async function confirmRemove() {
    const relationshipId =
      removingRelationship?.id;

    if (
      relationshipId == null
    ) {
      return;
    }

    try {
      await removeRelationship.mutateAsync(
        relationshipId,
      );

      toast.success(
        "Relationship removed successfully",
      );

      setRemovingRelationship(
        undefined,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove relationship",
      );
    }
  }

  if (
    relationshipsQuery.isLoading
  ) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading unit relationships…
      </div>
    );
  }

  if (
    relationshipsQuery.isError
  ) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        Unable to load unit relationships.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <UnitTabToolbar
          search={search}
          onSearchChange={
            setSearch
          }
          placeholder="Search relationships..."
          exportDisabled={
            filtered.length === 0
          }
          onExport={
            handleExport
          }
        >
          <Button
            onClick={
              openCreate
            }
            className="gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            <Plus className="size-4" />
            Add Relationship
          </Button>
        </UnitTabToolbar>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No relationships found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead className="px-4">
                  From Unit
                </TableHead>

                <TableHead>
                  Relationship Type
                </TableHead>

                <TableHead>
                  To Unit
                </TableHead>

                <TableHead>
                  Start Date
                </TableHead>

                <TableHead>
                  End Date
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map(
                (
                  relationship,
                  index,
                ) => (
                  <TableRow
                    key={
                      relationship.id ??
                      `${relationship.fromUnitId}-${relationship.toUnitId}-${index}`
                    }
                  >
                    <TableCell className="px-4 font-medium text-[#1a2535]">
                      {relationship.fromUnit ??
                        "—"}
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {relationship.type ??
                        "—"}
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {relationship.toUnit ??
                        "—"}
                    </TableCell>

                    <TableCell className="text-sm text-gray-500">
                      {formatDate(
                        relationship.startDate,
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-gray-500">
                      {formatDate(
                        relationship.endDate,
                      )}
                    </TableCell>

                    <TableCell>
                      <OrganizationStatusBadge
                        status={
                          relationship.status
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            relationship.id ==
                            null
                          }
                          title="Edit relationship"
                          onClick={() =>
                            openEdit(
                              relationship,
                            )
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            relationship.id ==
                            null
                          }
                          title="Remove relationship"
                          onClick={() =>
                            setRemovingRelationship(
                              relationship,
                            )
                          }
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <UnitRelationshipFormDialog
        open={formOpen}
        onOpenChange={
          setFormOpen
        }
        organizationId={
          organizationId
        }
        orgUnitId={
          orgUnitId
        }
        relationship={
          editingRelationship
        }
      />

      <AlertDialog
        open={
          removingRelationship !=
          null
        }
        onOpenChange={(
          open,
        ) => {
          if (!open) {
            setRemovingRelationship(
              undefined,
            );
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove relationship?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This relationship
              will be marked as
              inactive and removed
              from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                removeRelationship.isPending
              }
              onClick={
                confirmRemove
              }
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removeRelationship.isPending
                ? "Removing…"
                : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}