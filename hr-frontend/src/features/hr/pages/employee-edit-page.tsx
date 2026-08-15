import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useEmployeeDetail,
  useOrgUnits,
  useStatuses,
  useUpdateEmployee,
} from "@/features/hr/api/use-employees";

import { parseEgyptianNationalId } from "@/features/hr/utils/egyptian-national-id";

const optionalEmail = z
  .string()
  .email("Invalid email address")
  .optional()
  .or(z.literal(""));

const editEmployeeSchema = z.object({
  employeeNumber: z.string().min(1, "Employee number is required"),
  currentOrgUnitId: z.string().optional(),
  employeeStatusId: z.string().optional(),
  hireDate: z.string().optional(),
  startDate: z.string().optional(),
  terminationDate: z.string().optional(),
  skills: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  otherName: z.string().optional(),
  displayName: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  nationalId: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;

      try {
        parseEgyptianNationalId(value);
        return true;
      } catch {
        return false;
      }
    }, "Invalid Egyptian national ID")
    .optional(),
  nationalIdExpiryDate: z.string().optional(),

  militaryExemptionExpiryDate: z.string().optional(),

  qualification: z
    .string()
    .max(255, "Qualification cannot exceed 255 characters")
    .optional(),

  personalEmail: optionalEmail,
  businessEmail: optionalEmail,
  phoneNumber: z.string().optional(),
  mobileNumber: z.string().optional(),

  countryId: z.string().optional(),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  profilePhotoBase64: z.string().optional(),
});

type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="font-['Inter',sans-serif] text-sm font-medium text-[#1a2535]">
        {label}
      </Label>

      {children}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-[#f8f9fb] p-5">
      <h3 className="mb-4 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function numberOrNull(value?: string) {
  return value ? Number(value) : null;
}

async function readPhoto(file?: File) {
  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Photo must be smaller than 2 MB");
  }

  return await new Promise<{
    base64: string;
    dataUrl: string;
  }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result);
      const base64 = dataUrl.split(",")[1] ?? "";

      resolve({
        base64,
        dataUrl,
      });
    };

    reader.onerror = () => {
      reject(new Error("Failed to read photo"));
    };

    reader.readAsDataURL(file);
  });
}

export function EmployeeEditPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const id = Number(employeeId);

  const employee = useEmployeeDetail(id);
  const statuses = useStatuses();
  const orgUnits = useOrgUnits();
  const updateEmployee = useUpdateEmployee(id);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
  });

  const nationalId = watch("nationalId") ?? "";

  const nationalIdData = (() => {
    try {
      return parseEgyptianNationalId(nationalId);
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!nationalIdData) {
      return;
    }

    setValue("birthDate", nationalIdData.birthDate);

    setValue("gender", nationalIdData.gender === "Female" ? "2" : "1");

    if (nationalIdData.gender === "Female") {
      setValue("militaryExemptionExpiryDate", "");
    }
  }, [nationalIdData, setValue]);

  useEffect(() => {
    if (!employee.data) return;

    const emp = employee.data;

    reset({
      employeeNumber: emp.employeeNumber ?? "",
      currentOrgUnitId: emp.currentOrgUnitId?.toString() ?? "",
      employeeStatusId: emp.employeeStatusId?.toString() ?? "",
      hireDate: emp.hireDate ?? "",
      startDate: emp.startDate ?? "",
      terminationDate: emp.terminationDate ?? "",

      firstName: emp.firstName ?? "",
      otherName: emp.otherName ?? "",
      displayName: emp.displayName ?? "",
      gender: emp.gender?.toString() ?? "",
      birthDate: emp.birthDate ?? "",
      nationalId: emp.nationalId ?? "",
      nationalIdExpiryDate: emp.nationalIdExpiryDate ?? "",

      militaryExemptionExpiryDate: emp.militaryExemptionExpiryDate ?? "",

      qualification: emp.qualification ?? "",

      personalEmail: emp.personalEmail ?? "",
      businessEmail: emp.businessEmail ?? "",
      phoneNumber: emp.phoneNumber ?? "",
      mobileNumber: emp.mobileNumber ?? "",

      countryId: emp.countryId?.toString() ?? "",
      stateId: emp.stateId?.toString() ?? "",
      cityId: emp.cityId?.toString() ?? "",
      addressLine1: emp.addressLine1 ?? "",
      addressLine2: emp.addressLine2 ?? "",
      postalCode: emp.postalCode ?? "",
      profilePhotoBase64: "",
      skills: (emp.skills ?? []).join(", "),
    });

    setPhotoPreview(emp.profilePhotoDataUrl ?? null);
  }, [employee.data, reset]);

  const close = () => {
    navigate(`/hr/employees/${id}`);
  };

  const onSubmit = async (values: EditEmployeeFormValues) => {
    try {
      await updateEmployee.mutateAsync({
        employeeNumber: values.employeeNumber.trim(),
        currentOrgUnitId: numberOrNull(values.currentOrgUnitId),
        employeeStatusId: numberOrNull(values.employeeStatusId),
        hireDate: values.hireDate || null,
        startDate: values.startDate || null,
        terminationDate: values.terminationDate || null,

        firstName: values.firstName.trim(),
        otherName: values.otherName || null,
        displayName: values.displayName || null,
        gender: numberOrNull(values.gender),
        birthDate: values.birthDate || null,
        nationalId: values.nationalId || null,
        nationalIdExpiryDate: values.nationalIdExpiryDate || null,

        militaryExemptionExpiryDate:
          nationalIdData?.gender === "Female"
            ? null
            : values.militaryExemptionExpiryDate || null,

        qualification: values.qualification?.trim() || null,

        personalEmail: values.personalEmail || null,
        businessEmail: values.businessEmail || null,
        phoneNumber: values.phoneNumber || null,
        mobileNumber: values.mobileNumber || null,

        countryId: numberOrNull(values.countryId),
        stateId: numberOrNull(values.stateId),
        cityId: numberOrNull(values.cityId),
        addressLine1: values.addressLine1 || null,
        addressLine2: values.addressLine2 || null,
        postalCode: values.postalCode || null,
        profilePhotoBase64: values.profilePhotoBase64 || null,
        skills: (values.skills ?? "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      toast.success("Employee updated successfully");
      close();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to update employee";

      toast.error(message);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1000px, 95vw)",
          maxWidth: "none",
          height: "min(860px, 92vh)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="font-['Inter',sans-serif] text-2xl text-[#1a2535]">
            Edit Employee
          </DialogTitle>

          <DialogDescription>
            Update the employee personal and employment information.
          </DialogDescription>
        </DialogHeader>

        {employee.isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-400">
            Loading employee…
          </div>
        ) : employee.isError || !employee.data ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">Employee not found.</p>

            <Button variant="outline" onClick={() => navigate("/hr/employees")}>
              Back to employees
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <Section title="Employment">
                <Field
                  label="Employee Number"
                  error={errors.employeeNumber?.message}
                >
                  <Input {...register("employeeNumber")} />
                </Field>

                <Field label="Employee Status">
                  <select
                    {...register("employeeStatusId")}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select status</option>

                    {statuses.data?.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Organization Unit">
                  <select
                    {...register("currentOrgUnitId")}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select organization unit</option>

                    {orgUnits.data?.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Hire Date">
                  <Input {...register("hireDate")} type="date" />
                </Field>

                <Field label="Start Date">
                  <Input {...register("startDate")} type="date" />
                </Field>

                <Field label="Termination Date">
                  <Input {...register("terminationDate")} type="date" />
                </Field>
              </Section>

              <Section title="Personal Information">
                <div className="md:col-span-2">
                  <Field label="Profile Photo">
                    <div className="flex items-center gap-4">
                      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a2535]">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt={employee.data?.displayName ?? "Employee"}
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
                              const photo = await readPhoto(
                                event.target.files?.[0],
                              );

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
                                  : "Invalid photo",
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
                  </Field>
                </div>
                <Field label="First Name" error={errors.firstName?.message}>
                  <Input {...register("firstName")} />
                </Field>

                <Field label="Other Name">
                  <Input {...register("otherName")} />
                </Field>

                <Field label="Display Name">
                  <Input {...register("displayName")} />
                </Field>

                <Field label="Gender">
                  <select
                    {...register("gender")}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                  </select>
                </Field>

                <Field label="Birth Date">
                  <Input {...register("birthDate")} type="date" />
                </Field>

                <Field label="National ID">
                  <Input {...register("nationalId")} />
                </Field>

                <Field label="National ID Expiry Date">
                  <Input {...register("nationalIdExpiryDate")} type="date" />
                </Field>

                <Field label="Military Exemption Expiry">
                  <Input
                    {...register("militaryExemptionExpiryDate")}
                    type="date"
                    disabled={nationalIdData?.gender === "Female"}
                  />
                </Field>

                <Field label="Qualification">
                  <Input
                    {...register("qualification")}
                    maxLength={255}
                    placeholder="Bachelor of Computer Science"
                  />
                </Field>
              </Section>
              <Section title="Skills">
                <div className="md:col-span-2">
                  <Field label="Employee Skills">
                    <div className="flex flex-col gap-2">
                      <Input
                        {...register("skills")}
                        placeholder="Java, Spring Boot, React, PostgreSQL"
                      />

                      <p className="text-xs text-gray-400">
                        Separate multiple skills using commas. Remove all text
                        to clear the employee skills.
                      </p>
                    </div>
                  </Field>
                </div>
              </Section>
              <Section title="Contact Information">
                <Field
                  label="Personal Email"
                  error={errors.personalEmail?.message}
                >
                  <Input {...register("personalEmail")} type="email" />
                </Field>

                <Field
                  label="Business Email"
                  error={errors.businessEmail?.message}
                >
                  <Input {...register("businessEmail")} type="email" />
                </Field>

                <Field label="Phone Number">
                  <Input {...register("phoneNumber")} />
                </Field>

                <Field label="Mobile Number">
                  <Input {...register("mobileNumber")} />
                </Field>
              </Section>

              <Section title="Address">
                <Field label="Country ID">
                  <Input {...register("countryId")} type="number" />
                </Field>

                <Field label="State ID">
                  <Input {...register("stateId")} type="number" />
                </Field>

                <Field label="City ID">
                  <Input {...register("cityId")} type="number" />
                </Field>

                <Field label="Postal Code">
                  <Input {...register("postalCode")} />
                </Field>

                <Field label="Address Line 1">
                  <Input {...register("addressLine1")} />
                </Field>

                <Field label="Address Line 2">
                  <Input {...register("addressLine2")} />
                </Field>
              </Section>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>

              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
