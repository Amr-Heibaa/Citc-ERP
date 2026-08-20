import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { SelectField } from "@/features/hr/components/select-field";
import { WizardField } from "@/features/hr/components/wizard-field";
import { WizardFooter } from "@/features/hr/components/wizard-footer";
import { WizardHeader } from "@/features/hr/components/wizard-header";
import { readPhotoFile } from "@/features/hr/schemas/employee-mappers";
import {
  personalInfoSchema,
  type EmployeeWizardData,
  type PersonalInfoFormValues,
} from "@/features/hr/schemas/employee-schema";
import { parseEgyptianNationalId } from "@/features/hr/utils/egyptian-national-id";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export function PersonalInfoStepForm({
  defaults,
  next,
  back,
}: {
  defaults: EmployeeWizardData;
  next: (values: PersonalInfoFormValues) => void;
  back: () => void;
}) {
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
        title="Personal Information"
        description="The employee personal information"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-3">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
          <WizardField label="First Name" error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </WizardField>

          <WizardField label="Other Name">
            <Input {...register("otherName")} />
          </WizardField>

          <WizardField label="National ID" error={errors.nationalId?.message}>
            <Input {...register("nationalId")} maxLength={14} />
          </WizardField>

          <WizardField label="National ID Expiry Date">
            <Input {...register("nationalIdExpiryDate")} type="date" />
          </WizardField>

          <WizardField label="Military Exemption Expiry">
            <Input
              {...register("militaryExemptionExpiryDate")}
              type="date"
              disabled={nationalIdData?.gender === "Female"}
            />
          </WizardField>

          <WizardField label="Qualification">
            <Input
              {...register("qualification")}
              placeholder="Bachelor of Computer Science"
              maxLength={255}
            />
          </WizardField>

          <WizardField label="Social Insurance Number">
            <Input {...register("socialInsuranceNumber")} maxLength={50} />
          </WizardField>

          <WizardField label="Marital Status">
            <Input
              {...register("maritalStatus")}
              placeholder="Married, Single..."
              maxLength={50}
            />
          </WizardField>

          <WizardField label="Graduation Date">
            <Input {...register("graduationDate")} type="date" />
          </WizardField>

          <WizardField label="Specialization">
            <Input {...register("specialization")} maxLength={255} />
          </WizardField>

          <WizardField label="Work Location">
            <Input {...register("workLocation")} maxLength={255} />
          </WizardField>

          <WizardField label="Health Insurance Card Number">
            <Input {...register("healthInsuranceCardNumber")} maxLength={100} />
          </WizardField>

          <WizardField
            label="Total Experience Years"
            error={errors.totalExperienceYears?.message}
          >
            <Input
              {...register("totalExperienceYears")}
              type="number"
              min="0"
              step="0.01"
            />
          </WizardField>

          <div className="md:col-span-3">
            <WizardField label="Leave Notes">
              <textarea
                {...register("leaveNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Employee leave information and notes"
              />
            </WizardField>
          </div>

          <WizardField label="Birth Date">
            <Input
              {...register("birthDate")}
              type="date"
              readOnly={Boolean(nationalIdData)}
              className={nationalIdData ? "bg-gray-100" : ""}
            />
          </WizardField>

          <WizardField label="Gender" error={errors.gender?.message}>
            <SelectField
              control={control}
              name="gender"
              placeholder="Select Gender"
              options={GENDER_OPTIONS}
              disabled={Boolean(nationalIdData)}
            />
          </WizardField>

          <WizardField label="Photo">
            <Input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                try {
                  const photo = await readPhotoFile(event.target.files?.[0]);

                  setValue("profilePhotoBase64", photo?.base64 ?? "");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Invalid photo",
                  );
                }
              }}
            />
          </WizardField>

          <WizardField label="Email" error={errors.personalEmail?.message}>
            <Input {...register("personalEmail")} type="email" />
          </WizardField>

          <WizardField label="Mobile">
            <Input {...register("mobileNumber")} />
          </WizardField>

          <WizardField label="Phone">
            <Input {...register("phoneNumber")} />
          </WizardField>

          <WizardField label="Country ID" error={errors.countryId?.message}>
            <Input {...register("countryId")} />
          </WizardField>

          <WizardField label="State ID" error={errors.stateId?.message}>
            <Input {...register("stateId")} />
          </WizardField>

          <WizardField label="City ID" error={errors.cityId?.message}>
            <Input {...register("cityId")} />
          </WizardField>

          <div className="md:col-span-3">
            <WizardField label="Address">
              <Input {...register("addressLine1")} />
            </WizardField>

            <div className="md:col-span-3">
              <WizardField label="Skills">
                <div className="flex flex-col gap-2">
                  <Input
                    {...register("skills")}
                    placeholder="Java, Spring Boot, React, PostgreSQL"
                  />

                  <p className="text-xs text-gray-400">
                    Separate multiple skills using commas.
                  </p>
                </div>
              </WizardField>
            </div>
          </div>
        </div>
      </div>

      <WizardFooter step={2} onBack={back} />
    </form>
  );
}
