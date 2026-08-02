import { useEffect, useState, type ReactNode } from 'react'
import { useForm, type Control, type FieldPath } from 'react-hook-form'
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
  getUpdateProfileMutationOptions,
  getGetEmployeeQueryKey,
} from '@/lib/api/generated/ems/employee-controller/employee-controller'
import type { EmployeeProfileResponse } from '@/lib/api/generated/model'
import { queryClient } from '@/lib/api/query-client'

const schema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  otherName: z.string().min(1, 'Required').max(200),
  displayName: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['1', '2'], { message: 'Required' }),
  birthDate: z.string().optional().or(z.literal('')),
  nationalId: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => {
      if (!v) return true
      if (!/^[23]\d{13}$/.test(v)) return false
      const century = v[0] === '2' ? 1900 : 2000
      const year = century + Number(v.slice(1, 3))
      const month = Number(v.slice(3, 5))
      const day = Number(v.slice(5, 7))
      const d = new Date(year, month - 1, day)
      return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
    }, 'Invalid Egyptian national ID'),
  personalEmail: z.string().email('Invalid email').max(100).optional().or(z.literal('')),
  businessEmail: z.string().email('Invalid email').max(100).optional().or(z.literal('')),
  phoneNumber: z.string().max(100).optional().or(z.literal('')),
  mobileNumber: z.string().max(100).optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const emptyToUndef = (v?: string) => (v ? v : undefined)

function TextField({
  control,
  name,
  label,
  required,
  type = 'text',
}: {
  control: Control<FormValues>
  name: FieldPath<FormValues>
  label: string
  required?: boolean
  type?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && ' *'}
          </FormLabel>
          <FormControl>
            <Input type={type} {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

type Props = {
  employeeId: number
  profile: EmployeeProfileResponse
  children: ReactNode
}

export function EditProfileDialog({ employeeId, profile, children }: Props) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', otherName: '' },
  })

  // fill the form each time the dialog opens
  useEffect(() => {
    if (!open) return
    form.reset({
      firstName: profile.firstName ?? '',
      otherName: profile.otherName ?? '',
      displayName: profile.displayName ?? '',
      gender: profile.gender ? (String(profile.gender) as '1' | '2') : undefined,
      birthDate: profile.birthDate ?? '',
      nationalId: profile.nationalId ?? '',
      personalEmail: profile.personalEmail ?? '',
      businessEmail: profile.businessEmail ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      mobileNumber: profile.mobileNumber ?? '',
      addressLine1: profile.addressLine1 ?? '',
      addressLine2: profile.addressLine2 ?? '',
      postalCode: profile.postalCode ?? '',
    })
  }, [open, profile, form])

  const updateMutation = useMutation({
    ...getUpdateProfileMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetEmployeeQueryKey(employeeId) })
      toast.success('Profile updated')
      setOpen(false)
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string })?.message ?? 'Failed to update profile')
    },
  })

  function onSubmit(v: FormValues) {
    updateMutation.mutate({
      employeeId,
      profileId: profile.profileId as number,
      data: {
        primary: profile.primary ?? true,
        firstName: v.firstName,
        otherName: v.otherName,
        displayName: emptyToUndef(v.displayName),
        gender: Number(v.gender),
        birthDate: emptyToUndef(v.birthDate),
        nationalId: emptyToUndef(v.nationalId),
        personalEmail: emptyToUndef(v.personalEmail),
        businessEmail: emptyToUndef(v.businessEmail),
        phoneNumber: emptyToUndef(v.phoneNumber),
        mobileNumber: emptyToUndef(v.mobileNumber),
        addressLine1: emptyToUndef(v.addressLine1),
        addressLine2: emptyToUndef(v.addressLine2),
        postalCode: emptyToUndef(v.postalCode),
      },
    })
  }

  const control = form.control

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Personal Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            noValidate
          >
            <TextField control={control} name="firstName" label="First Name" required />
            <TextField control={control} name="otherName" label="Other Name" required />
            <TextField control={control} name="displayName" label="Display Name" />

            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField control={control} name="birthDate" label="Birth Date" type="date" />
            <TextField control={control} name="nationalId" label="National ID" />
            <TextField control={control} name="personalEmail" label="Personal Email" type="email" />
            <TextField control={control} name="businessEmail" label="Business Email" type="email" />
            <TextField control={control} name="phoneNumber" label="Phone" />
            <TextField control={control} name="mobileNumber" label="Mobile" />
            <TextField control={control} name="addressLine1" label="Address Line 1" />
            <TextField control={control} name="addressLine2" label="Address Line 2" />
            <TextField control={control} name="postalCode" label="Postal Code" />

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[#f5841f] text-white hover:bg-[#e0761a]"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}