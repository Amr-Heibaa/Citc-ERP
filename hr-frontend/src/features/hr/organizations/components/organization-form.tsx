import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  useCitiesByState,
  useCountries,
  useOrganizationTypes,
  useStatesByCountry,
} from "@/features/hr/organizations/api/use-organizations";
import {
  organizationSchema,
  type OrganizationFormValues,
} from "@/features/hr/organizations/schemas/organization-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";

export function OrganizationForm({
  defaultValues,
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  defaultValues: OrganizationFormValues;
  submitLabel: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (values: OrganizationFormValues) => void;
}) {
  const organizationTypes = useOrganizationTypes();
  const countries = useCountries();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
  });

  const countryId = useWatch({ control, name: "countryId" });
  const stateId = useWatch({ control, name: "stateId" });
  const active = useWatch({ control, name: "active" });

  const states = useStatesByCountry(
    countryId ? Number(countryId) : undefined,
  );
  const cities = useCitiesByState(stateId ? Number(stateId) : undefined);

  useEffect(() => {
    if (countryId !== defaultValues.countryId) {
      setValue("stateId", "");
      setValue("cityId", "");
    }
    // Only reset when the country actually changes from what the user picked,
    // not on initial mount with the default value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  useEffect(() => {
    if (stateId !== defaultValues.stateId) {
      setValue("cityId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label="Name (English)" error={errors.nameEn?.message}>
            <Input {...register("nameEn")} placeholder="Organization name" />
          </LabeledField>

          <LabeledField label="Name (Arabic)" error={errors.nameAr?.message}>
            <Input {...register("nameAr")} dir="rtl" placeholder="اسم المنظمة" />
          </LabeledField>

          <LabeledField label="Organization Type" error={errors.organizationTypeId?.message}>
            <SelectField
              control={control}
              name="organizationTypeId"
              placeholder="Select type"
              options={
                organizationTypes.data?.map((type) => ({
                  value: String(type.id),
                  label: type.nameEn,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label="Status">
            <div className="flex h-10 items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={(checked) => setValue("active", checked)}
              />

              <span className="font-['Inter',sans-serif] text-sm text-gray-600">
                {active ? "Active" : "Inactive"}
              </span>
            </div>
          </LabeledField>

          <LabeledField label="Established Date" error={errors.establishedDate?.message}>
            <Input {...register("establishedDate")} type="date" />
          </LabeledField>

          <LabeledField
            label="Registration Number"
            error={errors.registrationNumber?.message}
          >
            <Input {...register("registrationNumber")} placeholder="10110" />
          </LabeledField>

          <LabeledField label="Tax Number" error={errors.taxNumber?.message}>
            <Input {...register("taxNumber")} placeholder="422142" />
          </LabeledField>

          <LabeledField label="Country" error={errors.countryId?.message}>
            <SelectField
              control={control}
              name="countryId"
              placeholder="Select country"
              options={
                countries.data?.map((country) => ({
                  value: String(country.id),
                  label: country.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label="State" error={errors.stateId?.message}>
            <SelectField
              control={control}
              name="stateId"
              placeholder="Select state"
              disabled={!countryId}
              options={
                states.data?.map((state) => ({
                  value: String(state.id),
                  label: state.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label="City" error={errors.cityId?.message}>
            <SelectField
              control={control}
              name="cityId"
              placeholder="Select city"
              disabled={!stateId}
              options={
                cities.data?.map((city) => ({
                  value: String(city.id),
                  label: city.name,
                })) ?? []
              }
            />
          </LabeledField>
        </div>

        <LabeledField label="Address" error={errors.addressLine1?.message}>
          <Input {...register("addressLine1")} placeholder="Street, area…" />
        </LabeledField>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label="Address Line 2">
            <Input {...register("addressLine2")} />
          </LabeledField>

          <LabeledField label="Postal Code">
            <Input {...register("postalCode")} />
          </LabeledField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="+20 123 456 7890" />
          </LabeledField>

          <LabeledField label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="info@company.com" />
          </LabeledField>

          <LabeledField label="Fax">
            <Input {...register("fax")} placeholder="+20 123 456 7899" />
          </LabeledField>

          <LabeledField label="Website">
            <Input {...register("website")} placeholder="www.company.com" />
          </LabeledField>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
