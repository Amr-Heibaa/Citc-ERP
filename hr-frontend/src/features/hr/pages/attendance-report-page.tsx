import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetDays } from '@/lib/api/generated/ems/attendance-controller/attendance-controller'
import { useGetEmployee } from '@/lib/api/generated/ems/employee-controller/employee-controller'

// "2026-03-10T10:15:00" -> "10:15"
function toTime(v?: string | null) {
  if (!v) return '—'
  const d = new Date(v)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// "2026-03-10" -> "10/03/2026"
function toDate(v?: string) {
  return v ? new Date(v).toLocaleDateString('en-GB') : '—'
}

// "2026-03-10" -> "Tuesday"
function toDay(v?: string) {
  return v ? new Date(v).toLocaleDateString('en-US', { weekday: 'long' }) : '—'
}

// 470 -> "7:50"
function toHours(mins?: number | null) {
  if (mins == null) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function noteFor(statusCode?: string | null, checkIn?: string | null) {
  if (statusCode === 'ABSENT') return 'Absent'
  if (!checkIn) return 'Not Signed'
  if (statusCode === 'LATE') return 'Late'
  return ''
}

export function AttendanceReportPage() {
  const navigate = useNavigate()
  const params = useParams()
  const employeeId = Number(params.employeeId)

  const employee = useGetEmployee(employeeId)

  // default range: last 30 days
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  // the range we actually query (only updates when "Show" is clicked)
  const [range, setRange] = useState<{ from: string; to: string } | null>(null)

  const { data, isFetching, isError } = useGetDays(
    { employeeId, from: range?.from ?? from, to: range?.to ?? to },
    { query: { enabled: range !== null } },
  )

  const days = data ?? []
  const emp = employee.data?.employee
  const empName = emp?.displayName ?? emp?.username ?? `Employee ${employeeId}`

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/hr/employees/${employeeId}`)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
            Attendance Report
          </h1>
          <p className="font-['Inter',sans-serif] text-[13px] text-[#6b7280]">{empName}</p>
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#6b7280]">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[170px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#6b7280]">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[170px]" />
        </div>
        <Button
          onClick={() => setRange({ from, to })}
          className="bg-[#1a2535] text-white hover:bg-[#243347]"
        >
          Show
        </Button>
      </div>

      {/* Report table */}
      <div className="overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f4f6f9] hover:bg-[#f4f6f9]">
              <TableHead className="font-semibold text-[#1a2535]">N</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Day</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Date</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Expected In</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Expected Out</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Check In</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Check Out</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Working Hours</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {range === null ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[#6b7280]">
                  Pick a date range and press Show.
                </TableCell>
              </TableRow>
            ) : isFetching ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[#6b7280]">Loading…</TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[#c0392b]">Failed to load.</TableCell>
              </TableRow>
            ) : days.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[#6b7280]">No records in this range.</TableCell>
              </TableRow>
            ) : (
              days.map((d, i) => (
                <TableRow key={d.attendanceDayId}>
                  <TableCell className="text-[#6b7280]">{String(i + 1).padStart(2, '0')}</TableCell>
                  <TableCell>{toDay(d.attendanceDate)}</TableCell>
                  <TableCell>{toDate(d.attendanceDate)}</TableCell>
                  <TableCell className="text-[#6b7280]">{toTime(d.expectedStartTime)}</TableCell>
                  <TableCell className="text-[#6b7280]">{toTime(d.expectedEndTime)}</TableCell>
                  <TableCell>{toTime(d.actualCheckIn)}</TableCell>
                  <TableCell>{toTime(d.actualCheckOut)}</TableCell>
                  <TableCell className="font-medium text-[#1a2535]">{toHours(d.workedMinutes)}</TableCell>
                  <TableCell>
                    {(() => {
                      const note = noteFor(d.statusCode, d.actualCheckIn)
                      if (!note) return <span className="text-[#6b7280]">—</span>
                      const color =
                        note === 'Absent' || note === 'Not Signed'
                          ? 'text-[#c0392b]'
                          : note === 'Late'
                          ? 'text-[#e0761a]'
                          : 'text-[#6b7280]'
                      return <span className={`font-medium ${color}`}>{note}</span>
                    })()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}