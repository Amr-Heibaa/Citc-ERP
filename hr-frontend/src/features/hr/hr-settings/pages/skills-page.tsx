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
import { useSkills } from "@/features/hr/hr-settings/api/use-skills";
import { SettingStatusBadge } from "@/features/hr/hr-settings/components/setting-status-badge";
import { SettingsListShell } from "@/features/hr/hr-settings/components/settings-list-shell";
import { SkillFormDialog } from "@/features/hr/hr-settings/components/skill-form-dialog";
import type { SkillSetting } from "@/lib/api/generated/model";

export function SkillsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillSetting>();

  const skills = useSkills(search || undefined, active, page);
  const rows = skills.data?.content ?? [];

  function openCreate() {
    setEditingSkill(undefined);
    setFormOpen(true);
  }

  function openEdit(skill: SkillSetting) {
    setEditingSkill(skill);
    setFormOpen(true);
  }

  return (
    <>
      <SettingsListShell
        title={t("hrSettings.skills.title")}
        subtitle={t("hrSettings.skills.subtitle")}
        backLabel={t("hrSettings.skills.backLabel")}
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
        addLabel={t("hrSettings.skills.addLabel")}
        onAdd={openCreate}
        page={page}
        totalPages={skills.data?.totalPages ?? 0}
        totalElements={skills.data?.totalElements ?? 0}
        onPageChange={setPage}
      >
        {skills.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.skills.loading")}
          </div>
        ) : skills.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            {t("hrSettings.skills.unableToLoad")}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.skills.noResults")}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>{t("hrSettings.skills.columns.nameEn")}</TableHead>
                <TableHead>{t("hrSettings.skills.columns.nameAr")}</TableHead>
                <TableHead>{t("hrSettings.skills.columns.usage")}</TableHead>
                <TableHead>{t("hrSettings.skills.columns.status")}</TableHead>
                <TableHead className="text-right">{t("hrSettings.skills.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((skill) => (
                <TableRow key={skill.skillId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {skill.nameEn}
                  </TableCell>

                  <TableCell dir="rtl" className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {skill.nameAr}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {skill.usageCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <SettingStatusBadge active={skill.active ?? false} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("hrSettings.skills.editTooltip")}
                      onClick={() => openEdit(skill)}
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

      <SkillFormDialog open={formOpen} onOpenChange={setFormOpen} skill={editingSkill} />
    </>
  );
}
