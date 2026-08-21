import { Badge } from "@/components/ui/badge";
import { formatDate, initials } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function EmployeeDetailHero({ emp }: { emp: EmployeeDetail }) {
  const fullName =
    emp.displayName ||
    [emp.firstName, emp.otherName].filter(Boolean).join(" ") ||
    "—";

  const subtitle = [emp.positionTitle, emp.department].filter(Boolean).join("  ·  ");

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
      }}
    >
      <div className="flex min-h-[88px] items-center gap-4 px-5 py-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5841f]">
          {emp.profilePhotoDataUrl ? (
            <img
              src={emp.profilePhotoDataUrl}
              alt={fullName}
              className="size-full object-cover"
            />
          ) : (
            <span className="font-['Inter',sans-serif] text-sm font-bold text-white">
              {initials(fullName)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-['Inter',sans-serif] text-lg font-bold text-white">
            {fullName}
          </p>

          <p className="truncate font-['Inter',sans-serif] text-xs text-[#a4aab6]">
            {subtitle || "—"}
          </p>
        </div>

        <div className="hidden flex-col items-end gap-0.5 text-right sm:flex">
          {emp.businessEmail && (
            <p className="max-w-[260px] truncate font-['Inter',sans-serif] text-[11px] text-white">
              # {emp.businessEmail}
            </p>
          )}

          <p className="font-['Inter',sans-serif] text-[11px] text-[#a4aab6]">
            # {formatDate(emp.hireDate)}
          </p>

          {emp.mobileNumber && (
            <p className="font-['Inter',sans-serif] text-[11px] text-white">
              @ {emp.mobileNumber}
            </p>
          )}

          <Badge className="mt-0.5 border-0 bg-emerald-500/20 px-2 py-0 text-[10px] text-emerald-300">
            {emp.statusName ?? emp.statusCode ?? "—"}
          </Badge>
        </div>

        <div className="relative ml-2 flex min-h-14 min-w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5841f]/20 px-3">
          <span className="text-center font-['Space_Grotesk',sans-serif] text-sm font-bold leading-tight text-white">
            {emp.employeeNumber}
          </span>
        </div>
      </div>
    </div>
  );
}
