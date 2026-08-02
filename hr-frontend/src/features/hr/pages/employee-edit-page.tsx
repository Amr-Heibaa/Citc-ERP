import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useGetEmployee,
  getUpdateEmployeeMutationOptions,
  getListEmployeesQueryKey,
  getGetEmployeeQueryKey,
} from '@/lib/api/generated/ems/employee-controller/employee-controller'
import {
  useListOrganizationUnits,
  useListEmployeeStatuses,
} from '@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller'
import { queryClient } from '@/lib/api/query-client'

const schema = z.object({
  employeeNumber: z.string().min(1, 'Required').max(50),
  currentOrgUnitId: z.string().optional(),
  employeeStatusId: z.string().optional(),
  hireDate: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  terminationDate: z.string().optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const emptyToUndef = (v?: string) => (v ? v : undefined)

export function EmployeeEditPage() {
  const navigate = useNavigate()
  const params = useParams()
  const employeeId = Number(params.employeeId)

  const { data, isPending } = useGetEmployee(employeeId)
  const orgUnits = useListOrganizationUnits({ size: 200 })
  const statuses = useListEmployeeStatuses({ size: 50 })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeNumber: '',
      currentOrgUnitId: '',
      employeeStatusId: '',
      hireDate: '',
      startDate: '',
      terminationDate: '',
    },
  })

  // fill the form once the employee data arrives
  useEffect(() => {
    const emp = data?.employee
    if (!emp) return
    const statusId = statuses.data?.content?.find((s) => s.statusCode === emp.statusCode)
      ?.employeeStatusId
    form.reset({
      employeeNumber: emp.employeeNumber ?? '',
      currentOrgUnitId: emp.currentOrgUnitId ? String(emp.currentOrgUnitId) : '',
      employeeStatusId: statusId ? String(statusId) : '',
      hireDate: emp.hireDate ?? '',
      startDate: emp.startDate ?? '',
      terminationDate: emp.terminationDate ?? '',
    })
  }, [data, statuses.data, form])

  const updateMutation = useMutation({
    ...getUpdateEmployeeMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getListEmployeesQueryKey()[0]] })
      queryClient.invalidateQueries({ queryKey: getGetEmployeeQueryKey(employeeId) })
      toast.success('Employee updated')
      navigate(`/hr/employees/${employeeId}`)
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string })?.message ?? 'Failed to update employee')
    },
  })

  function onSubmit(v: FormValues) {
    updateMutation.mutate({
      employeeId,
      data: {
        employeeNumber: v.employeeNumber,
        currentOrgUnitId: v.currentOrgUnitId ? Number(v.currentOrgUnitId) : undefined,
        employeeStatusId: v.employeeStatusId ? Number(v.employeeStatusId) : undefined,
        hireDate: emptyToUndef(v.hireDate),
        startDate: emptyToUndef(v.startDate),
        terminationDate: emptyToUndef(v.terminationDate),
      },
    })
  }

  if (isPending) {
    return <div className="p-6 text-[#6b7280]">Loading…</div>
  }

  const control = form.control

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/hr/employees/${employeeId}`)}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
          Edit Employment
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5 sm:grid-cols-2 md:p-6"
          noValidate
        >
          <FormField
            control={control}
            name="employeeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Number *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="currentOrgUnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {orgUnits.data?.content?.map((u) => (
                      <SelectItem key={u.orgUnitId} value={String(u.orgUnitId)}>
                        {u.unitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="employeeStatusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.data?.content?.map((s) => (
                      <SelectItem key={s.employeeStatusId} value={String(s.employeeStatusId)}>
                        {s.statusCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="terminationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termination Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-full flex justify-end gap-3 border-t border-[#e5e7eb] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/hr/employees/${employeeId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#f5841f] text-white hover:bg-[#e0761a]"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}   