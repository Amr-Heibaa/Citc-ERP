import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { EditSection } from "@/features/hr/shared/components/edit-section";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { readImageFile } from "@/features/hr/shared/utils/read-image-file";

export function OrganizationForm({
  defaultValues,
  showLogoPicker = false,
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  defaultValues: OrganizationFormValues;
  showLogoPicker?: boolean;
  submitLabel: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (
    values: OrganizationFormValues,
    logo: { base64: string; contentType: string } | null,
  ) => void;
}) {
  const { t } = useTranslation();
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

  const [logo, setLogo] = useState<{
    base64: string;
    contentType: string;
    dataUrl: string;
  } | null>(null);

  const submit = handleSubmit((values) => {
    onSubmit(
      values,
      logo ? { base64: logo.base64, contentType: logo.contentType } : null,
    );
  });

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <EditSection title={t("organizations.form.identity")}>
          <LabeledField label={t("organizations.form.organizationCode")}>
            <Input {...register("code")} placeholder={t("organizations.form.codePlaceholder")} />
          </LabeledField>

          <LabeledField label={t("organizations.form.organizationType")} error={errors.organizationTypeId?.message}>
            <SelectField
              control={control}
              name="organizationTypeId"
              placeholder={t("organizations.form.selectType")}
              options={
                organizationTypes.data?.map((type) => ({
                  value: String(type.id),
                  label: type.nameEn,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("organizations.form.nameEn")} error={errors.nameEn?.message}>
            <Input {...register("nameEn")} />
          </LabeledField>

          <LabeledField label={t("organizations.form.nameAr")} error={errors.nameAr?.message}>
            <Input {...register("nameAr")} dir="rtl" />
          </LabeledField>

          <LabeledField label={t("organizations.form.establishedDate")} error={errors.establishedDate?.message}>
            <Input {...register("establishedDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("common.status")}>
            <div className="flex h-10 items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={(checked) => setValue("active", checked)}
              />

              <span className="font-['Inter',sans-serif] text-sm text-gray-600">
                {active ? t("common.active") : t("common.inactive")}
              </span>
            </div>
          </LabeledField>

          {showLogoPicker && (
            <div className="md:col-span-2">
              <LabeledField label={t("organizations.form.logo")}>
                <div className="flex items-center gap-4">
                  {logo && (
                    <img
                      src={logo.dataUrl}
                      alt={t("organizations.form.logoPreviewAlt")}
                      className="size-16 shrink-0 rounded-xl border border-gray-100 object-contain"
                    />
                  )}

                  <Input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={async (event) => {
                      try {
                        const picked = await readImageFile(
                          event.target.files?.[0],
                        );

                        setLogo(picked);
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : t("organizations.form.invalidLogo"),
                        );

                        event.target.value = "";
                      }
                    }}
                  />
                </div>

                <p className="mt-1 text-xs text-gray-400">{t("organizations.form.logoHint")}</p>
              </LabeledField>
            </div>
          )}
        </EditSection>

        <EditSection title={t("organizations.form.registration")}>
          <LabeledField
            label={t("organizations.form.registrationNumber")}
            error={errors.registrationNumber?.message}
          >
            <Input {...register("registrationNumber")} />
          </LabeledField>

          <LabeledField label={t("organizations.form.taxNumber")} error={errors.taxNumber?.message}>
            <Input {...register("taxNumber")} />
          </LabeledField>
        </EditSection>

        <EditSection title={t("organizations.form.contact")}>
          <LabeledField label={t("common.phone")} error={errors.phone?.message}>
            <Input {...register("phone")} />
          </LabeledField>

          <LabeledField label={t("common.email")} error={errors.email?.message}>
            <Input {...register("email")} type="email" />
          </LabeledField>

          <LabeledField label={t("organizations.form.fax")}>
            <Input {...register("fax")} />
          </LabeledField>

          <LabeledField label={t("organizations.form.website")}>
            <Input {...register("website")} placeholder={t("organizations.form.websitePlaceholder")} />
          </LabeledField>
        </EditSection>

        <EditSection title={t("organizations.form.address")}>
          <LabeledField label={t("organizations.form.country")} error={errors.countryId?.message}>
            <SelectField
              control={control}
              name="countryId"
              placeholder={t("organizations.form.selectCountry")}
              options={
                countries.data?.map((country) => ({
                  value: String(country.id),
                  label: country.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("organizations.form.state")} error={errors.stateId?.message}>
            <SelectField
              control={control}
              name="stateId"
              placeholder={t("organizations.form.selectState")}
              disabled={!countryId}
              options={
                states.data?.map((state) => ({
                  value: String(state.id),
                  label: state.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("organizations.form.city")} error={errors.cityId?.message}>
            <SelectField
              control={control}
              name="cityId"
              placeholder={t("organizations.form.selectCity")}
              disabled={!stateId}
              options={
                cities.data?.map((city) => ({
                  value: String(city.id),
                  label: city.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("organizations.form.postalCode")}>
            <Input {...register("postalCode")} />
          </LabeledField>

          <div className="md:col-span-2">
            <LabeledField label={t("organizations.form.addressLine1")} error={errors.addressLine1?.message}>
              <Input {...register("addressLine1")} />
            </LabeledField>
          </div>

          <div className="md:col-span-2">
            <LabeledField label={t("organizations.form.addressLine2")}>
              <Input {...register("addressLine2")} />
            </LabeledField>
          </div>
        </EditSection>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>

        <Button type="submit" disabled={pending}>
          {pending ? t("organizations.form.saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
