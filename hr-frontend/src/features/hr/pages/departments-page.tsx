import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useListOrganizationUnits,
  useListOrganizations,
  useListUnitTypes,
  getCreateOrganizationUnitMutationOptions,
  getListOrganizationUnitsQueryKey,
} from '@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller'
import { queryClient } from '@/lib/api/query-client'

const schema = z.object({
  organizationId: z.string().min(1, 'Required'),
  unitTypeId: z.string().min(1, 'Required'),
  unitCode: z.string().min(1, 'Required').max(50),
  unitName: z.string().min(1, 'Required').max(255),
  unitNameAr: z.string().min(1, 'Required').max(255),
})
type FormValues = z.infer<typeof schema>

function AddDepartmentDialog() {
  const [open, setOpen] = useState(false)
  const orgs = useListOrganizations({ size: 100 })
  const unitTypes = useListUnitTypes({ size: 100 })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId: '',
      unitTypeId: '',
      unitCode: '',
      unitName: '',
      unitNameAr: '',
    },
  })

  const createMutation = useMutation({
    ...getCreateOrganizationUnitMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getListOrganizationUnitsQueryKey()[0]] })
      toast.success('Department created')
      form.reset()
      setOpen(false)
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string })?.message ?? 'Failed to create department')
    },
  })

  function onSubmit(v: FormValues) {
    createMutation.mutate({
      data: {
        organizationId: Number(v.organizationId),
        unitTypeId: Number(v.unitTypeId),
        unitCode: v.unitCode,
        unitName: v.unitName,
        unitNameAr: v.unitNameAr,
        active: true,
      },
    })
  }

  const control = form.control

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#f5841f] text-white hover:bg-[#e0761a]">+ New Department</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            noValidate
          >
            <FormField
              control={control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orgs.data?.content?.map((o) => (
                        <SelectItem key={o.organizationId} value={String(o.organizationId)}>
                          {o.organizationNameEn}
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
              name="unitTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitTypes.data?.content?.map((t) => (
                        <SelectItem key={t.unitTypeId} value={String(t.unitTypeId)}>
                          {t.unitNameEn ?? t.unitCode}
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
              name="unitCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="IT-DEPT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="unitName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English) *</FormLabel>
                  <FormControl>
                    <Input placeholder="IT Department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="unitNameAr"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Name (Arabic) *</FormLabel>
                  <FormControl>
                    <Input dir="rtl" placeholder="قسم تكنولوجيا المعلومات" {...field} />
                  </FormControl>
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
                disabled={createMutation.isPending}
                className="bg-[#f5841f] text-white hover:bg-[#e0761a]"
              >
                {createMutation.isPending ? 'Saving…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function DepartmentsPage() {
  const navigate = useNavigate()
  const { data, isPending, isError } = useListOrganizationUnits({ size: 200 })
  const units = data?.content ?? []

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hr')}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
            Departments
          </h1>
        </div>
        <AddDepartmentDialog />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f4f6f9] hover:bg-[#f4f6f9]">
              <TableHead className="font-semibold text-[#1a2535]">Code</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Name</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-[#6b7280]">Loading…</TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-[#c0392b]">Failed to load.</TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-[#6b7280]">No departments yet.</TableCell>
              </TableRow>
            ) : (
              units.map((u) => (
                <TableRow key={u.orgUnitId}>
                  <TableCell className="font-medium text-[#1a2535]">{u.unitCode}</TableCell>
                  <TableCell>{u.unitName}</TableCell>
                  <TableCell className="text-[#6b7280]">{u.unitTypeCode ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}