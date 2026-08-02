import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useListOrganizations,
  getCreateOrganizationMutationOptions,
  getListOrganizationsQueryKey,
} from '@/lib/api/generated/ems/hr-reference-controller/hr-reference-controller'
import { queryClient } from '@/lib/api/query-client'

const schema = z.object({
  organizationCode: z.string().min(1, 'Required').max(100),
  organizationNameEn: z.string().min(1, 'Required').max(255),
  organizationNameAr: z.string().min(1, 'Required').max(255),
})
type FormValues = z.infer<typeof schema>

function AddOrganizationDialog() {
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { organizationCode: '', organizationNameEn: '', organizationNameAr: '' },
  })

  const createMutation = useMutation({
    ...getCreateOrganizationMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getListOrganizationsQueryKey()[0]] })
      toast.success('Organization created')
      form.reset()
      setOpen(false)
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string })?.message ?? 'Failed to create organization')
    },
  })

  function onSubmit(v: FormValues) {
    createMutation.mutate({ data: { ...v, active: true } })
  }

  const control = form.control

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#f5841f] text-white hover:bg-[#e0761a]">+ New Organization</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={control}
              name="organizationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="CITEC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="organizationNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Civil Information Technology Co." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="organizationNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Arabic) *</FormLabel>
                  <FormControl>
                    <Input dir="rtl" placeholder="شركة تكنولوجيا المعلومات المدنية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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

export function OrganizationsPage() {
  const navigate = useNavigate()
  const { data, isPending, isError } = useListOrganizations({ size: 100 })
  const orgs = data?.content ?? []

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hr')}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1a2535]">
            Organizations
          </h1>
        </div>
        <AddOrganizationDialog />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f4f6f9] hover:bg-[#f4f6f9]">
              <TableHead className="font-semibold text-[#1a2535]">Code</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Name (EN)</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Name (AR)</TableHead>
              <TableHead className="font-semibold text-[#1a2535]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[#6b7280]">Loading…</TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[#c0392b]">Failed to load.</TableCell>
              </TableRow>
            ) : orgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[#6b7280]">No organizations yet.</TableCell>
              </TableRow>
            ) : (
              orgs.map((o) => (
                <TableRow key={o.organizationId}>
                  <TableCell className="font-medium text-[#1a2535]">{o.organizationCode}</TableCell>
                  <TableCell>{o.organizationNameEn}</TableCell>
                  <TableCell dir="rtl">{o.organizationNameAr}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${o.active ? 'bg-[#2ecc71]/15 text-[#1f8f4e]' : 'bg-[#6b7280]/15 text-[#4b5563]'}`}>
                      {o.active ? 'Active' : 'Inactive'}
                    </Badge>
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