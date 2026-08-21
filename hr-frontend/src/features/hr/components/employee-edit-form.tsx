import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrgUnits, useStatuses, useUpdateEmployee } from "@/features/hr/api/use-employees";
import { EditSection } from "@/features/hr/components/edit-section";
import { SelectField } from "@/features/hr/components/select-field";
import { WizardField } from "@/features/hr/components/wizard-field";
import {
  employeeDetailToEditFormValues,
  readPhotoFile,
  toUpdateEmployeeRequest,
} from "@/features/hr/schemas/employee-mappers";
import {
  editEmployeeSchema,
  type EditEmployeeFormValues,
} from "@/features/hr/schemas/employee-schema";
import { parseEgyptianNationalId } from "@/features/hr/utils/egyptian-national-id";
import type { EmployeeDetail } from "@/lib/api/generated/model";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export function EmployeeEditForm({
  employee,
  onSaved,
  onCancel,
}: {
  employee: EmployeeDetail;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const statuses = useStatuses();
  const orgUnits = useOrgUnits();
  const updateEmployee = useUpdateEmployee(employee.employeeId ?? 0);

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

      toast.success("Employee updated successfully");
      onSaved();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to update employee";

      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <EditSection title="Employment">
          <WizardField label="Employee Number" error={errors.employeeNumber?.message}>
            <Input {...register("employeeNumber")} />
          </WizardField>

          <WizardField label="Employee Status">
            <SelectField
              control={control}
              name="employeeStatusId"
              placeholder="Select status"
              options={
                statuses.data?.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Organization Unit">
            <SelectField
              control={control}
              name="currentOrgUnitId"
              placeholder="Select organization unit"
              options={
                orgUnits.data?.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Hire Date">
            <Input {...register("hireDate")} type="date" />
          </WizardField>

          <WizardField label="Start Date">
            <Input {...register("startDate")} type="date" />
          </WizardField>

          <WizardField label="Termination Date">
            <Input {...register("terminationDate")} type="date" />
          </WizardField>
        </EditSection>

        <EditSection title="Personal Information">
          <div className="md:col-span-2">
            <WizardField label="Profile Photo">
              <div className="flex items-center gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a2535]">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={employee.displayName ?? "Employee"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      No Photo
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
                          error instanceof Error ? error.message : "Invalid photo",
                        );

                        event.target.value = "";
                      }
                    }}
                  />

                  <p className="text-xs text-gray-400">
                    JPG, PNG, GIF or WebP. Maximum 2 MB.
                  </p>
                </div>
              </div>
            </WizardField>
          </div>

          <WizardField label="First Name" error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </WizardField>

          <WizardField label="Other Name">
            <Input {...register("otherName")} />
          </WizardField>

          <WizardField label="Display Name">
            <Input {...register("displayName")} />
          </WizardField>

          <WizardField label="Gender" error={errors.gender?.message}>
            <SelectField
              control={control}
              name="gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
            />
          </WizardField>

          <WizardField label="Birth Date">
            <Input {...register("birthDate")} type="date" />
          </WizardField>

          <WizardField label="National ID">
            <Input {...register("nationalId")} />
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
              maxLength={255}
              placeholder="Bachelor of Computer Science"
            />
          </WizardField>
        </EditSection>

        <EditSection title="Official Information">
          <WizardField label="Social Insurance Number">
            <Input {...register("socialInsuranceNumber")} maxLength={50} />
          </WizardField>

          <WizardField label="Marital Status">
            <Input {...register("maritalStatus")} maxLength={50} />
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

          <div className="md:col-span-2">
            <WizardField label="Leave Notes">
              <textarea
                {...register("leaveNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </WizardField>
          </div>
        </EditSection>

        <EditSection title="Skills">
          <div className="md:col-span-2">
            <WizardField label="Employee Skills">
              <div className="flex flex-col gap-2">
                <Input
                  {...register("skills")}
                  placeholder="Java, Spring Boot, React, PostgreSQL"
                />

                <p className="text-xs text-gray-400">
                  Separate multiple skills using commas. Remove all text to
                  clear the employee skills.
                </p>
              </div>
            </WizardField>
          </div>
        </EditSection>

        <EditSection title="Contact Information">
          <WizardField label="Personal Email" error={errors.personalEmail?.message}>
            <Input {...register("personalEmail")} type="email" />
          </WizardField>

          <WizardField label="Business Email" error={errors.businessEmail?.message}>
            <Input {...register("businessEmail")} type="email" />
          </WizardField>

          <WizardField label="Phone Number">
            <Input {...register("phoneNumber")} />
          </WizardField>

          <WizardField label="Mobile Number">
            <Input {...register("mobileNumber")} />
          </WizardField>
        </EditSection>

        <EditSection title="Address">
          <WizardField label="Country ID">
            <Input {...register("countryId")} type="number" />
          </WizardField>

          <WizardField label="State ID">
            <Input {...register("stateId")} type="number" />
          </WizardField>

          <WizardField label="City ID">
            <Input {...register("cityId")} type="number" />
          </WizardField>

          <WizardField label="Postal Code">
            <Input {...register("postalCode")} />
          </WizardField>

          <WizardField label="Address Line 1">
            <Input {...register("addressLine1")} />
          </WizardField>

          <WizardField label="Address Line 2">
            <Input {...register("addressLine2")} />
          </WizardField>
        </EditSection>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" disabled={updateEmployee.isPending}>
          {updateEmployee.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
