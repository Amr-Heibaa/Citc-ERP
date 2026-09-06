import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeeStatuses } from "@/features/hr/hr-settings/api/use-employee-statuses";
import { EmployeeStatusFormDialog } from "@/features/hr/hr-settings/components/employee-status-form-dialog";
import { SettingStatusBadge } from "@/features/hr/hr-settings/components/setting-status-badge";
import { SettingsListShell } from "@/features/hr/hr-settings/components/settings-list-shell";
import type { EmployeeStatusSetting } from "@/lib/api/generated/model";

export function EmployeeStatusesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<EmployeeStatusSetting>();

  const statuses = useEmployeeStatuses(search || undefined, active, page);
  const rows = statuses.data?.content ?? [];

  function openCreate() {
    setEditingStatus(undefined);
    setFormOpen(true);
  }

  function openEdit(status: EmployeeStatusSetting) {
    setEditingStatus(status);
    setFormOpen(true);
  }

  return (
    <>
      <SettingsListShell
        title={t("hrSettings.employeeStatuses.title")}
        subtitle={t("hrSettings.employeeStatuses.subtitle")}
        backLabel={t("hrSettings.employeeStatuses.backLabel")}
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
        addLabel={t("hrSettings.employeeStatuses.addLabel")}
        onAdd={openCreate}
        page={page}
        totalPages={statuses.data?.totalPages ?? 0}
        totalElements={statuses.data?.totalElements ?? 0}
        onPageChange={setPage}
      >
        {statuses.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.employeeStatuses.loading")}
          </div>
        ) : statuses.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            {t("hrSettings.employeeStatuses.unableToLoad")}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.employeeStatuses.noResults")}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>{t("hrSettings.employeeStatuses.columns.code")}</TableHead>
                <TableHead>{t("hrSettings.employeeStatuses.columns.nameEn")}</TableHead>
                <TableHead>{t("hrSettings.employeeStatuses.columns.nameAr")}</TableHead>
                <TableHead>{t("hrSettings.employeeStatuses.columns.usage")}</TableHead>
                <TableHead>{t("hrSettings.employeeStatuses.columns.status")}</TableHead>
                <TableHead className="text-right">
                  {t("hrSettings.employeeStatuses.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((status) => (
                <TableRow key={status.employeeStatusId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {status.code}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {status.nameEn}
                  </TableCell>

                  <TableCell dir="rtl" className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {status.nameAr}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {status.usageCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <SettingStatusBadge active={status.active ?? false} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("hrSettings.employeeStatuses.editTooltip")}
                      onClick={() => openEdit(status)}
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

      <EmployeeStatusFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        status={editingStatus}
      />
    </>
  );
}
