import { useEffect, useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconInput } from '@/components/icon-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useListEmployees,
  listEmployees,
} from '@/lib/api/generated/ems/employee-controller/employee-controller'
import {
  useListOrganizationUnits,
  useListEmployeeStatuses,
} from '@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller'
import { EmployeeBanner } from '@/features/hr/components/employee-banner'

const PAGE_SIZE = 10
const ALL = 'ALL'

function statusVariant(status?: string) {
  if (status === 'ACTIVE') return 'bg-[#2ecc71]/15 text-[#1f8f4e]'
  if (status === 'TERMINATED') return 'bg-[#e74c3c]/15 text-[#c0392b]'
  return 'bg-[#6b7280]/15 text-[#4b5563]'
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '—'
}

export function EmployeesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [orgUnitId, setOrgUnitId] = useState<string>(ALL)
  const [statusCode, setStatusCode] = useState<string>(ALL)
  const [exporting, setExporting] = useState(false)

  const orgUnits = useListOrganizationUnits({ size: 200 })
  const statuses = useListEmployeeStatuses({ size: 50 })

  // debounce search → reset to first page on change
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search)
      setPage(0)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // reset to first page when a filter changes
  useEffect(() => {
    setPage(0)
  }, [orgUnitId, statusCode])

  const params = {
    q: q || undefined,
    orgUnitId: orgUnitId !== ALL ? Number(orgUnitId) : undefined,
    statusCode: statusCode !== ALL ? statusCode : undefined,
    page,
    size: PAGE_SIZE,
    sort: 'employeeNumber,asc',
  }

  const { data, isPending, isError, isPlaceholderData } = useListEmployees(params, {
    query: { placeholderData: keepPreviousData },
  })

  const employees = data?.content ?? []
  const totalElements = data?.page?.totalElements ?? 0
  const totalPages = data?.page?.totalPages ?? 0

  // Export ALL matching rows (not just current page) to Excel
  async function handleExport() {
    setExporting(true)
    try {
      const all = await listEmployees({
        q: q || undefined,
        orgUnitId: orgUnitId !== ALL ? Number(orgUnitId) : undefined,
        statusCode: statusCode !== ALL ? statusCode : undefined,
        page: 0,
        size: 10000,
        sort: 'employeeNumber,asc',
      })
      const rows = (all.content ?? []).map((e) => ({
        'Employee No': e.employeeNumber ?? '',
        Name: e.displayName ?? e.username ?? '',
        Department: e.currentOrgUnitName ?? '',
        Status: e.statusCode ?? '',
        'Hire Date': e.hireDate ?? '',
        'Start Date': e.startDate ?? '',
        'Business Email': e.businessEmail ?? '',
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Employees')
      XLSX.writeFile(wb, `employees-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success(`Exported ${rows.length} employees`)
    } catch (error) {
      toast.error((error as { message?: string })?.message ?? 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* <EmployeeBanner /> */}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
            Employees
          </h1>
          <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
            Manage and view all employee information
          </p>
        </div>
        <Button
          onClick={() => navigate('/hr/employees/new')}
          className="bg-[#1a2535] text-white hover:bg-[#243347]"
        >
          Add Employee
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 md:flex-row md:items-center">
        <IconInput
          icon={Search}
          placeholder="Search for Name, ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 flex-1 bg-[#f4f6f9]"
        />

        <Select value={orgUnitId} onValueChange={setOrgUnitId}>
          <SelectTrigger className="h-11 md:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Departments</SelectItem>
            {orgUnits.data?.content?.map((u) => (
              <SelectItem key={u.orgUnitId} value={String(u.orgUnitId)}>
                {u.unitName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusCode} onValueChange={setStatusCode}>
          <SelectTrigger className="h-11 md:w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Status</SelectItem>
            {statuses.data?.content?.map((s) => (
              <SelectItem key={s.employeeStatusId} value={s.statusCode ?? ''}>
                {s.statusCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleExport}
          disabled={exporting || totalElements === 0}
          className="h-11 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
        >
          <Download className="size-4" />
          {exporting ? 'Exporting…' : 'Export'}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f4f6f9] hover:bg-[#f4f6f9]">
              <TableHead className="font-semibold text-[#1a2535]">Emp No.</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Name</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Department</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Status</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Hire Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-[#6b7280]">
                  Loading…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-[#c0392b]">
                  Failed to load employees.
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-[#6b7280]">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow
                  key={emp.employeeId}
                  onClick={() => navigate(`/hr/employees/${emp.employeeId}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-[#1a2535]">{emp.employeeNumber}</TableCell>
                  <TableCell>{emp.displayName ?? emp.username ?? '—'}</TableCell>
                  <TableCell className="text-[#6b7280]">{emp.currentOrgUnitName ?? '—'}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${statusVariant(emp.statusCode)}`}>
                      {emp.statusCode ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#6b7280]">{formatDate(emp.hireDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
            Page {page + 1} of {totalPages} · {totalElements} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || isPlaceholderData}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}