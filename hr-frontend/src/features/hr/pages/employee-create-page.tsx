import type { ReactNode } from "react";
import { useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCreateUserMutationOptions,
  getAssignRoleMutationOptions,
  useListRoles,
} from "@/lib/api/generated/ems/iam-admin-controller/iam-admin-controller";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCreateEmployeeMutationOptions,
  getListEmployeesQueryKey,
} from "@/lib/api/generated/ems/employee-controller/employee-controller";
import {
  useListOrganizationUnits,
  useListEmployeeStatuses,
} from "@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller";
import { queryClient } from "@/lib/api/query-client";

const schema = z
  .object({
    employeeNumber: z.string().min(1, "Required").max(50),
    currentOrgUnitId: z.string().optional(),
    employeeStatusId: z.string().optional(),
    hireDate: z.string().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    firstName: z.string().min(1, "Required").max(100),
    otherName: z.string().min(1, "Required").max(200),
    displayName: z.string().max(100).optional().or(z.literal("")),
    gender: z.enum(["1", "2"], { message: "Required" }),
    birthDate: z.string().optional().or(z.literal("")),
    nationalId: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => {
        if (!v) return true;
        if (!/^[23]\d{13}$/.test(v)) return false;
        const century = v[0] === "2" ? 1900 : 2000;
        const year = century + Number(v.slice(1, 3));
        const month = Number(v.slice(3, 5));
        const day = Number(v.slice(5, 7));
        const d = new Date(year, month - 1, day);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month - 1 &&
          d.getDate() === day
        );
      }, "Invalid Egyptian national ID"),
    personalEmail: z
      .string()
      .email("Invalid email")
      .max(100)
      .optional()
      .or(z.literal("")),
    businessEmail: z
      .string()
      .email("Invalid email")
      .max(100)
      .optional()
      .or(z.literal("")),
    phoneNumber: z.string().max(100).optional().or(z.literal("")),
    mobileNumber: z.string().max(100).optional().or(z.literal("")),
    addressLine1: z.string().max(255).optional().or(z.literal("")),
    addressLine2: z.string().max(255).optional().or(z.literal("")),
    postalCode: z.string().max(20).optional().or(z.literal("")),

    createLogin: z.boolean().optional(),
    username: z.string().optional().or(z.literal("")),
    loginEmail: z.string().optional().or(z.literal("")),
    password: z.string().optional().or(z.literal("")),
    roleId: z.string().optional(),
  })
  .refine(
    (d) => !d.createLogin || (d.username && d.username.trim().length >= 3),
    {
      message: "Username is required (min 3 chars)",
      path: ["username"],
    },
  )
  .refine(
    (d) =>
      !d.createLogin ||
      (d.loginEmail && /^[^@]+@[^@]+\.[^@]+$/.test(d.loginEmail)),
    {
      message: "Valid email is required",
      path: ["loginEmail"],
    },
  )
  .refine((d) => !d.createLogin || (d.password && d.password.length >= 8), {
    message: "Password must be at least 8 characters",
    path: ["password"],
  });

type FormValues = z.infer<typeof schema>;

const emptyToUndef = (v?: string) => (v ? v : undefined);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-['Space_Grotesk',sans-serif] text-[15px] font-semibold text-[#1a2535]">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

/** Reusable text/date/email field wired to the form. */
function TextField({
  control,
  name,
  label,
  required,
  type = "text",
  placeholder,
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && " *"}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const orgUnits = useListOrganizationUnits({ size: 200 });
  const statuses = useListEmployeeStatuses({ size: 50 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeNumber: "", firstName: "", otherName: "" },
  });

  const createMutation = useMutation({
    ...getCreateEmployeeMutationOptions(),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: [getListEmployeesQueryKey()[0]],
      });
      toast.success(`Employee ${created.employeeNumber} created`);
      navigate("/hr/employees");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ?? "Failed to create employee",
      );
    },
  });

  const createUserMutation = useMutation({
    ...getCreateUserMutationOptions(),
  });

  const assignRoleMutation = useMutation({
    ...getAssignRoleMutationOptions(),
  });
  const roles = useListRoles({ size: 50 });

  async function onSubmit(v: FormValues) {
    let userId: number | undefined;

    // step 1 — optionally create a login account first
    if (v.createLogin) {
      try {
        const user = await createUserMutation.mutateAsync({
          data: {
            username: v.username!.trim(),
            email: v.loginEmail!.trim(),
            password: v.password!,
          },
        });
        userId = user.userId;
        // assign the selected role to the new user
        if (v.roleId) {
          try {
            await assignRoleMutation.mutateAsync({
              userId,
              data: { roleId: Number(v.roleId) },
            });
          } catch (error) {
            toast.error(
              (error as { message?: string })?.message ??
                "User created, but role assignment failed",
            );
            // continue — the user exists; employee creation proceeds
          }
        }
      } catch (error) {
        toast.error(
          (error as { message?: string })?.message ??
            "Failed to create login account",
        );
        return; // stop — don't create the employee if the user failed
      }
    }

    // step 2 — create the employee, linked to the new user if one was made
    createMutation.mutate({
      data: {
        employeeNumber: v.employeeNumber,
        userId,
        currentOrgUnitId: v.currentOrgUnitId
          ? Number(v.currentOrgUnitId)
          : undefined,
        employeeStatusId: v.employeeStatusId
          ? Number(v.employeeStatusId)
          : undefined,
        hireDate: emptyToUndef(v.hireDate),
        startDate: emptyToUndef(v.startDate),
        profile: {
          primary: true,
          firstName: v.firstName,
          otherName: v.otherName,
          displayName: emptyToUndef(v.displayName),
          gender: Number(v.gender),
          birthDate: emptyToUndef(v.birthDate),
          nationalId: emptyToUndef(v.nationalId),
          personalEmail: emptyToUndef(v.personalEmail),
          businessEmail: emptyToUndef(v.businessEmail),
          phoneNumber: emptyToUndef(v.phoneNumber),
          mobileNumber: emptyToUndef(v.mobileNumber),
          addressLine1: emptyToUndef(v.addressLine1),
          addressLine2: emptyToUndef(v.addressLine2),
          postalCode: emptyToUndef(v.postalCode),
        },
      },
    });
  }

  const control = form.control;
  const createLogin = form.watch("createLogin");
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/hr/employees")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
          New Employee
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-7 rounded-xl border border-[#e5e7eb] bg-white p-5 md:p-6"
          noValidate
        >
          {/* EMPLOYMENT */}
          <Section title="Employment">
            <TextField
              control={control}
              name="employeeNumber"
              label="Employee Number"
              required
              placeholder="EMP-0016"
            />

            <FormField
              control={control}
              name="currentOrgUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orgUnits.data?.content?.map((u) => (
                        <SelectItem
                          key={u.orgUnitId}
                          value={String(u.orgUnitId)}
                        >
                          {u.unitName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="employeeStatusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.data?.content?.map((s) => (
                        <SelectItem
                          key={s.employeeStatusId}
                          value={String(s.employeeStatusId)}
                        >
                          {s.statusCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField
              control={control}
              name="hireDate"
              label="Hire Date"
              type="date"
            />
            <TextField
              control={control}
              name="startDate"
              label="Start Date"
              type="date"
            />
          </Section>

          {/* PERSONAL */}
          <Section title="Personal">
            <TextField
              control={control}
              name="firstName"
              label="First Name"
              required
              placeholder="Ahmed"
            />
            <TextField
              control={control}
              name="otherName"
              label="Other Name"
              required
              placeholder="Mohamed Ali"
            />
            <TextField
              control={control}
              name="displayName"
              label="Display Name"
              placeholder="Ahmed Ali"
            />

            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField
              control={control}
              name="birthDate"
              label="Birth Date"
              type="date"
            />
            <TextField
              control={control}
              name="nationalId"
              label="National ID"
              placeholder="29001011234567"
            />
          </Section>

          {/* CONTACT */}
          <Section title="Contact">
            <TextField
              control={control}
              name="personalEmail"
              label="Personal Email"
              type="email"
              placeholder="ahmed@gmail.com"
            />
            <TextField
              control={control}
              name="businessEmail"
              label="Business Email"
              type="email"
              placeholder="ahmed@citec.local"
            />
            <TextField
              control={control}
              name="phoneNumber"
              label="Phone Number"
              placeholder="02xxxxxxxx"
            />
            <TextField
              control={control}
              name="mobileNumber"
              label="Mobile Number"
              placeholder="010xxxxxxxx"
            />
          </Section>

          {/* ADDRESS */}
          <Section title="Address">
            <TextField
              control={control}
              name="addressLine1"
              label="Address Line 1"
            />
            <TextField
              control={control}
              name="addressLine2"
              label="Address Line 2"
            />
            <TextField
              control={control}
              name="postalCode"
              label="Postal Code"
            />
          </Section>

          {/* LOGIN ACCOUNT (optional) */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-[#f4f6f9] p-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...form.register("createLogin")}
                className="size-4 accent-[#f5841f]"
              />
              <span className="font-['Space_Grotesk',sans-serif] text-[15px] font-semibold text-[#1a2535]">
                Create a login account for this employee
              </span>
            </label>

            {createLogin && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  control={control}
                  name="username"
                  label="Username"
                  required
                />
                <TextField
                  control={control}
                  name="loginEmail"
                  label="Login Email"
                  type="email"
                  required
                />
                <TextField
                  control={control}
                  name="password"
                  label="Password"
                  type="password"
                  required
                />
                <FormField
                  control={control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.data?.content?.map((r) => (
                            <SelectItem key={r.roleId} value={String(r.roleId)}>
                              {r.roleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/hr/employees")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#f5841f] text-white hover:bg-[#e0761a]"
            >
              {createMutation.isPending ? "Saving…" : "Create Employee"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
