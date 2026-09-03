import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrgUnits, useStatuses, useUpdateEmployee } from "@/features/hr/employees/api/use-employees";
import { EditSection } from "@/features/hr/shared/components/edit-section";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import {
  employeeDetailToEditFormValues,
  readPhotoFile,
  toUpdateEmployeeRequest,
} from "@/features/hr/employees/schemas/employee-mappers";
import {
  editEmployeeSchema,
  type EditEmployeeFormValues,
} from "@/features/hr/employees/schemas/employee-schema";
import { parseEgyptianNationalId } from "@/features/hr/employees/utils/egyptian-national-id";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function EmployeeEditForm({
  employee,
  onSaved,
  onCancel,
}: {
  employee: EmployeeDetail;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const statuses = useStatuses();
  const orgUnits = useOrgUnits();
  const updateEmployee = useUpdateEmployee(employee.employeeId ?? 0);

  const GENDER_OPTIONS = [
    { value: "Male", label: t("employees.editForm.male") },
    { value: "Female", label: t("employees.editForm.female") },
  ];

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    employee.profilePhotoDataUrl ?? null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: employeeDetailToEditFormValues(employee),
  });

  const nationalId = watch("nationalId") ?? "";

  const nationalIdData = useMemo(() => {
    try {
      return parseEgyptianNationalId(nationalId);
    } catch {
      return null;
    }
  }, [nationalId]);

  useEffect(() => {
    if (!nationalIdData) {
      return;
    }

    setValue("birthDate", nationalIdData.birthDate);
    setValue("gender", nationalIdData.gender);

    if (nationalIdData.gender === "Female") {
      setValue("militaryExemptionExpiryDate", "");
    }
  }, [nationalIdData, setValue]);

  const onSubmit = async (values: EditEmployeeFormValues) => {
    try {
      await updateEmployee.mutateAsync(toUpdateEmployeeRequest(values));

      toast.success(t("employees.editForm.updatedSuccess"));
      onSaved();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : t("employees.editForm.updateError");

      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <EditSection title={t("employees.editForm.employmentSection")}>
          <LabeledField label={t("employees.editForm.employeeNumber")} error={errors.employeeNumber?.message}>
            <Input {...register("employeeNumber")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.employeeStatus")}>
            <SelectField
              control={control}
              name="employeeStatusId"
              placeholder={t("employees.editForm.selectStatus")}
              options={
                statuses.data?.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("employees.editForm.organizationUnit")}>
            <SelectField
              control={control}
              name="currentOrgUnitId"
              placeholder={t("employees.editForm.selectOrganizationUnit")}
              options={
                orgUnits.data?.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("employees.editForm.hireDate")}>
            <Input {...register("hireDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.startDate")}>
            <Input {...register("startDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.terminationDate")}>
            <Input {...register("terminationDate")} type="date" />
          </LabeledField>
        </EditSection>

        <EditSection title={t("employees.editForm.personalSection")}>
          <div className="md:col-span-2">
            <LabeledField label={t("employees.editForm.profilePhoto")}>
              <div className="flex items-center gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a2535]">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={employee.displayName ?? t("employment.table.unnamedEmployee")}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {t("employees.editForm.noPhoto")}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      try {
                        const photo = await readPhotoFile(event.target.files?.[0]);

                        if (!photo) {
                          return;
                        }

                        setValue("profilePhotoBase64", photo.base64, {
                          shouldDirty: true,
                        });

                        setPhotoPreview(photo.dataUrl);
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : t("employees.editForm.invalidPhoto"),
                        );

                        event.target.value = "";
                      }
                    }}
                  />

                  <p className="text-xs text-gray-400">
                    {t("employees.editForm.photoHint")}
                  </p>
                </div>
              </div>
            </LabeledField>
          </div>

          <LabeledField label={t("employees.editForm.firstName")} error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.otherName")}>
            <Input {...register("otherName")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.displayName")}>
            <Input {...register("displayName")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.gender")} error={errors.gender?.message}>
            <SelectField
              control={control}
              name="gender"
              placeholder={t("employees.editForm.selectGender")}
              options={GENDER_OPTIONS}
            />
          </LabeledField>

          <LabeledField label={t("employees.editForm.birthDate")}>
            <Input {...register("birthDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.nationalId")}>
            <Input {...register("nationalId")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.nationalIdExpiryDate")}>
            <Input {...register("nationalIdExpiryDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.militaryExemptionExpiry")}>
            <Input
              {...register("militaryExemptionExpiryDate")}
              type="date"
              disabled={nationalIdData?.gender === "Female"}
            />
          </LabeledField>

          <LabeledField label={t("employees.editForm.qualification")}>
            <Input
              {...register("qualification")}
              maxLength={255}
              placeholder={t("employees.editForm.qualificationPlaceholder")}
            />
          </LabeledField>
        </EditSection>

        <EditSection title={t("employees.editForm.officialSection")}>
          <LabeledField label={t("employees.editForm.socialInsuranceNumber")}>
            <Input {...register("socialInsuranceNumber")} maxLength={50} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.maritalStatus")}>
            <Input {...register("maritalStatus")} maxLength={50} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.graduationDate")}>
            <Input {...register("graduationDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.specialization")}>
            <Input {...register("specialization")} maxLength={255} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.workLocation")}>
            <Input {...register("workLocation")} maxLength={255} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.healthInsuranceCardNumber")}>
            <Input {...register("healthInsuranceCardNumber")} maxLength={100} />
          </LabeledField>

          <LabeledField
            label={t("employees.editForm.totalExperienceYears")}
            error={errors.totalExperienceYears?.message}
          >
            <Input
              {...register("totalExperienceYears")}
              type="number"
              min="0"
              step="0.01"
            />
          </LabeledField>

          <div className="md:col-span-2">
            <LabeledField label={t("employees.editForm.leaveNotes")}>
              <textarea
                {...register("leaveNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </LabeledField>
          </div>
        </EditSection>

        <EditSection title={t("employees.editForm.skillsSection")}>
          <div className="md:col-span-2">
            <LabeledField label={t("employees.editForm.employeeSkills")}>
              <div className="flex flex-col gap-2">
                <Input
                  {...register("skills")}
                  placeholder={t("employees.editForm.skillsPlaceholder")}
                />

                <p className="text-xs text-gray-400">
                  {t("employees.editForm.skillsHint")}
                </p>
              </div>
            </LabeledField>
          </div>
        </EditSection>

        <EditSection title={t("employees.editForm.contactSection")}>
          <LabeledField label={t("employees.editForm.personalEmail")} error={errors.personalEmail?.message}>
            <Input {...register("personalEmail")} type="email" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.businessEmail")} error={errors.businessEmail?.message}>
            <Input {...register("businessEmail")} type="email" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.phoneNumber")}>
            <Input {...register("phoneNumber")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.mobileNumber")}>
            <Input {...register("mobileNumber")} />
          </LabeledField>
        </EditSection>

        <EditSection title={t("employees.editForm.addressSection")}>
          <LabeledField label={t("employees.editForm.countryId")}>
            <Input {...register("countryId")} type="number" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.stateId")}>
            <Input {...register("stateId")} type="number" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.cityId")}>
            <Input {...register("cityId")} type="number" />
          </LabeledField>

          <LabeledField label={t("employees.editForm.postalCode")}>
            <Input {...register("postalCode")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.addressLine1")}>
            <Input {...register("addressLine1")} />
          </LabeledField>

          <LabeledField label={t("employees.editForm.addressLine2")}>
            <Input {...register("addressLine2")} />
          </LabeledField>
        </EditSection>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("employees.editForm.cancel")}
        </Button>

        <Button type="submit" disabled={updateEmployee.isPending}>
          {updateEmployee.isPending
            ? t("employees.editForm.saving")
            : t("employees.editForm.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
