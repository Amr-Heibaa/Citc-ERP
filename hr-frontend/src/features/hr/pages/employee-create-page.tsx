import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseEgyptianNationalId } from "@/features/hr/utils/egyptian-national-id";

import {
  useContractTypes,
  useCreateEmployee,
  useEmployees,
  useOrganizations,
  useOrgUnits,
  usePositions,
  useStatuses,
} from "@/features/hr/api/use-employees";

import {
  contractSchema,
  employmentSchema,
  identitySchema,
  personalInfoSchema,
  positionSchema,
  type ContractFormValues,
  type EmploymentFormValues,
  type IdentityFormValues,
  type PersonalInfoFormValues,
  type PositionFormValues,
} from "@/features/hr/schemas/employee-schema";

type WizardData = Partial<
  IdentityFormValues &
    PersonalInfoFormValues &
    EmploymentFormValues &
    PositionFormValues &
    ContractFormValues
>;

const selectClass =
  "h-10 w-full rounded-md border border-[#cbd1d8] bg-white px-3 text-sm text-[#1f2c3e] outline-none focus:border-[#1f2c3e]";

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
      <Label className="font-['Inter',sans-serif] text-[15px] font-normal text-[#1f2c3e]">
        {label}
      </Label>

      {children}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Header({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="shrink-0 px-6 pb-3 pt-6">
      <h2 className="font-['Inter',sans-serif] text-[32px] font-semibold leading-none text-black">
        Create Employee
      </h2>

      <p className="mt-7 font-['Inter',sans-serif] text-[24px] font-semibold text-black">
        Step{step}: {title}
      </p>

      <p className="mt-1 font-['Inter',sans-serif] text-[16px] text-[#6b7280]">
        {description}
      </p>
    </div>
  );
}

function Footer({
  step,
  onBack,
  onSkip,
  pending,
  final = false,
}: {
  step: number;
  onBack?: () => void;
  onSkip?: () => void;
  pending?: boolean;
  final?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between px-6 py-4">
      <p className="text-sm text-[#6b7280]">Step {step} of 5</p>

      <div className="flex gap-3">
        {onSkip && (
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="w-24"
          >
            Skip
          </Button>
        )}

        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-24"
          >
            Back
          </Button>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-24 bg-[#1f2c3e] text-white"
        >
          {pending ? "Saving…" : final ? "Add" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function DesignArt() {
  return (
    <div className="relative hidden w-[390px] shrink-0 overflow-hidden md:block">
      <svg viewBox="0 0 390 470" className="size-full" aria-hidden="true">
        <g stroke="#182536" strokeWidth="1" opacity="0.28">
          {Array.from({ length: 20 }, (_, index) => (
            <line
              key={index}
              x1="390"
              y1={index * 24 - 20}
              x2={150 + index * 7}
              y2="235"
            />
          ))}
        </g>

        <path
          d="M210 120 C250 170 285 180 335 205 C280 225 250 260 225 315 C200 265 165 235 120 210 C170 185 195 160 210 120Z"
          fill="#05070b"
        />

        <rect
          x="102"
          y="310"
          width="48"
          height="48"
          transform="rotate(45 126 334)"
          fill="#52d9e9"
        />

        <path
          d="M260 160 C274 180 287 190 310 202 C285 213 273 227 260 250 C249 226 236 213 215 203 C238 190 250 178 260 160Z"
          fill="#111827"
        />
      </svg>
    </div>
  );
}

function IdentityStep({
  defaults,
  next,
}: {
  defaults: WizardData;
  next: (values: IdentityFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),

    defaultValues: {
      username: defaults.username ?? "",

      email: defaults.email ?? "",

      password: defaults.password ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(next)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <Header
        step={1}
        title="Identity"
        description="The username and email we create for user"
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col justify-center gap-5 px-8 py-4">
          <Field label="Username" error={errors.username?.message}>
            <Input {...register("username")} placeholder="Username" />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="Email" />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
            />
          </Field>
        </div>

        <div className="hidden w-[560px] items-center justify-center overflow-hidden lg:flex">
          <img
            src="/create-employee-identity.png"
            alt=""
            className="max-h-[400px] w-full object-contain"
          />
        </div>
      </div>

      <Footer step={1} />
    </form>
  );
}

async function photoToBase64(file?: File) {
  if (!file) return "";

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Photo must be smaller than 2 MB");
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result);

      resolve(result.split(",")[1] ?? "");
    };

    reader.onerror = () => {
      reject(new Error("Failed to read photo"));
    };

    reader.readAsDataURL(file);
  });
}

function PersonalStep({
  defaults,
  next,
  back,
}: {
  defaults: WizardData;
  next: (values: PersonalInfoFormValues) => void;
  back: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

    setValue("birthDate", nationalIdData.birthDate, {
      shouldValidate: true,
    });

    setValue("gender", nationalIdData.gender, {
      shouldValidate: true,
    });
  }, [nationalIdData, setValue]);

  return (
    <form
      onSubmit={handleSubmit(next)}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <Header
        step={2}
        title="Personal Information"
        description="The employee personal information"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-3">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
          <Field label="First Name" error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </Field>

          <Field label="Other Name">
            <Input {...register("otherName")} />
          </Field>

          <Field label="National ID" error={errors.nationalId?.message}>
            <Input {...register("nationalId")} maxLength={14} />
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
              placeholder="Bachelor of Computer Science"
              maxLength={255}
            />
          </Field>

          <Field label="Social Insurance Number">
            <Input {...register("socialInsuranceNumber")} maxLength={50} />
          </Field>

          <Field label="Marital Status">
            <Input
              {...register("maritalStatus")}
              placeholder="Married, Single..."
              maxLength={50}
            />
          </Field>

          <Field label="Graduation Date">
            <Input {...register("graduationDate")} type="date" />
          </Field>

          <Field label="Specialization">
            <Input {...register("specialization")} maxLength={255} />
          </Field>

          <Field label="Work Location">
            <Input {...register("workLocation")} maxLength={255} />
          </Field>

          <Field label="Health Insurance Card Number">
            <Input {...register("healthInsuranceCardNumber")} maxLength={100} />
          </Field>

          <Field
            label="Total Experience Years"
            error={errors.totalExperienceYears?.message}
          >
            <Input
              {...register("totalExperienceYears")}
              type="number"
              min="0"
              step="0.01"
            />
          </Field>

          <div className="md:col-span-3">
            <Field label="Leave Notes">
              <textarea
                {...register("leaveNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Employee leave information and notes"
              />
            </Field>
          </div>

          <Field label="Birth Date">
            <Input
              {...register("birthDate")}
              type="date"
              readOnly={Boolean(nationalIdData)}
              className={nationalIdData ? "bg-gray-100" : ""}
            />
          </Field>

          <Field label="Gender" error={errors.gender?.message}>
            <select
              {...register("gender")}
              disabled={Boolean(nationalIdData)}
              className={selectClass}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>

          <Field label="Photo">
            <Input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                try {
                  const base64 = await photoToBase64(event.target.files?.[0]);

                  setValue("profilePhotoBase64", base64);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Invalid photo",
                  );
                }
              }}
            />
          </Field>

          <Field label="Email" error={errors.personalEmail?.message}>
            <Input {...register("personalEmail")} type="email" />
          </Field>

          <Field label="Mobile">
            <Input {...register("mobileNumber")} />
          </Field>

          <Field label="Phone">
            <Input {...register("phoneNumber")} />
          </Field>

          <Field label="Country ID" error={errors.countryId?.message}>
            <Input {...register("countryId")} />
          </Field>

          <Field label="State ID" error={errors.stateId?.message}>
            <Input {...register("stateId")} />
          </Field>

          <Field label="City ID" error={errors.cityId?.message}>
            <Input {...register("cityId")} />
          </Field>

          <div className="md:col-span-3">
            <Field label="Address">
              <Input {...register("addressLine1")} />
            </Field>

            <div className="md:col-span-3">
              <Field label="Skills">
                <div className="flex flex-col gap-2">
                  <Input
                    {...register("skills")}
                    placeholder="Java, Spring Boot, React, PostgreSQL"
                  />

                  <p className="text-xs text-gray-400">
                    Separate multiple skills using commas.
                  </p>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>

      <Footer step={2} onBack={back} />
    </form>
  );
}

function EmploymentStep({
  defaults,
  next,
  back,
  skip,
}: {
  defaults: WizardData;
  next: (values: EmploymentFormValues) => void;
  back: () => void;
  skip: () => void;
}) {
  const statuses = useStatuses();
  const organizations = useOrganizations();
  const units = useOrgUnits();

  const { register, watch, handleSubmit } = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),

    defaultValues: {
      employeeNumber: defaults.employeeNumber ?? "",

      organizationId: defaults.organizationId ?? "",

      currentOrgUnitId: defaults.currentOrgUnitId ?? "",

      employeeStatusId: defaults.employeeStatusId ?? "",

      hireDate: defaults.hireDate ?? "",

      startDate: defaults.startDate ?? "",
    },
  });

  const organizationId = watch("organizationId");

  const visibleUnits = organizationId
    ? units.data?.filter(
        (unit) => String(unit.organizationId) === organizationId,
      )
    : units.data;

  return (
    <form
      onSubmit={handleSubmit(next)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <Header
        step={3}
        title="Employment"
        description="The employee employment information"
      />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-6 gap-y-5 px-8 py-4 md:grid-cols-2">
          <Field label="Employee Status">
            <select {...register("employeeStatusId")} className={selectClass}>
              <option value="">Employee Status</option>

              {statuses.data?.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
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

          <Field label="Organization">
            <select {...register("organizationId")} className={selectClass}>
              <option value="">Organization</option>

              {organizations.data?.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Organization Unit">
            <select {...register("currentOrgUnitId")} className={selectClass}>
              <option value="">Organization Unit</option>

              {visibleUnits?.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <DesignArt />
      </div>

      <Footer step={3} onBack={back} onSkip={skip} />
    </form>
  );
}

function PositionStep({
  defaults,
  next,
  back,
  skip,
}: {
  defaults: WizardData;
  next: (values: PositionFormValues) => void;
  back: () => void;
  skip: () => void;
}) {
  const positions = usePositions();
  const units = useOrgUnits();
  const employees = useEmployees();

  const { register, watch, handleSubmit } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),

    defaultValues: {
      positionId: defaults.positionId ?? "",

      positionOrgUnitId:
        defaults.positionOrgUnitId ?? defaults.currentOrgUnitId ?? "",

      assignmentType: defaults.assignmentType ?? "1",

      positionStartDate: defaults.positionStartDate ?? defaults.startDate ?? "",

      positionEndDate: defaults.positionEndDate ?? "",

      reportingToEmployeeId: defaults.reportingToEmployeeId ?? "",
    },
  });

  const orgUnitId = watch("positionOrgUnitId");

  const visiblePositions = orgUnitId
    ? positions.data?.filter(
        (position) => String(position.orgUnitId) === orgUnitId,
      )
    : positions.data;

  return (
    <form
      onSubmit={handleSubmit(next)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <Header step={4} title="Positions" description="Position information" />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-6 gap-y-5 px-8 py-4 md:grid-cols-2">
          <Field label="Position">
            <select {...register("positionId")} className={selectClass}>
              <option value="">Position</option>

              {visiblePositions?.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Organization Unit">
            <select {...register("positionOrgUnitId")} className={selectClass}>
              <option value="">Organization Unit</option>

              {units.data?.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Position Start Date">
            <Input {...register("positionStartDate")} type="date" />
          </Field>

          <Field label="Position End Date">
            <Input {...register("positionEndDate")} type="date" />
          </Field>

          <Field label="Reports To">
            <select
              {...register("reportingToEmployeeId")}
              className={selectClass}
            >
              <option value="">Reports To</option>

              {employees.data?.map((employee) => (
                <option key={employee.employeeId} value={employee.employeeId}>
                  {employee.displayName ?? employee.employeeNumber}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assignment Type">
            <select {...register("assignmentType")} className={selectClass}>
              <option value="1">Permanent</option>

              <option value="2">Acting</option>

              <option value="3">Temporary</option>
            </select>
          </Field>
        </div>

        <DesignArt />
      </div>

      <Footer step={4} onBack={back} onSkip={skip} />
    </form>
  );
}

function ContractStep({
  defaults,
  submit,
  back,
  skip,
  pending,
}: {
  defaults: WizardData;
  submit: (values: ContractFormValues) => void;
  back: () => void;
  skip: () => void;
  pending: boolean;
}) {
  const types = useContractTypes();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),

    defaultValues: {
      contractTypeId: defaults.contractTypeId ?? "",

      contractNumber: defaults.contractNumber ?? "",

      contractStartDate: defaults.contractStartDate ?? defaults.startDate ?? "",

      contractEndDate: defaults.contractEndDate ?? "",

      salary: defaults.salary ?? "",

      salaryCurrency: defaults.salaryCurrency ?? "EGP",

      workingHoursPerWeek: defaults.workingHoursPerWeek ?? "",

      workingHoursPerMonth: defaults.workingHoursPerMonth ?? "",

      probationPeriodDays: defaults.probationPeriodDays ?? "",

      workType: defaults.workType ?? "Full Time",
      contractNotes: defaults.contractNotes ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <Header
        step={5}
        title="Contract"
        description="The employee contract information"
      />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-5 gap-y-4 px-8 py-3 md:grid-cols-2">
          <Field label="Contract Type">
            <select {...register("contractTypeId")} className={selectClass}>
              <option value="">Contract Type</option>

              {types.data?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Contract Number">
            <Input {...register("contractNumber")} />
          </Field>

          <Field label="Start Date">
            <Input {...register("contractStartDate")} type="date" />
          </Field>

          <Field label="End Date">
            <Input {...register("contractEndDate")} type="date" />
          </Field>

          <Field
            label="Working Hours / Week"
            error={errors.workingHoursPerWeek?.message}
          >
            <Input {...register("workingHoursPerWeek")} />
          </Field>

          <Field
            label="Working Hours / Month"
            error={errors.workingHoursPerMonth?.message}
          >
            <Input {...register("workingHoursPerMonth")} />
          </Field>

          <Field
            label="Probation Period (Days)"
            error={errors.probationPeriodDays?.message}
          >
            <Input {...register("probationPeriodDays")} />
          </Field>

          <Field label="Work Type">
            <select {...register("workType")} className={selectClass}>
              <option value="Full Time">Full Time</option>

              <option value="Part Time">Part Time</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Contract Notes">
              <textarea
                {...register("contractNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Contract notes"
              />
            </Field>
          </div>
        </div>

        <DesignArt />
      </div>

      <Footer step={5} onBack={back} onSkip={skip} pending={pending} final />
    </form>
  );
}

function numberOrNull(value?: string) {
  return value ? Number(value) : null;
}

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateEmployee();

  const [step, setStep] = useState(1);

  const [data, setData] = useState<WizardData>({});

  const defaults = useMemo(() => data, [data]);

  const save = (values: WizardData, nextStep: number) => {
    setData((current) => ({
      ...current,
      ...values,
    }));

    setStep(nextStep);
  };

  const create = async (contract: ContractFormValues = {}) => {
    const all = {
      ...data,
      ...contract,
    };

    try {
      const employeeId = await mutation.mutateAsync({
        account: {
          username: all.username ?? "",

          email: all.email ?? "",

          password: all.password ?? "",
        },

        employee: {
          employeeNumber: all.employeeNumber ?? "",

          firstName: all.firstName ?? "",

          otherName: all.otherName || null,

          displayName:
            all.displayName?.trim() ||
            [all.firstName, all.otherName].filter(Boolean).join(" "),

          gender: all.gender === "Female" ? 2 : 1,

          birthDate: all.birthDate || null,

          nationalId: all.nationalId || null,
          nationalIdExpiryDate: all.nationalIdExpiryDate || null,

          militaryExemptionExpiryDate:
            all.gender === "Female"
              ? null
              : all.militaryExemptionExpiryDate || null,

          qualification: all.qualification?.trim() || null,

          socialInsuranceNumber: all.socialInsuranceNumber?.trim() || null,

          maritalStatus: all.maritalStatus?.trim() || null,

          graduationDate: all.graduationDate || null,

          specialization: all.specialization?.trim() || null,

          workLocation: all.workLocation?.trim() || null,

          healthInsuranceCardNumber:
            all.healthInsuranceCardNumber?.trim() || null,

          totalExperienceYears: numberOrNull(all.totalExperienceYears),

          leaveNotes: all.leaveNotes?.trim() || null,

          personalEmail: all.personalEmail || all.email || null,

          businessEmail: all.businessEmail || null,

          phoneNumber: all.phoneNumber || null,

          mobileNumber: all.mobileNumber || null,

          countryId: numberOrNull(all.countryId),

          stateId: numberOrNull(all.stateId),

          cityId: numberOrNull(all.cityId),

          addressLine1: all.addressLine1 || null,

          addressLine2: all.addressLine2 || null,

          postalCode: all.postalCode || null,

          profilePhotoBase64: all.profilePhotoBase64 || null,

          skills: (all.skills ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),

          currentOrgUnitId: numberOrNull(
            all.positionOrgUnitId || all.currentOrgUnitId,
          ),

          employeeStatusId: numberOrNull(all.employeeStatusId),

          hireDate: all.hireDate || null,

          startDate: all.startDate || null,

          positionId: numberOrNull(all.positionId),

          assignmentType: numberOrNull(all.assignmentType),

          positionStartDate: all.positionStartDate || null,

          positionEndDate: all.positionEndDate || null,

          reportingToEmployeeId: numberOrNull(all.reportingToEmployeeId),

          contractTypeId: numberOrNull(all.contractTypeId),

          contractNumber: all.contractNumber || null,

          contractStartDate: all.contractStartDate || null,

          contractEndDate: all.contractEndDate || null,

          salary: null,
          salaryCurrency: "EGP",

          workingHoursPerWeek: numberOrNull(all.workingHoursPerWeek),

          workingHoursPerMonth: numberOrNull(all.workingHoursPerMonth),

          probationPeriodDays: numberOrNull(all.probationPeriodDays),

          fulltime: all.workType ? all.workType === "Full Time" : null,
          contractNotes: all.contractNotes?.trim() || null,
        },
      });

      toast.success("Employee created successfully");

      navigate(`/hr/employees/${employeeId}`);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to create employee";

      toast.error(message);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && navigate("/hr/employees")}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1140px, 95vw)",
          maxWidth: "none",
          height: "min(663px, 92vh)",
        }}
      >
        <DialogTitle className="sr-only">Create Employee</DialogTitle>

        {step === 1 && (
          <IdentityStep
            defaults={defaults}
            next={(values) => save(values, 2)}
          />
        )}

        {step === 2 && (
          <PersonalStep
            defaults={defaults}
            next={(values) => save(values, 3)}
            back={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <EmploymentStep
            defaults={defaults}
            next={(values) => save(values, 4)}
            back={() => setStep(2)}
            skip={() => save({}, 4)}
          />
        )}

        {step === 4 && (
          <PositionStep
            defaults={defaults}
            next={(values) => save(values, 5)}
            back={() => setStep(3)}
            skip={() => save({}, 5)}
          />
        )}

        {step === 5 && (
          <ContractStep
            defaults={defaults}
            submit={create}
            back={() => setStep(4)}
            skip={() => create({})}
            pending={mutation.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
