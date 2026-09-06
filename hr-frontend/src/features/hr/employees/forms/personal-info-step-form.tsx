import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { WizardFooter } from "@/features/hr/employees/components/wizard-footer";
import { WizardHeader } from "@/features/hr/employees/components/wizard-header";
import { readPhotoFile } from "@/features/hr/employees/schemas/employee-mappers";
import {
  personalInfoSchema,
  type EmployeeWizardData,
  type PersonalInfoFormValues,
} from "@/features/hr/employees/schemas/employee-schema";
import { parseEgyptianNationalId } from "@/features/hr/employees/utils/egyptian-national-id";

export function PersonalInfoStepForm({
  defaults,
  next,
  back,
}: {
  defaults: EmployeeWizardData;
  next: (values: PersonalInfoFormValues) => void;
  back: () => void;
}) {
  const { t } = useTranslation();

  const GENDER_OPTIONS = [
    { value: "Male", label: t("employees.wizard.personalInfo.male") },
    { value: "Female", label: t("employees.wizard.personalInfo.female") },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),

    defaultValues: {
      firstName: defaults.firstName ?? "",
      otherName: defaults.otherName ?? "",
      displayName: defaults.displayName ?? "",
      gender: defaults.gender,
      birthDate: defaults.birthDate ?? "",
      nationalId: defaults.nationalId ?? "",
      nationalIdExpiryDate: defaults.nationalIdExpiryDate ?? "",
      militaryExemptionExpiryDate: defaults.militaryExemptionExpiryDate ?? "",
      qualification: defaults.qualification ?? "",
      socialInsuranceNumber: defaults.socialInsuranceNumber ?? "",
      maritalStatus: defaults.maritalStatus ?? "",
      graduationDate: defaults.graduationDate ?? "",
      specialization: defaults.specialization ?? "",
      workLocation: defaults.workLocation ?? "",
      healthInsuranceCardNumber: defaults.healthInsuranceCardNumber ?? "",
      totalExperienceYears: defaults.totalExperienceYears ?? "",
      leaveNotes: defaults.leaveNotes ?? "",
      personalEmail: defaults.personalEmail ?? defaults.email ?? "",
      businessEmail: defaults.businessEmail ?? "",
      mobileNumber: defaults.mobileNumber ?? "",
      phoneNumber: defaults.phoneNumber ?? "",
      countryId: defaults.countryId ?? "",
      stateId: defaults.stateId ?? "",
      cityId: defaults.cityId ?? "",
      addressLine1: defaults.addressLine1 ?? "",
      addressLine2: defaults.addressLine2 ?? "",
      postalCode: defaults.postalCode ?? "",
      profilePhotoBase64: defaults.profilePhotoBase64 ?? "",
      skills: defaults.skills ?? "",
    },
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

    setValue("birthDate", nationalIdData.birthDate, { shouldValidate: true });
    setValue("gender", nationalIdData.gender, { shouldValidate: true });
  }, [nationalIdData, setValue]);

  return (
    <form
      onSubmit={handleSubmit(next)}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <WizardHeader
        step={2}
        title={t("employees.wizard.personalInfo.title")}
        description={t("employees.wizard.personalInfo.description")}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-3">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
          <LabeledField label={t("employees.wizard.personalInfo.firstName")} error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.otherName")}>
            <Input {...register("otherName")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.nationalId")} error={errors.nationalId?.message}>
            <Input {...register("nationalId")} maxLength={14} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.nationalIdExpiryDate")}>
            <Input {...register("nationalIdExpiryDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.militaryExemptionExpiry")}>
            <Input
              {...register("militaryExemptionExpiryDate")}
              type="date"
              disabled={nationalIdData?.gender === "Female"}
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.qualification")}>
            <Input
              {...register("qualification")}
              placeholder={t("employees.wizard.personalInfo.qualificationPlaceholder")}
              maxLength={255}
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.socialInsuranceNumber")}>
            <Input {...register("socialInsuranceNumber")} maxLength={50} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.maritalStatus")}>
            <Input
              {...register("maritalStatus")}
              placeholder={t("employees.wizard.personalInfo.maritalStatusPlaceholder")}
              maxLength={50}
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.graduationDate")}>
            <Input {...register("graduationDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.specialization")}>
            <Input {...register("specialization")} maxLength={255} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.workLocation")}>
            <Input {...register("workLocation")} maxLength={255} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.healthInsuranceCardNumber")}>
            <Input {...register("healthInsuranceCardNumber")} maxLength={100} />
          </LabeledField>

          <LabeledField
            label={t("employees.wizard.personalInfo.totalExperienceYears")}
            error={errors.totalExperienceYears?.message}
          >
            <Input
              {...register("totalExperienceYears")}
              type="number"
              min="0"
              step="0.01"
            />
          </LabeledField>

          <div className="md:col-span-3">
            <LabeledField label={t("employees.wizard.personalInfo.leaveNotes")}>
              <textarea
                {...register("leaveNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("employees.wizard.personalInfo.leaveNotesPlaceholder")}
              />
            </LabeledField>
          </div>

          <LabeledField label={t("employees.wizard.personalInfo.birthDate")}>
            <Input
              {...register("birthDate")}
              type="date"
              readOnly={Boolean(nationalIdData)}
              className={nationalIdData ? "bg-gray-100" : ""}
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.gender")} error={errors.gender?.message}>
            <SelectField
              control={control}
              name="gender"
              placeholder={t("employees.wizard.personalInfo.selectGender")}
              options={GENDER_OPTIONS}
              disabled={Boolean(nationalIdData)}
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.photo")}>
            <Input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                try {
                  const photo = await readPhotoFile(event.target.files?.[0]);

                  setValue("profilePhotoBase64", photo?.base64 ?? "");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : t("employees.wizard.personalInfo.invalidPhoto"),
                  );
                }
              }}
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.email")} error={errors.personalEmail?.message}>
            <Input {...register("personalEmail")} type="email" />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.mobile")}>
            <Input {...register("mobileNumber")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.phone")}>
            <Input {...register("phoneNumber")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.countryId")} error={errors.countryId?.message}>
            <Input {...register("countryId")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.stateId")} error={errors.stateId?.message}>
            <Input {...register("stateId")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.personalInfo.cityId")} error={errors.cityId?.message}>
            <Input {...register("cityId")} />
          </LabeledField>

          <div className="md:col-span-3">
            <LabeledField label={t("employees.wizard.personalInfo.address")}>
              <Input {...register("addressLine1")} />
            </LabeledField>

            <div className="md:col-span-3">
              <LabeledField label={t("employees.wizard.personalInfo.skills")}>
                <div className="flex flex-col gap-2">
                  <Input
                    {...register("skills")}
                    placeholder={t("employees.wizard.personalInfo.skillsPlaceholder")}
                  />

                  <p className="text-xs text-gray-400">
                    {t("employees.wizard.personalInfo.skillsHint")}
                  </p>
                </div>
              </LabeledField>
            </div>
          </div>
        </div>
      </div>

      <WizardFooter step={2} onBack={back} />
    </form>
  );
}
