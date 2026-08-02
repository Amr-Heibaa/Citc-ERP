import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  getUpdateEmployeeMutationOptions,
  getGetEmployeeQueryKey,
  getListEmployeesQueryKey,
} from '@/lib/api/generated/ems/employee-controller/employee-controller'
import { useListEmployeeStatuses } from '@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller'
import { queryClient } from '@/lib/api/query-client'

export function TerminateEmployeeDialog({ employeeId }: { employeeId: number }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const statuses = useListEmployeeStatuses({ size: 50 })

  const terminateMutation = useMutation({
    ...getUpdateEmployeeMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetEmployeeQueryKey(employeeId) })
      queryClient.invalidateQueries({ queryKey: [getListEmployeesQueryKey()[0]] })
      toast.success('Employee terminated')
      setOpen(false)
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string })?.message ?? 'Failed to terminate')
    },
  })

  function handleTerminate() {
    const terminatedId = statuses.data?.content?.find((s) => s.statusCode === 'TERMINATED')
      ?.employeeStatusId
    if (!terminatedId) {
      toast.error('TERMINATED status not found')
      return
    }
    terminateMutation.mutate({
      employeeId,
      data: { employeeStatusId: terminatedId, terminationDate: date },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-[#e74c3c]/40 text-[#c0392b] hover:bg-[#e74c3c]/5">
          Terminate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terminate Employee</DialogTitle>
        </DialogHeader>
        <p className="text-[14px] text-[#6b7280]">
          This sets the employee status to <strong>TERMINATED</strong>. The record is kept for
          history — nothing is deleted.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label>Termination Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTerminate}
            disabled={terminateMutation.isPending}
            className="bg-[#e74c3c] text-white hover:bg-[#c0392b]"
          >
            {terminateMutation.isPending ? 'Processing…' : 'Confirm Termination'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}