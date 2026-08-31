import { useTranslation } from "react-i18next";

import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function PersonalTab({ emp }: { emp: EmployeeDetail }) {
  const { t } = useTranslation();
  const firstInitial = emp.firstName?.[0] ?? "";
  const otherInitial = emp.otherName?.[0] ?? "";

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>{t("employees.sections.basicInformation")}</SectionTitle>

        <div className="flex gap-4">
          <div className="flex size-[96px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2535] to-[#243347]">
            {emp.profilePhotoDataUrl ? (
              <img
                src={emp.profilePhotoDataUrl}
                alt={emp.displayName ?? t("employees.table.employee")}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-['Inter',sans-serif] text-3xl font-bold text-white">
                {firstInitial + otherInitial}
              </span>
            )}
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoRow label={t("employees.fields.firstName")} value={emp.firstName} />
            <InfoRow label={t("employees.fields.otherName")} value={emp.otherName} />
            <InfoRow label={t("employees.fields.displayName")} value={emp.displayName} />
            <InfoRow label={t("employees.fields.gender")} value={emp.genderLabel} />
            <InfoRow label={t("employees.fields.birthDate")} value={formatDate(emp.birthDate)} />
            <InfoRow label={t("employees.fields.nationalId")} value={emp.nationalId} />
            <InfoRow
              label={t("employees.fields.idExpiryDate")}
              value={formatDate(emp.nationalIdExpiryDate)}
            />

            {emp.gender === 1 && (
              <InfoRow
                label={t("employees.fields.militaryExemptionExpiry")}
                value={formatDate(emp.militaryExemptionExpiryDate)}
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.officialInformation")}</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            label={t("employees.fields.socialInsuranceNumber")}
            value={emp.socialInsuranceNumber}
          />

          <InfoRow label={t("employees.fields.maritalStatus")} value={emp.maritalStatus} />

          <InfoRow
            label={t("employees.fields.healthInsuranceCard")}
            value={emp.healthInsuranceCardNumber}
          />

          <InfoRow label={t("employees.fields.graduationDate")} value={formatDate(emp.graduationDate)} />

          <InfoRow label={t("employees.fields.specialization")} value={emp.specialization} />

          <InfoRow
            label={t("employees.fields.totalExperience")}
            value={
              emp.totalExperienceYears != null
                ? t("employees.fields.totalExperienceYears", { count: emp.totalExperienceYears })
                : null
            }
          />

          <InfoRow label={t("employees.fields.workLocation")} value={emp.workLocation} />

          <InfoRow label={t("employees.fields.qualification")} value={emp.qualification} />
        </div>
      </div>

      {emp.leaveNotes && (
        <div>
          <SectionTitle>{t("employees.sections.leaveNotes")}</SectionTitle>

          <div className="whitespace-pre-wrap rounded-lg bg-[#f4f6f9] px-4 py-3 font-['Inter',sans-serif] text-sm text-[#1a2535]">
            {emp.leaveNotes}
          </div>
        </div>
      )}

      <div>
        <SectionTitle>{t("employees.sections.contact")}</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label={t("employees.fields.personalEmail")} value={emp.personalEmail} />
          <InfoRow label={t("employees.fields.phone")} value={emp.phoneNumber} />
          <InfoRow label={t("employees.fields.businessEmail")} value={emp.businessEmail} />
          <InfoRow label={t("employees.fields.mobile")} value={emp.mobileNumber} />
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.address")}</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label={t("employees.fields.addressLine1")} value={emp.addressLine1} />
          <InfoRow label={t("employees.fields.addressLine2")} value={emp.addressLine2} />
          <InfoRow label={t("employees.fields.postalCode")} value={emp.postalCode} />
        </div>
      </div>
    </div>
  );
}
