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
import { useFunctionalRelationTypes } from "@/features/hr/hr-settings/api/use-functional-relation-types";
import { FunctionalRelationTypeFormDialog } from "@/features/hr/hr-settings/components/functional-relation-type-form-dialog";
import { SettingStatusBadge } from "@/features/hr/hr-settings/components/setting-status-badge";
import { SettingsListShell } from "@/features/hr/hr-settings/components/settings-list-shell";
import type { FunctionalRelationTypeSetting } from "@/lib/api/generated/model";

export function FunctionalRelationTypesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<FunctionalRelationTypeSetting>();

  const relationTypes = useFunctionalRelationTypes(search || undefined, active, page);
  const rows = relationTypes.data?.content ?? [];

  function openCreate() {
    setEditingType(undefined);
    setFormOpen(true);
  }

  function openEdit(relationType: FunctionalRelationTypeSetting) {
    setEditingType(relationType);
    setFormOpen(true);
  }

  return (
    <>
      <SettingsListShell
        title={t("hrSettings.functionalRelationTypes.title")}
        subtitle={t("hrSettings.functionalRelationTypes.subtitle")}
        backLabel={t("hrSettings.functionalRelationTypes.backLabel")}
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
        addLabel={t("hrSettings.functionalRelationTypes.addLabel")}
        onAdd={openCreate}
        page={page}
        totalPages={relationTypes.data?.totalPages ?? 0}
        totalElements={relationTypes.data?.totalElements ?? 0}
        onPageChange={setPage}
      >
        {relationTypes.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.functionalRelationTypes.loading")}
          </div>
        ) : relationTypes.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            {t("hrSettings.functionalRelationTypes.unableToLoad")}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.functionalRelationTypes.noResults")}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>{t("hrSettings.functionalRelationTypes.columns.code")}</TableHead>
                <TableHead>{t("hrSettings.functionalRelationTypes.columns.nameEn")}</TableHead>
                <TableHead>{t("hrSettings.functionalRelationTypes.columns.nameAr")}</TableHead>
                <TableHead>{t("hrSettings.functionalRelationTypes.columns.approval")}</TableHead>
                <TableHead>{t("hrSettings.functionalRelationTypes.columns.usage")}</TableHead>
                <TableHead>{t("hrSettings.functionalRelationTypes.columns.status")}</TableHead>
                <TableHead className="text-right">
                  {t("hrSettings.functionalRelationTypes.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((relationType) => (
                <TableRow key={relationType.functionalRelationTypeId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {relationType.code}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {relationType.nameEn}
                  </TableCell>

                  <TableCell dir="rtl" className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {relationType.nameAr}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {relationType.approvalRelation ? t("common.yes") : t("common.no")}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {relationType.usageCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <SettingStatusBadge active={relationType.active ?? false} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("hrSettings.functionalRelationTypes.editTooltip")}
                      onClick={() => openEdit(relationType)}
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

      <FunctionalRelationTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        relationType={editingType}
      />
    </>
  );
}
