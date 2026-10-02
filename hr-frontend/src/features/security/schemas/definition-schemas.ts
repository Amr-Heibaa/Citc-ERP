import { z } from "zod";

import type {
  SecurityModuleRequest,
  SecurityModuleSummary,
  SecurityPermissionRequest,
  SecurityPermissionSummary,
  SecurityRoleRequest,
  SecurityRoleSummary,
} from "@/features/security/api/security-types";

// Client-side mirrors of the backend validation limits (role/module code 50,
// name 100; permission code 100, name 255; descriptions 255; permission codes
// must not begin with ROLE_). The server remains authoritative — including
// code normalization to UPPER_SNAKE_CASE — and its 400/409 messages are shown
// as-is.

function optionalText(max: number, label: string) {
  return z.string().trim().max(max, `${label} must not exceed ${max} characters`);
}

// ---------------------------------------------------------------- roles

export const roleSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Role code is required")
    .max(50, "Role code must not exceed 50 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Role name is required")
    .max(100, "Role name must not exceed 100 characters"),
  description: optionalText(255, "Description"),
  active: z.boolean(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export function roleToFormValues(role?: SecurityRoleSummary): RoleFormValues {
  return {
    code: role?.roleCode ?? "",
    name: role?.roleName ?? "",
    description: role?.description ?? "",
    active: role?.active ?? true,
  };
}

export function toRoleRequest(values: RoleFormValues): SecurityRoleRequest {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    active: values.active,
  };
}

// ---------------------------------------------------------- permissions

export const permissionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Permission code is required")
    .max(100, "Permission code must not exceed 100 characters")
    .refine((value) => !value.toUpperCase().startsWith("ROLE_"), {
      message: "Permission code must not begin with ROLE_",
    }),
  name: z
    .string()
    .trim()
    .min(1, "Permission name is required")
    .max(255, "Permission name must not exceed 255 characters"),
  description: optionalText(255, "Description"),
  active: z.boolean(),
  /** Select value; "" means no module. */
  applicationModuleId: z.string(),
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;

export function permissionToFormValues(permission?: SecurityPermissionSummary): PermissionFormValues {
  return {
    code: permission?.permissionCode ?? "",
    name: permission?.permissionName ?? "",
    description: permission?.description ?? "",
    active: permission?.active ?? true,
    applicationModuleId:
      permission?.applicationModuleId != null ? String(permission.applicationModuleId) : "",
  };
}

export function toPermissionRequest(values: PermissionFormValues): SecurityPermissionRequest {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    active: values.active,
    // null explicitly clears the module on update.
    applicationModuleId: values.applicationModuleId ? Number(values.applicationModuleId) : null,
  };
}

// --------------------------------------------------------------- modules

export const moduleSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Module code is required")
    .max(50, "Module code must not exceed 50 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Module name is required")
    .max(100, "Module name must not exceed 100 characters"),
  description: optionalText(255, "Description"),
  active: z.boolean(),
});

export type ModuleFormValues = z.infer<typeof moduleSchema>;

export function moduleToFormValues(module?: SecurityModuleSummary): ModuleFormValues {
  return {
    code: module?.applicationCode ?? "",
    name: module?.applicationName ?? "",
    description: module?.description ?? "",
    active: module?.active ?? true,
  };
}

export function toModuleRequest(values: ModuleFormValues): SecurityModuleRequest {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    active: values.active,
  };
}
