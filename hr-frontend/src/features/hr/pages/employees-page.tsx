import { useMemo, useState } from 'react'
import { Search, Download } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEmployees } from '@/features/hr/api/use-employees'
import type { EmployeeSummary } from '@/lib/api/hr-api'

function statusClass(code: string | null) {
  if (code === 'ACTIVE') return 'bg-[#2ecc71]/15 text-[#1f8f4e]'
  if (code === 'TERMINATED') return 'bg-[#e74c3c]/15 text-[#c0392b]'
  return 'bg-[#6b7280]/15 text-[#4b5563]'
}

function fmtDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB') : '—'
}

export function EmployeesPage() {
  const navigate = useNavigate()
  const { data: employees, isLoading } = useEmployees()

  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [status, setStatus] = useState('')

  // build filter dropdown options from the real data
  const departments = useMemo(() => {
    const set = new Set<string>()
    ;(employees ?? []).forEach((e) => e.currentOrgUnitName && set.add(e.currentOrgUnitName))
    return [...set].sort()
  }, [employees])

  const statuses = useMemo(() => {
    const set = new Set<string>()
    ;(employees ?? []).forEach((e) => e.statusCode && set.add(e.statusCode))
    return [...set].sort()
  }, [employees])

  const filtered = (employees ?? []).filter((e) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      (e.displayName?.toLowerCase().includes(q) ?? false) ||
      e.employeeNumber.toLowerCase().includes(q)
    const matchDept = !dept || e.currentOrgUnitName === dept
    const matchStatus = !status || e.statusCode === status
    return matchSearch && matchDept && matchStatus
  })

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">Employees</h1>
          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            Manage and view all employee information
          </p>
        </div>
        <Button onClick={() => navigate('/hr/employees/new')} className="h-10 bg-[#1a2535] text-white hover:bg-[#243347]">
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Name, ID…"
            className="flex-1 bg-transparent font-['Inter',sans-serif] text-sm text-gray-600 outline-none placeholder:text-gray-400"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 font-['Inter',sans-serif] text-sm text-gray-600 outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 font-['Inter',sans-serif] text-sm text-gray-600 outline-none"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600">Employee</th>
              <th className="px-4 py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600">Contact</th>
              <th className="px-4 py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600">Department</th>
              <th className="px-4 py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600">Position</th>
              <th className="px-4 py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600">Join Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center font-['Inter',sans-serif] text-gray-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center font-['Inter',sans-serif] text-gray-400">No employees found</td></tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp.employeeId}
                  onClick={() => navigate(`/hr/employees/${emp.employeeId}`)}
                  className="cursor-pointer border-b border-gray-50 hover:bg-[#f9fafb]"
                >
                  <td className="px-6 py-4">
                    <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">{emp.displayName ?? '—'}</p>
                    <p className="font-['Inter',sans-serif] text-xs text-gray-400">{emp.employeeNumber}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-['Inter',sans-serif] text-xs text-gray-500">{emp.businessEmail ?? emp.personalEmail ?? '—'}</p>
                    <p className="font-['Inter',sans-serif] text-xs text-gray-500">{emp.mobileNumber ?? '—'}</p>
                  </td>
                  <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-600">{emp.currentOrgUnitName ?? '—'}</td>
                  <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-600">{emp.positionTitle ?? '—'}</td>
                  <td className="px-4 py-4">
                    <Badge className={`border-0 ${statusClass(emp.statusCode)}`}>{emp.statusName ?? emp.statusCode ?? '—'}</Badge>
                  </td>
                  <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-500">{fmtDate(emp.startDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-50 px-6 py-3 font-['Inter',sans-serif] text-xs text-gray-400">
          showing {filtered.length} of {employees?.length ?? 0}
        </div>
      </div>
    </div>
  )
}