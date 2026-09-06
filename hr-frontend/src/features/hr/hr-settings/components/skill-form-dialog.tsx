import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateSkill, useUpdateSkill } from "@/features/hr/hr-settings/api/use-skills";
import {
  skillSchema,
  skillToFormValues,
  toSkillRequest,
  type SkillFormValues,
} from "@/features/hr/hr-settings/schemas/skill-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { SkillSetting } from "@/lib/api/generated/model";

export function SkillFormDialog({
  open,
  onOpenChange,
  skill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: SkillSetting;
}) {
  const { t } = useTranslation();
  const editMode = skill != null;
  const skillId = skill?.skillId ?? 0;

  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill(skillId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: skillToFormValues(skill),
  });

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(skillToFormValues(skill));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, skill]);

  const pending = createSkill.isPending || updateSkill.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateSkill.mutateAsync(toSkillRequest(values));
        toast.success(t("hrSettings.forms.skill.editSuccess"));
      } else {
        await createSkill.mutateAsync(toSkillRequest(values));
        toast.success(t("hrSettings.forms.skill.addSuccess"));
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("hrSettings.forms.skill.saveError"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode ? t("hrSettings.forms.skill.editTitle") : t("hrSettings.forms.skill.addTitle")}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? t("hrSettings.forms.skill.editDescription", { name: skill.nameEn })
              : t("hrSettings.forms.skill.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("hrSettings.forms.common.nameEn")} error={errors.nameEn?.message}>
              <Input {...register("nameEn")} maxLength={100} />
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.nameAr")} error={errors.nameAr?.message}>
              <Input {...register("nameAr")} maxLength={100} dir="rtl" />
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.status")}>
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("hrSettings.forms.common.cancel")}
            </Button>

            <Button type="submit" disabled={pending}>
              {pending
                ? t("hrSettings.forms.common.saving")
                : editMode
                  ? t("hrSettings.forms.skill.saveChanges")
                  : t("hrSettings.forms.skill.addSubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
