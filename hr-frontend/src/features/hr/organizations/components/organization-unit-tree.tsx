import { Building2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { OrganizationUnitTreeNode } from "@/lib/api/generated/model";

export function filterOrganizationUnitTree(
  units: OrganizationUnitTreeNode[],
  search: string,
): OrganizationUnitTreeNode[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return units;
  }

  return units.flatMap((unit) => {
    const children = filterOrganizationUnitTree(unit.children ?? [], search);

    const matches =
      unit.name?.toLowerCase().includes(query) ||
      unit.nameAr?.toLowerCase().includes(query) ||
      unit.code?.toLowerCase().includes(query) ||
      unit.type?.toLowerCase().includes(query);

    if (!matches && children.length === 0) {
      return [];
    }

    return [
      {
        ...unit,
        children,
      },
    ];
  });
}

function TreeNode({
  unit,
  selectedId,
  onSelect,
}: {
  unit: OrganizationUnitTreeNode;
  selectedId?: number;
  onSelect?: (unitId: number) => void;
}) {
  const { t } = useTranslation();
  const unitId = unit.id;
  const selected = unitId != null && unitId === selectedId;
  const children = unit.children ?? [];

  return (
    <div>
      <button
        type="button"
        disabled={unitId == null}
        onClick={() => unitId != null && onSelect?.(unitId)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left font-['Inter',sans-serif] text-xs transition-colors ${
          selected
            ? "bg-cyan-100 text-[#1a2535]"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <ChevronRight className="size-3.5 shrink-0 text-gray-400" />

        <span className="min-w-0 flex-1 truncate">
          {unit.name ?? unit.code ?? t("organizations.structure.chart.unnamedUnit")}
        </span>
      </button>

      {children.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-2">
          {children.map((child, index) => (
            <TreeNode
              key={`${child.id ?? child.code ?? "unit"}-${index}`}
              unit={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationUnitTree({
  organizationName,
  units,
  selectedId,
  onSelect,
}: {
  organizationName: string;
  units: OrganizationUnitTreeNode[];
  selectedId?: number;
  onSelect?: (unitId: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 rounded-md px-2 py-2">
        <Building2 className="size-4 shrink-0 text-[#f5841f]" />

        <span className="truncate font-['Inter',sans-serif] text-xs font-semibold text-[#1a2535]">
          {organizationName}
        </span>
      </div>

      <div className="ml-2 border-l border-gray-200 pl-2">
        {units.map((unit, index) => (
          <TreeNode
            key={`${unit.id ?? unit.code ?? "unit"}-${index}`}
            unit={unit}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
