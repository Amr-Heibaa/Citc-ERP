import { useEffect, useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Search, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconInput } from '@/components/icon-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useListEmployees } from '@/lib/api/generated/ems/employee-controller/employee-controller'

const PAGE_SIZE = 10

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

  // debounce the search box → resets to first page on a new query
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search)
      setPage(0)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isPending, isError, isPlaceholderData } = useListEmployees(
    { q: q || undefined, page, size: PAGE_SIZE, sort: 'employeeNumber,asc' },
    { query: { placeholderData: keepPreviousData } },
  )

  const employees = data?.content ?? []
  const totalElements = data?.page?.totalElements ?? 0
  const totalPages = data?.page?.totalPages ?? 0

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
            Employees
          </h1>
          <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">
            {totalElements} {totalElements === 1 ? 'employee' : 'employees'} total
          </p>
        </div>
        <Button
          onClick={() => navigate('/hr/employees/new')}
          className="gap-2 bg-[#f5841f] text-white hover:bg-[#e0761a]"
        >
          <UserPlus className="size-4" />
          New Employee
        </Button>
      </div>

      {/* Search */}
      <IconInput
        icon={Search}
        placeholder="Search by employee number…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-11 max-w-sm bg-white"
      />

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
            Page {page + 1} of {totalPages}
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