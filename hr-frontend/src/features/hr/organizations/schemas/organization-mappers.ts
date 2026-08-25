import type {
  CreateOrganizationRequest,
  OrganizationDetail,
  UpdateOrganizationRequest,
} from "@/lib/api/generated/model";

import type { OrganizationFormValues } from "@/features/hr/organizations/schemas/organization-schema";

export function toCreateOrganizationRequest(
  values: OrganizationFormValues,
  logo?: { base64: string; contentType: string },
): CreateOrganizationRequest {
  return {
    code: values.code?.trim() || undefined,
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim(),
    organizationTypeId: Number(values.organizationTypeId),
    active: values.active,
    establishedDate: values.establishedDate,
    registrationNumber: values.registrationNumber.trim(),
    taxNumber: values.taxNumber.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    fax: values.fax?.trim() || undefined,
    website: values.website?.trim() || undefined,
    countryId: Number(values.countryId),
    stateId: Number(values.stateId),
    cityId: Number(values.cityId),
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2?.trim() || undefined,
    postalCode: values.postalCode?.trim() || undefined,
    logoBase64: logo?.base64,
    logoContentType: logo?.contentType,
  };
}

export function toUpdateOrganizationRequest(
  values: OrganizationFormValues,
): UpdateOrganizationRequest {
  return {
    code: values.code?.trim() || undefined,
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim(),
    organizationTypeId: Number(values.organizationTypeId),
    active: values.active,
    establishedDate: values.establishedDate,
    registrationNumber: values.registrationNumber.trim(),
    taxNumber: values.taxNumber.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    fax: values.fax?.trim() || undefined,
    website: values.website?.trim() || undefined,
    countryId: Number(values.countryId),
    stateId: Number(values.stateId),
    cityId: Number(values.cityId),
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2?.trim() || undefined,
    postalCode: values.postalCode?.trim() || undefined,
  };
}

export function organizationDetailToFormValues(
  organization: OrganizationDetail,
): OrganizationFormValues {
  return {
    code: organization.code ?? "",
    nameEn: organization.nameEn ?? "",
    nameAr: organization.nameAr ?? "",
    organizationTypeId:
      organization.organizationTypeId != null
        ? String(organization.organizationTypeId)
        : "",
    active: organization.status?.toLowerCase() !== "inactive",
    establishedDate: organization.establishedDate ?? "",
    registrationNumber: organization.registrationNumber ?? "",
    taxNumber: organization.taxNumber ?? "",
    phone: organization.phone ?? "",
    email: organization.email ?? "",
    fax: organization.fax ?? "",
    website: organization.website ?? "",
    countryId:
      organization.countryId != null ? String(organization.countryId) : "",
    stateId: organization.stateId != null ? String(organization.stateId) : "",
    cityId: organization.cityId != null ? String(organization.cityId) : "",
    addressLine1: organization.addressLine1 ?? "",
    addressLine2: organization.addressLine2 ?? "",
    postalCode: organization.postalCode ?? "",
  };
}
