import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContractTypeSettings } from "@/features/hr/hr-settings/api/use-contract-types";
import { ContractTypeFormDialog } from "@/features/hr/hr-settings/components/contract-type-form-dialog";
import { SettingStatusBadge } from "@/features/hr/hr-settings/components/setting-status-badge";
import { SettingsListShell } from "@/features/hr/hr-settings/components/settings-list-shell";
import type { ContractTypeSetting } from "@/lib/api/generated/model";

export function ContractTypesPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ContractTypeSetting>();

  const contractTypes = useContractTypeSettings(search || undefined, active, page);
  const rows = contractTypes.data?.content ?? [];

  function openCreate() {
    setEditingType(undefined);
    setFormOpen(true);
  }

  function openEdit(contractType: ContractTypeSetting) {
    setEditingType(contractType);
    setFormOpen(true);
  }

  return (
    <>
      <SettingsListShell
        title="Contract Types"
        subtitle="Manage the contract type reference list used on employee contracts."
        backLabel="HR Settings"
        backTo="/hr/settings"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        activeFilter={active}
        onActiveFilterChange={(value) => {
          setActive(value);
          setPage(0);
        }}
        addLabel="Add Contract Type"
        onAdd={openCreate}
        page={page}
        totalPages={contractTypes.data?.totalPages ?? 0}
        totalElements={contractTypes.data?.totalElements ?? 0}
        onPageChange={setPage}
      >
        {contractTypes.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            Loading contract types…
          </div>
        ) : contractTypes.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            Unable to load contract types.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            No contract types match the current filters.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((contractType) => (
                <TableRow key={contractType.contractTypeId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {contractType.code}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {contractType.name}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {contractType.usageCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <SettingStatusBadge active={contractType.active ?? false} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit contract type"
                      onClick={() => openEdit(contractType)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SettingsListShell>

      <ContractTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contractType={editingType}
      />
    </>
  );
}
