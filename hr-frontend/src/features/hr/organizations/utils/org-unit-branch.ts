import type { OrganizationUnitDetail } from "@/lib/api/generated/model";

const BRANCH_TYPE = "branch";

export function isBranchUnit(unit: Pick<OrganizationUnitDetail, "type">): boolean {
  return unit.type?.trim().toLowerCase() === BRANCH_TYPE;
}

export type BranchRef = { id: number; name: string };

// Resolves every unit to the nearest branch above it in the tree (a unit
// typed "Branch" resolves to itself), so an employee assigned to a
// department still counts toward the branch that department sits under.
export function buildOrgUnitToBranchMap(
  units: OrganizationUnitDetail[],
): Map<number, BranchRef> {
  const byId = new Map<number, OrganizationUnitDetail>();

  units.forEach((unit) => {
    if (unit.id != null) {
      byId.set(unit.id, unit);
    }
  });

  const cache = new Map<number, BranchRef | undefined>();

  function resolve(unitId: number, seen: Set<number>): BranchRef | undefined {
    if (cache.has(unitId)) {
      return cache.get(unitId);
    }

    if (seen.has(unitId)) {
      return undefined;
    }

    seen.add(unitId);

    const unit = byId.get(unitId);

    if (!unit) {
      return undefined;
    }

    if (isBranchUnit(unit) && unit.id != null && unit.name) {
      const branch: BranchRef = { id: unit.id, name: unit.name };
      cache.set(unitId, branch);
      return branch;
    }

    const result = unit.parentUnitId != null ? resolve(unit.parentUnitId, seen) : undefined;
    cache.set(unitId, result);
    return result;
  }

  const map = new Map<number, BranchRef>();

  units.forEach((unit) => {
    if (unit.id == null) {
      return;
    }

    const branch = resolve(unit.id, new Set());

    if (branch) {
      map.set(unit.id, branch);
    }
  });

  return map;
}
