import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function PersonalTab({ emp }: { emp: EmployeeDetail }) {
  const firstInitial = emp.firstName?.[0] ?? "";
  const otherInitial = emp.otherName?.[0] ?? "";

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>Basic Information</SectionTitle>

        <div className="flex gap-4">
          <div className="flex size-[96px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2535] to-[#243347]">
            {emp.profilePhotoDataUrl ? (
              <img
                src={emp.profilePhotoDataUrl}
                alt={emp.displayName ?? "Employee"}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-['Inter',sans-serif] text-3xl font-bold text-white">
                {firstInitial + otherInitial}
              </span>
            )}
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoRow label="First Name" value={emp.firstName} />
            <InfoRow label="Other Name" value={emp.otherName} />
            <InfoRow label="Display Name" value={emp.displayName} />
            <InfoRow label="Gender" value={emp.genderLabel} />
            <InfoRow label="Birth Date" value={formatDate(emp.birthDate)} />
            <InfoRow label="National ID" value={emp.nationalId} />
            <InfoRow
              label="ID Expiry Date"
              value={formatDate(emp.nationalIdExpiryDate)}
            />

            {emp.gender === 1 && (
              <InfoRow
                label="Military Exemption Expiry"
                value={formatDate(emp.militaryExemptionExpiryDate)}
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Official Information</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            label="Social Insurance Number"
            value={emp.socialInsuranceNumber}
          />

          <InfoRow label="Marital Status" value={emp.maritalStatus} />

          <InfoRow
            label="Health Insurance Card"
            value={emp.healthInsuranceCardNumber}
          />

          <InfoRow label="Graduation Date" value={formatDate(emp.graduationDate)} />

          <InfoRow label="Specialization" value={emp.specialization} />

          <InfoRow
            label="Total Experience"
            value={
              emp.totalExperienceYears != null
                ? `${emp.totalExperienceYears} years`
                : null
            }
          />

          <InfoRow label="Work Location" value={emp.workLocation} />

          <InfoRow label="Qualification" value={emp.qualification} />
        </div>
      </div>

      {emp.leaveNotes && (
        <div>
          <SectionTitle>Leave Notes</SectionTitle>

          <div className="whitespace-pre-wrap rounded-lg bg-[#f4f6f9] px-4 py-3 font-['Inter',sans-serif] text-sm text-[#1a2535]">
            {emp.leaveNotes}
          </div>
        </div>
      )}

      <div>
        <SectionTitle>Contact</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Personal Email" value={emp.personalEmail} />
          <InfoRow label="Phone" value={emp.phoneNumber} />
          <InfoRow label="Business Email" value={emp.businessEmail} />
          <InfoRow label="Mobile" value={emp.mobileNumber} />
        </div>
      </div>

      <div>
        <SectionTitle>Address</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label="Address Line 1" value={emp.addressLine1} />
          <InfoRow label="Address Line 2" value={emp.addressLine2} />
          <InfoRow label="Postal Code" value={emp.postalCode} />
        </div>
      </div>
    </div>
  );
}
