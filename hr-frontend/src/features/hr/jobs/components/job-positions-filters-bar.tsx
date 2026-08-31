import { Download, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useJobGrades,
} from "@/features/hr/jobs/api/use-job-grades";
import {
  useOrganizationsForJobs,
  useOrgUnitsForJobs,
} from "@/features/hr/jobs/api/use-job-positions";
import { useJobPositionsFiltersStore } from "@/features/hr/jobs/store/job-positions-filters-store";

const ALL_VALUE = "__all__";

export function JobPositionsFiltersBar({
  onExport,
  exportDisabled,
}: {
  onExport: () => void;
  exportDisabled: boolean;
}) {
  const { t } = useTranslation();
  const search = useJobPositionsFiltersStore((state) => state.search);
  const organizationId = useJobPositionsFiltersStore((state) => state.organizationId);
  const orgUnitId = useJobPositionsFiltersStore((state) => state.orgUnitId);
  const gradeId = useJobPositionsFiltersStore((state) => state.gradeId);
  const status = useJobPositionsFiltersStore((state) => state.status);
  const occupancy = useJobPositionsFiltersStore((state) => state.occupancy);

  const setSearch = useJobPositionsFiltersStore((state) => state.setSearch);
  const setOrganizationId = useJobPositionsFiltersStore((state) => state.setOrganizationId);
  const setOrgUnitId = useJobPositionsFiltersStore((state) => state.setOrgUnitId);
  const setGradeId = useJobPositionsFiltersStore((state) => state.setGradeId);
  const setStatus = useJobPositionsFiltersStore((state) => state.setStatus);
  const setOccupancy = useJobPositionsFiltersStore((state) => state.setOccupancy);

  const organizations = useOrganizationsForJobs();
  const orgUnits = useOrgUnitsForJobs(
    organizationId ? Number(organizationId) : undefined,
  );
  const grades = useJobGrades();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1a2535] bg-white p-3 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3">
        <Search className="size-4 shrink-0 text-gray-400" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("jobs.positions.searchPlaceholder")}
          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <Select
        value={organizationId || ALL_VALUE}
        onValueChange={(value) =>
          setOrganizationId(value === ALL_VALUE ? "" : value)
        }
      >
        <SelectTrigger className="h-10 w-full lg:w-44">
          <SelectValue placeholder={t("jobs.positions.allOrganizations")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t("jobs.positions.allOrganizations")}</SelectItem>

          {organizations.data?.map((org) => (
            <SelectItem key={org.id} value={String(org.id)}>
              {org.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={orgUnitId || ALL_VALUE}
        onValueChange={(value) => setOrgUnitId(value === ALL_VALUE ? "" : value)}
        disabled={!organizationId}
      >
        <SelectTrigger className="h-10 w-full lg:w-44">
          <SelectValue placeholder={t("jobs.positions.allUnits")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t("jobs.positions.allUnits")}</SelectItem>

          {orgUnits.data?.map((unit) => (
            <SelectItem key={unit.id} value={String(unit.id)}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={gradeId || ALL_VALUE}
        onValueChange={(value) => setGradeId(value === ALL_VALUE ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full lg:w-36">
          <SelectValue placeholder={t("jobs.positions.allGrades")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t("jobs.positions.allGrades")}</SelectItem>

          {grades.data?.map((grade) => (
            <SelectItem key={grade.gradeId} value={String(grade.gradeId)}>
              {grade.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={occupancy || ALL_VALUE}
        onValueChange={(value) => setOccupancy(value === ALL_VALUE ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full lg:w-40">
          <SelectValue placeholder={t("jobs.positions.allOccupancy")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t("jobs.positions.allOccupancy")}</SelectItem>
          <SelectItem value="occupied">{t("jobs.positions.occupied")}</SelectItem>
          <SelectItem value="open">{t("jobs.positions.open")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={status || ALL_VALUE}
        onValueChange={(value) => setStatus(value === ALL_VALUE ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full lg:w-36">
          <SelectValue placeholder={t("organizations.allStatus")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t("organizations.allStatus")}</SelectItem>
          <SelectItem value="active">{t("common.active")}</SelectItem>
          <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={onExport}
        disabled={exportDisabled}
        className="h-10 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
      >
        <Download className="size-4" />
        {t("common.export")}
      </Button>
    </div>
  );
}
