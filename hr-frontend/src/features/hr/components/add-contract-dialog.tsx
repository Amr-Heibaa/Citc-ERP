import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  getAddContractMutationOptions,
  getGetEmployeeQueryKey,
} from '@/lib/api/generated/ems/employee-controller/employee-controller'
import { useListContractTypes } from '@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller'
import { queryClient } from '@/lib/api/query-client'
import { useState } from 'react'

const schema = z.object({
  contractTypeId: z.string().optional(),
  contractNumber: z.string().max(50).optional().or(z.literal('')),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional().or(z.literal('')),
  salary: z.string().optional().or(z.literal('')),
  salaryCurrency: z.string().max(10).optional().or(z.literal('')),
  fulltime: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const emptyToUndef = (v?: string) => (v ? v : undefined)

export function AddContractDialog({ employeeId }: { employeeId: number }) {
  const [open, setOpen] = useState(false)
  const contractTypes = useListContractTypes({ size: 100 })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractTypeId: '',
      contractNumber: '',
      startDate: '',
      endDate: '',
      salary: '',
      salaryCurrency: 'EGP',
      fulltime: 'true',
    },
  })

  const addMutation = useMutation({
    ...getAddContractMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetEmployeeQueryKey(employeeId) })
      toast.success('Contract added')
      form.reset()
      setOpen(false)
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string })?.message ?? 'Failed to add contract')
    },
  })

  function onSubmit(v: FormValues) {
    addMutation.mutate({
      employeeId,
      data: {
        contractTypeId: v.contractTypeId ? Number(v.contractTypeId) : undefined,
        contractNumber: emptyToUndef(v.contractNumber),
        startDate: v.startDate,
        endDate: emptyToUndef(v.endDate),
        salary: v.salary ? Number(v.salary) : undefined,
        salaryCurrency: emptyToUndef(v.salaryCurrency),
        fulltime: v.fulltime === 'true',
        active: true,
      },
    })
  }

  const control = form.control

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          + Add Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Contract</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            noValidate
          >
            <FormField
              control={control}
              name="contractTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contractTypes.data?.content?.map((t) => (
                        <SelectItem key={t.contractTypeId} value={String(t.contractTypeId)}>
                          {t.contractTypeName}
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
              name="contractNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract No.</FormLabel>
                  <FormControl>
                    <Input placeholder="C-2026-001" {...field} value={field.value ?? ''} />
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
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="8000" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="salaryCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="EGP" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="fulltime"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Employment Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Full-time</SelectItem>
                      <SelectItem value="false">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-[#f5841f] text-white hover:bg-[#e0761a]"
              >
                {addMutation.isPending ? 'Saving…' : 'Add Contract'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}