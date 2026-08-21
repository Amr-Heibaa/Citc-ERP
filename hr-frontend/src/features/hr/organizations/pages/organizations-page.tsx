import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useOrganizations } from "@/features/hr/organizations/api/use-organizations";
import { OrganizationsFiltersBar } from "@/features/hr/organizations/components/organizations-filters-bar";
import { OrganizationsGrid } from "@/features/hr/organizations/components/organizations-grid";
import { useOrganizationsFiltersStore } from "@/features/hr/organizations/store/organizations-filters-store";
import { downloadOrganizationsCsv } from "@/features/hr/organizations/utils/organization-export";
import type { OrganizationSummary } from "@/lib/api/generated/model";

const NO_ORGANIZATIONS: OrganizationSummary[] = [];

export function OrganizationsPage() {
  const navigate = useNavigate();
  const organizationsQuery = useOrganizations();
  const organizations = organizationsQuery.data ?? NO_ORGANIZATIONS;

  const search = useOrganizationsFiltersStore((state) => state.search);
  const typeId = useOrganizationsFiltersStore((state) => state.typeId);
  const status = useOrganizationsFiltersStore((state) => state.status);

  const types = useMemo(() => {
    const map = new Map<string, string>();

    organizations.forEach((organization) => {
      if (organization.organizationTypeId != null) {
        map.set(
          String(organization.organizationTypeId),
          organization.type ?? String(organization.organizationTypeId),
        );
      }
    });

    return [...map.entries()].sort((first, second) =>
      first[1].localeCompare(second[1]),
    );
  }, [organizations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((organization) => {
      const matchesSearch =
        !query ||
        organization.nameEn?.toLowerCase().includes(query) ||
        organization.nameAr?.includes(search) ||
        organization.code?.toLowerCase().includes(query);

      const matchesType =
        !typeId || String(organization.organizationTypeId) === typeId;

      const matchesStatus =
        !status || organization.status?.toLowerCase() === status.toLowerCase();

      return Boolean(matchesSearch && matchesType && matchesStatus);
    });
  }, [organizations, search, status, typeId]);

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("There are no organizations to export");
      return;
    }

    downloadOrganizationsCsv(filtered);
    toast.success(`${filtered.length} organizations exported`);
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            Organizations
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            Manage and view all organization information
          </p>
        </div>

        <Button
          onClick={() => navigate("/hr/organizations/new")}
          className="h-10 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
        >
          <Plus className="size-4" />
          Add Organization
        </Button>
      </div>

      <OrganizationsFiltersBar
        types={types}
        onExport={handleExport}
        exportDisabled={organizationsQuery.isLoading || filtered.length === 0}
      />

      <OrganizationsGrid
        organizations={filtered}
        total={organizations.length}
        isLoading={organizationsQuery.isLoading}
        isError={organizationsQuery.isError}
        onRetry={() => organizationsQuery.refetch()}
        onSelect={(organization) =>
          navigate(`/hr/organizations/${organization.id}`)
        }
      />
    </div>
  );
}
