import { useTranslation } from "react-i18next";

import { isProtectedRole } from "@/features/security/utils/security-access";

/** Raw role codes, as returned on user summaries. */
export function RoleChips({ roles, max = 3 }: { roles: string[]; max?: number }) {
  const { t } = useTranslation();

  if (roles.length === 0) {
    return <span className="font-['Inter',sans-serif] text-sm text-gray-400">{t("security.users.noRoles")}</span>;
  }

  const visible = roles.slice(0, max);
  const hidden = roles.length - visible.length;

  return (
    <ul className="flex flex-wrap gap-1" aria-label={t("security.users.columns.roles")}>
      {visible.map((roleCode) => (
        <li
          key={roleCode}
          className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${
            isProtectedRole(roleCode)
              ? "bg-[#f5841f]/10 text-[#c2620f]"
              : "bg-[#f4f6f9] text-gray-600"
          }`}
        >
          {roleCode}
        </li>
      ))}
      {hidden > 0 && (
        <li
          title={roles.slice(max).join(", ")}
          className="rounded-full bg-gray-100 px-2 py-0.5 font-['Inter',sans-serif] text-[11px] text-gray-500"
        >
          {t("security.users.moreRoles", { count: hidden })}
        </li>
      )}
    </ul>
  );
}
