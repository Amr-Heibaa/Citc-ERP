import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
        toast.success("Skill updated successfully");
      } else {
        await createSkill.mutateAsync(toSkillRequest(values));
        toast.success("Skill added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save skill");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode ? "Edit Skill" : "Add Skill"}
          </DialogTitle>

          <DialogDescription>
            {editMode ? `Update the details for ${skill.nameEn}.` : "Create a new skill."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label="Name (English)" error={errors.nameEn?.message}>
              <Input {...register("nameEn")} maxLength={100} />
            </LabeledField>

            <LabeledField label="Name (Arabic)" error={errors.nameAr?.message}>
              <Input {...register("nameAr")} maxLength={100} dir="rtl" />
            </LabeledField>

            <LabeledField label="Status">
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editMode ? "Save Changes" : "Add Skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
