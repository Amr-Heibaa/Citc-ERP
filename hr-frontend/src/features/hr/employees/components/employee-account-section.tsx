import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/stores/user-store";
import { EditSection } from "@/features/hr/shared/components/edit-section";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import {
  useCreateEmployeeAccount,
  useResetEmployeePassword,
} from "@/features/hr/employees/api/use-employees";
import {
  employeeDetailToEditFormValues,
  toUpdateEmployeeRequest,
} from "@/features/hr/employees/schemas/employee-mappers";
import type { EmployeeDetail } from "@/lib/api/generated/model";

const ADMIN_ROLES = ["SYSTEM_ADMIN", "HR_ADMIN"];

export function EmployeeAccountSection({ employee }: { employee: EmployeeDetail }) {
  const { t } = useTranslation();
  const roles = useUserStore((s) => s.roles);
  const isAdmin = ADMIN_ROLES.some((role) => roles.includes(role));

  const createAccount = useCreateEmployeeAccount(employee.employeeId ?? 0);
  const resetPassword = useResetEmployeePassword();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(employee.businessEmail ?? employee.personalEmail ?? "");
  const [password, setPassword] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  async function handleCreateAccount() {
    if (!username.trim() || !email.trim() || !password) {
      toast.error(t("employees.account.missingFields"));
      return;
    }

    try {
      await createAccount.mutateAsync({
        account: { username: username.trim(), email: email.trim(), password },
        employeePayload: toUpdateEmployeeRequest(employeeDetailToEditFormValues(employee)),
      });

      toast.success(t("employees.account.createdSuccess"));
      setPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.account.createError"),
      );
    }
  }

  async function handleResetPassword() {
    if (!employee.userId) return;

    if (newPassword.length < 6) {
      toast.error(t("employees.account.passwordTooShort"));
      return;
    }

    try {
      await resetPassword.mutateAsync({ userId: employee.userId, newPassword });

      toast.success(t("employees.account.resetSuccess"));
      setNewPassword("");
      setResetOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.account.resetError"),
      );
    }
  }

  return (
    <EditSection title={t("employees.account.sectionTitle")}>
      {employee.userId ? (
        <>
          <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-white px-4 py-3">
            <p className="font-['Inter',sans-serif] text-sm text-[#1a2535]">
              {t("employees.account.hasAccount")}
            </p>

            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetOpen((open) => !open)}
              >
                {t("employees.account.resetPassword")}
              </Button>
            )}
          </div>

          {isAdmin && resetOpen && (
            <div className="md:col-span-2 flex flex-col gap-3 rounded-lg bg-white p-4">
              <LabeledField label={t("employees.account.newPassword")}>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </LabeledField>

              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={resetPassword.isPending}
                className="self-start"
              >
                {resetPassword.isPending
                  ? t("employees.account.resetting")
                  : t("employees.account.confirmReset")}
              </Button>
            </div>
          )}

          {!isAdmin && (
            <p className="md:col-span-2 font-['Inter',sans-serif] text-xs text-gray-400">
              {t("employees.account.adminOnlyReset")}
            </p>
          )}
        </>
      ) : (
        <>
          <LabeledField label={t("employees.account.username")}>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
          </LabeledField>

          <LabeledField label={t("employees.account.email")}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </LabeledField>

          <LabeledField label={t("employees.account.password")}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </LabeledField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleCreateAccount}
              disabled={createAccount.isPending}
            >
              {createAccount.isPending
                ? t("employees.account.creating")
                : t("employees.account.createAccount")}
            </Button>
          </div>
        </>
      )}
    </EditSection>
  );
}
