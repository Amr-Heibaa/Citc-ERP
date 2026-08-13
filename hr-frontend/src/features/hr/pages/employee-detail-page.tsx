import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmployeeDetail } from '@/features/hr/api/use-employees'

function fmt(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB') : '—'
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-['Inter',sans-serif] text-[12px] text-gray-400">{label}</p>
      <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#1a2535]">{value || '—'}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h3 className="mb-4 font-['Inter',sans-serif] text-[15px] font-bold text-[#1a2535]">{title}</h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

export function EmployeeDetailPage() {
  const navigate = useNavigate()
  const { employeeId } = useParams()
  const id = Number(employeeId)
  const { data: emp, isLoading, isError } = useEmployeeDetail(id)

  if (isLoading) return <div className="p-6 text-gray-400">Loading…</div>
  if (isError || !emp) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">Employee not found.</p>
        <Button variant="outline" onClick={() => navigate('/hr/employees')}>Back to list</Button>
      </div>
    )
  }

  const fullName = [emp.firstName, emp.otherName].filter(Boolean).join(' ') || emp.displayName || '—'

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hr/employees')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">{fullName}</h1>
            <p className="font-['Inter',sans-serif] text-[13px] text-gray-400">{emp.employeeNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="border-0 bg-[#2ecc71]/15 text-[#1f8f4e]">{emp.statusName ?? emp.statusCode ?? '—'}</Badge>
          <Button variant="outline" onClick={() => navigate(`/hr/employees/${id}/attendance`)}>Attendance</Button>
        </div>
      </div>

      <Section title="Employee Information">
        <InfoRow label="Employee ID" value={emp.employeeNumber} />
        <InfoRow label="Hire Date" value={fmt(emp.hireDate)} />
        <InfoRow label="Start Date" value={fmt(emp.startDate)} />
        <InfoRow label="Status" value={emp.statusName} />
      </Section>

      <Section title="Organization">
        <InfoRow label="Branch" value={emp.branch} />
        <InfoRow label="Section" value={emp.section} />
        <InfoRow label="Department" value={emp.department} />
      </Section>

      <Section title="Position">
        <InfoRow label="Position" value={emp.positionTitle} />
        <InfoRow label="Grade" value={emp.gradeName} />
        <InfoRow label="Grade Rank" value={emp.gradeRank} />
      </Section>

      <Section title="Management">
        <InfoRow label="Manager" value={emp.manager} />
        <InfoRow label="Team Leader" value={emp.teamLeader} />
      </Section>

      {/* Skills */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="mb-4 font-['Inter',sans-serif] text-[15px] font-bold text-[#1a2535]">Skills</h3>
        {emp.skills.length === 0 ? (
          <p className="text-[13px] text-gray-400">No skills recorded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {emp.skills.map((s) => (
              <Badge key={s} className="border-0 bg-[#f5841f]/10 text-[#e0761a]">{s}</Badge>
            ))}
          </div>
        )}
      </div>

      <Section title="Basic Information">
        <InfoRow label="First Name" value={emp.firstName} />
        <InfoRow label="Other Name" value={emp.otherName} />
        <InfoRow label="Display Name" value={emp.displayName} />
        <InfoRow label="Gender" value={emp.genderLabel} />
        <InfoRow label="Birth Date" value={fmt(emp.birthDate)} />
        <InfoRow label="National ID" value={emp.nationalId} />
      </Section>

      <Section title="Contact">
        <InfoRow label="Personal Email" value={emp.personalEmail} />
        <InfoRow label="Business Email" value={emp.businessEmail} />
        <InfoRow label="Phone" value={emp.phoneNumber} />
        <InfoRow label="Mobile" value={emp.mobileNumber} />
      </Section>

      <Section title="Address">
        <InfoRow label="Address Line 1" value={emp.addressLine1} />
        <InfoRow label="Address Line 2" value={emp.addressLine2} />
        <InfoRow label="Postal Code" value={emp.postalCode} />
      </Section>

      {/* Contracts */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="mb-4 font-['Inter',sans-serif] text-[15px] font-bold text-[#1a2535]">
          Contracts ({emp.contracts.length})
        </h3>
        {emp.contracts.length === 0 ? (
          <p className="text-[13px] text-gray-400">No contracts on file.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {emp.contracts.map((c) => (
              <div key={c.contractId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f4f6f9] p-3">
                <div>
                  <p className="text-[14px] font-semibold text-[#1a2535]">{c.contractNumber ?? 'Contract'}</p>
                  <p className="text-[12px] text-gray-500">{fmt(c.startDate)} → {c.endDate ? fmt(c.endDate) : 'Ongoing'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {c.salary != null && <span className="text-[14px] font-medium text-[#1a2535]">{c.salary} {c.salaryCurrency}</span>}
                  <Badge className={`border-0 ${c.active ? 'bg-[#2ecc71]/15 text-[#1f8f4e]' : 'bg-gray-200 text-gray-500'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}