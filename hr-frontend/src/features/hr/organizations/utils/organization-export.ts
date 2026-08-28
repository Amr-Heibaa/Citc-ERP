import type { OrganizationSummary } from "@/lib/api/generated/model";

import { downloadCsv } from "@/features/hr/shared/utils/export";

export function downloadOrganizationsCsv(organizations: OrganizationSummary[]) {
  const rows = organizations.map((organization) => ({
    Code: organization.code ?? "",
    "Name (EN)": organization.nameEn ?? "",
    "Name (AR)": organization.nameAr ?? "",
    Type: organization.type ?? "",
    Status: organization.status ?? "",
    Established: organization.establishedDate ?? "",
  }));

  downloadCsv("organizations", rows);
}
