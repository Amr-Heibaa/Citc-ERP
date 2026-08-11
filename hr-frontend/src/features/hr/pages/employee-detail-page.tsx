import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetEmployee } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { AddContractDialog } from "@/features/hr/components/add-contract-dialog";
import { TerminateEmployeeDialog } from "@/features/hr/components/terminate-employee-dialog";
import { EditProfileDialog } from '@/features/hr/components/edit-profile-dialog'

function statusVariant(status?: string) {
  if (status === "ACTIVE") return "bg-[#2ecc71]/15 text-[#1f8f4e]";
  if (status === "TERMINATED") return "bg-[#e74c3c]/15 text-[#c0392b]";
  return "bg-[#6b7280]/15 text-[#4b5563]";
}

function fmtDate(v?: string) {
  return v ? new Date(v).toLocaleDateString("en-GB") : "—";
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <h2 className="mb-4 font-['Space_Grotesk',sans-serif] text-[15px] font-semibold text-[#1a2535]">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-['Inter',sans-serif] text-[12px] text-[#6b7280]">
        {label}
      </p>
      <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#1a2535]">
        {value || "—"}
      </p>
    </div>
  );
}

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const employeeId = Number(params.employeeId);

  const { data, isPending, isError } = useGetEmployee(employeeId);

  if (isPending) {
    return <div className="p-6 text-[#6b7280]">Loading…</div>;
  }
  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">Employee not found.</p>
        <Button variant="outline" onClick={() => navigate("/hr/employees")}>
          Back to list
        </Button>
      </div>
    );
  }

  const emp = data.employee;
  const profile = data.profiles?.find((p) => p.primary) ?? data.profiles?.[0];
  const contracts = data.contracts ?? [];
  const fullName = profile
    ? [profile.firstName, profile.otherName].filter(Boolean).join(" ")
    : (emp?.displayName ?? emp?.username ?? "—");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/hr/employees")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
              {fullName}
            </h1>
            <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
              {emp?.employeeNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`border-0 ${statusVariant(emp?.statusCode)}`}>
            {emp?.statusCode ?? "—"}
          </Badge>
          <Button
            variant="outline"
            onClick={() => navigate(`/hr/employees/${employeeId}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/hr/employees/${employeeId}/attendance`)}
          >
            Attendance
          </Button>
          <TerminateEmployeeDialog employeeId={employeeId} />
        </div>
      </div>

      {/* Employment */}
      <Section title="Employment">
        <Detail label="Employee Number" value={emp?.employeeNumber} />
        <Detail label="Department" value={emp?.currentOrgUnitName} />
        <Detail label="Status" value={emp?.statusCode} />
        <Detail label="Hire Date" value={fmtDate(emp?.hireDate)} />
        <Detail label="Start Date" value={fmtDate(emp?.startDate)} />
        <Detail label="Linked User" value={emp?.username} />
      </Section>

      {/* Personal */}
      {profile && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Space_Grotesk',sans-serif] text-[15px] font-semibold text-[#1a2535]">
              Personal
            </h2>
            <EditProfileDialog employeeId={employeeId} profile={profile}>
              <Button variant="outline" size="sm">Edit</Button>
            </EditProfileDialog>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="First Name" value={profile.firstName} />
            <Detail label="Other Name" value={profile.otherName} />
            <Detail label="Display Name" value={profile.displayName} />
            <Detail label="Gender" value={profile.gender === 1 ? 'Male' : profile.gender === 2 ? 'Female' : '—'} />
            <Detail label="Birth Date" value={fmtDate(profile.birthDate)} />
            <Detail label="National ID" value={profile.nationalId} />
          </div>
        </div>
      )}

      {/* Contact */}
      {profile && (
        <Section title="Contact">
          <Detail label="Personal Email" value={profile.personalEmail} />
          <Detail label="Business Email" value={profile.businessEmail} />
          <Detail label="Phone" value={profile.phoneNumber} />
          <Detail label="Mobile" value={profile.mobileNumber} />
          <Detail label="Address" value={profile.addressLine1} />
          <Detail label="Postal Code" value={profile.postalCode} />
        </Section>
      )}

      {/* Contracts */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-['Space_Grotesk',sans-serif] text-[15px] font-semibold text-[#1a2535]">
            Contracts ({contracts.length})
          </h2>
          <AddContractDialog employeeId={employeeId} />
        </div>
        {contracts.length === 0 ? (
          <p className="text-[13px] text-[#6b7280]">No contracts on file.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map((c) => (
              <div
                key={c.contractId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f4f6f9] p-3"
              >
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-[#1a2535]">
                    {c.contractNumber ?? c.contractTypeCode ?? "Contract"}
                  </span>
                  <span className="text-[12px] text-[#6b7280]">
                    {fmtDate(c.startDate)} →{" "}
                    {c.endDate ? fmtDate(c.endDate) : "Ongoing"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {c.salary != null && (
                    <span className="text-[14px] font-medium text-[#1a2535]">
                      {c.salary} {c.salaryCurrency}
                    </span>
                  )}
                  <Badge
                    className={`border-0 ${c.active ? "bg-[#2ecc71]/15 text-[#1f8f4e]" : "bg-[#6b7280]/15 text-[#4b5563]"}`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
