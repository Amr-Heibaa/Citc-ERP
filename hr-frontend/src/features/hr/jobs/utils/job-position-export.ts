import type { JobPositionSummary } from "@/lib/api/generated/model";

import { downloadCsv } from "@/features/hr/shared/utils/export";

export function downloadJobPositionsCsv(positions: JobPositionSummary[]) {
  const rows = positions.map((position) => ({
    Code: position.code ?? "",
    "Title (EN)": position.titleEn ?? "",
    "Title (AR)": position.titleAr ?? "",
    Grade: position.gradeCode ?? "",
    Unit: position.orgUnitName ?? "",
    "Current Employee": position.assignedEmployeeName ?? "",
    Occupancy: position.occupancyStatus ?? "",
    Status: position.active ? "Active" : "Inactive",
  }));

  downloadCsv("job-positions", rows);
}
