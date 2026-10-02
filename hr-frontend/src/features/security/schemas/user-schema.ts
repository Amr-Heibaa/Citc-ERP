import { z } from "zod";

import type { CreateUserRequest } from "@/lib/api/auth";

// Form for the existing account-creation endpoint (POST /api/auth/users).
// Password policy is enforced by the backend; only presence is checked here.
export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(100, "Username must not exceed 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const EMPTY_CREATE_USER: CreateUserFormValues = { username: "", email: "", password: "" };

export function toCreateUserRequest(values: CreateUserFormValues): CreateUserRequest {
  return {
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
  };
}
