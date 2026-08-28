import { BooleanSelectField } from "@/features/hr/shared/components/boolean-select-field";

export function StatusSelectField({
  active,
  onChange,
  disableInactive = false,
}: {
  active: boolean;
  onChange: (active: boolean) => void;
  disableInactive?: boolean;
}) {
  return (
    <BooleanSelectField
      value={active}
      onChange={onChange}
      trueLabel="Active"
      falseLabel="Inactive"
      disableFalse={disableInactive}
    />
  );
}