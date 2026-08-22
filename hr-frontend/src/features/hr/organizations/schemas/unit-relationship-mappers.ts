import type { UnitRelationshipFormValues } from "@/features/hr/organizations/schemas/unit-relationship-schema";
import type {
  CreateUnitRelationshipRequest,
  UnitRelationship,
  UpdateUnitRelationshipRequest,
} from "@/lib/api/generated/model";

function optionalText(
  value?: string,
): string | undefined {
  const normalized =
    value?.trim();

  return normalized || undefined;
}

function requestValues(
  values: UnitRelationshipFormValues,
) {
  return {
    fromUnitId: Number(
      values.fromUnitId,
    ),
    toUnitId: Number(
      values.toUnitId,
    ),
    relationTypeId: Number(
      values.relationTypeId,
    ),
    startDate:
      values.startDate,
    endDate:
      optionalText(
        values.endDate,
      ),
    active: values.active,
  };
}

export function toCreateUnitRelationshipRequest(
  values: UnitRelationshipFormValues,
): CreateUnitRelationshipRequest {
  return requestValues(values);
}

export function toUpdateUnitRelationshipRequest(
  values: UnitRelationshipFormValues,
): UpdateUnitRelationshipRequest {
  return requestValues(values);
}

export function relationshipToFormValues(
  orgUnitId: number,
  relationship?: UnitRelationship,
): UnitRelationshipFormValues {
  return {
    fromUnitId: String(
      relationship?.fromUnitId ??
        orgUnitId,
    ),

    toUnitId:
      relationship?.toUnitId != null
        ? String(
            relationship.toUnitId,
          )
        : "",

    relationTypeId:
      relationship?.relationTypeId != null
        ? String(
            relationship.relationTypeId,
          )
        : "",

    startDate:
      relationship?.startDate ??
      new Date()
        .toISOString()
        .slice(0, 10),

    endDate:
      relationship?.endDate ??
      "",

    active:
      relationship?.status
        ?.toLowerCase() !==
      "inactive",
  };
}