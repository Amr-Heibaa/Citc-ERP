import { Award, Briefcase } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmployeeDetail } from "@/features/hr/api/use-employees";
import type { EmployeeDetail, HistoryEntry } from "@/lib/api/hr-api";

const TAB_TRIGGER_CLASS =
  "h-12 flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 shadow-none data-[state=active]:border-[#f5841f] data-[state=active]:bg-transparent data-[state=active]:text-[#f5841f]";
function fmt(v: string | null) {
  return v ? new Date(v).toLocaleDateString("en-GB") : "—";
}
function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#f4f6f9] px-4 py-3">
      <span className="font-['Inter',sans-serif] text-sm text-gray-500">
        {label}
      </span>
      <span
        className={`font-['Inter',sans-serif] text-sm font-medium ${accent ? "text-emerald-600" : "text-[#1a2535]"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </h3>
  );
}

function OverviewTab({ emp }: { emp: EmployeeDetail }) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>Employee Information</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Employee ID" value={emp.employeeNumber} />
          <InfoRow label="Hire Date" value={fmt(emp.hireDate)} />
          <InfoRow label="Status" value={emp.statusName} accent />
          <InfoRow label="Start Date" value={fmt(emp.startDate)} />
        </div>
      </div>
      <div>
        <SectionTitle>Organization</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Branch" value={emp.branch} />
          <InfoRow label="Section" value={emp.section} />
          <InfoRow label="Department" value={emp.department} />
          <div />
        </div>
      </div>
      <div>
        <SectionTitle>Position</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label="Position" value={emp.positionTitle} />
          <InfoRow label="Grade" value={emp.gradeName} />
          <InfoRow label="Manager" value={emp.manager} />
        </div>
      </div>
      <div>
        <SectionTitle>Skills</SectionTitle>
        {(emp.skills ?? []).length === 0 ? (
          <p className="text-[13px] text-gray-400">No skills recorded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(emp.skills ?? []).map((s) => (
              <span
                key={s}
                className="rounded-full bg-emerald-100 px-3 py-1 font-['Inter',sans-serif] text-xs font-medium text-emerald-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalTab({ emp }: { emp: EmployeeDetail }) {
  const fn = emp.firstName ?? "";
  const on = emp.otherName ?? "";
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
                {(fn[0] ?? "") + (on[0] ?? "")}
              </span>
            )}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoRow label="First Name" value={emp.firstName} />
            <InfoRow label="Other Name" value={emp.otherName} />
            <InfoRow label="Display Name" value={emp.displayName} />
            <InfoRow label="Gender" value={emp.genderLabel} />
            <InfoRow label="Birth Date" value={fmt(emp.birthDate)} />
            <InfoRow label="National ID" value={emp.nationalId} />
            <InfoRow
              label="ID Expiry Date"
              value={fmt(emp.nationalIdExpiryDate)}
            />

            <InfoRow label="Qualification" value={emp.qualification} />

            {emp.gender === 1 && (
              <InfoRow
                label="Military Exemption Expiry"
                value={fmt(emp.militaryExemptionExpiryDate)}
              />
            )}
          </div>
        </div>
      </div>
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

function EmploymentTab({ emp }: { emp: EmployeeDetail }) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>Current Employment</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Department" value={emp.department} />
          <InfoRow label="Status" value={emp.statusName} accent />
          <InfoRow label="Hire Date" value={fmt(emp.hireDate)} />
          <InfoRow label="Start Date" value={fmt(emp.startDate)} />
        </div>
      </div>
      <div>
        <SectionTitle>Current Position</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Position" value={emp.positionTitle} />
          <InfoRow label="Grade" value={emp.gradeName} />
          <InfoRow label="Grade Rank" value={emp.gradeRank} />
          <InfoRow label="Termination Date" value={fmt(emp.terminationDate)} />
        </div>
      </div>
      <div>
        <SectionTitle>Management</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label="Team Leader" value={emp.teamLeader} />
          <InfoRow label="Manager" value={emp.manager} />
          <div />
        </div>
      </div>
    </div>
  );
}

function ContractsTab({ emp }: { emp: EmployeeDetail }) {
  const contracts = emp.contracts ?? [];

  if (contracts.length === 0) {
    return (
      <div className="py-8 text-center font-['Inter',sans-serif] text-gray-400">
        No contracts on file.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
      {contracts.map((c) => (
        <div
          key={c.contractId}
          className="rounded-xl border border-gray-100 bg-[#f4f6f9] p-4"
        >
          <div className="mb-1 flex items-start justify-between">
            <div>
              <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                Contract #{c.contractNumber ?? c.contractId}
              </p>
              {c.salary != null && (
                <p className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500">
                  Salary : {c.salary} {c.salaryCurrency}
                </p>
              )}
            </div>
            <Badge
              className={`border-0 ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}
            >
              {c.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-3 flex items-center gap-1 font-['Inter',sans-serif] text-xs text-gray-400">
            📅 {fmt(c.startDate)} - {c.endDate ? fmt(c.endDate) : "Ongoing"}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ history }: { history: HistoryEntry[] }) {
  const records = history ?? [];

  if (records.length === 0) {
    return (
      <div className="py-8 text-center font-['Inter',sans-serif] text-gray-400">
        No history records.
      </div>
    );
  }
  return (
    <div className="py-4">
      <div className="relative">
        <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gray-100" />
        <div className="flex flex-col gap-0">
          {records.map((h) => {
            const Icon = h.current ? Award : Briefcase;
            const bg = h.current ? "bg-emerald-100" : "bg-blue-100";
            const color = h.current ? "text-emerald-500" : "text-blue-500";
            return (
              <div key={h.employmentId} className="relative flex gap-4 pb-6">
                <div
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon size={14} className={color} />
                </div>
                <div className="flex-1 rounded-xl bg-[#f4f6f9] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                        {h.positionTitle ?? "—"}
                      </p>
                      <p className="mt-0.5 font-['Inter',sans-serif] text-xs text-gray-500">
                        {h.orgUnitName ?? "—"}
                      </p>
                      {h.reportingToName && (
                        <p className="mt-1.5 font-['Inter',sans-serif] text-xs text-gray-400">
                          Reports to {h.reportingToName}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="whitespace-nowrap font-['Inter',sans-serif] text-xs text-gray-400">
                        {fmt(h.startDate)} →{" "}
                        {h.endDate ? fmt(h.endDate) : "Present"}
                      </span>
                      {h.current && (
                        <Badge className="border-0 bg-emerald-100 text-emerald-700">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const id = Number(employeeId);
  const { data: emp, isLoading, isError } = useEmployeeDetail(id);

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-gray-400">
        Loading employee…
      </div>
    );
  if (isError || !emp) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">Employee not found.</p>
        <Button variant="outline" onClick={() => navigate("/hr/employees")}>
          Back to list
        </Button>
      </div>
    );
  }

  const fullName =
    emp.displayName ||
    [emp.firstName, emp.otherName].filter(Boolean).join(" ") ||
    "—";
  const subtitle = [emp.positionTitle, emp.department]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Hero */}
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
              # {fmt(emp.hireDate)}
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
      {/* Tabs panel */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <Tabs defaultValue="overview" className="w-full gap-0">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5">
            <div className="min-w-0 flex-1 overflow-x-auto">
              <TabsList className="h-auto w-max gap-7 rounded-none bg-transparent p-0">
                <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
                  Overview
                </TabsTrigger>

                <TabsTrigger value="personal" className={TAB_TRIGGER_CLASS}>
                  Personal Information
                </TabsTrigger>

                <TabsTrigger value="employment" className={TAB_TRIGGER_CLASS}>
                  Employment
                </TabsTrigger>

                <TabsTrigger value="contracts" className={TAB_TRIGGER_CLASS}>
                  Contracts
                </TabsTrigger>

                <TabsTrigger value="history" className={TAB_TRIGGER_CLASS}>
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            <Button
              size="sm"
              onClick={() => navigate(`/hr/employees/${id}/edit`)}
              className="shrink-0"
            >
              Edit Employee
            </Button>
          </div>

          <div className="px-5 pb-5">
            <TabsContent value="overview">
              <OverviewTab emp={emp} />
            </TabsContent>

            <TabsContent value="personal">
              <PersonalTab emp={emp} />
            </TabsContent>

            <TabsContent value="employment">
              <EmploymentTab emp={emp} />
            </TabsContent>

            <TabsContent value="contracts">
              <ContractsTab emp={emp} />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab history={emp.history ?? []} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
