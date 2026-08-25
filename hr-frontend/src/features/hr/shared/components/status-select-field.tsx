import { BooleanSelectField } from "@/features/hr/shared/components/boolean-select-field";

export function StatusSelectField({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <BooleanSelectField
      value={active}
      onChange={onChange}
      trueLabel="Active"
      falseLabel="Inactive"
    />
  );
}
