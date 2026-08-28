import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BooleanSelectField({
  value,
  onChange,
  trueLabel,
  falseLabel,
  disableTrue = false,
  disableFalse = false,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  trueLabel: string;
  falseLabel: string;
  disableTrue?: boolean;
  disableFalse?: boolean;
}) {
  return (
    <Select
      value={value ? "true" : "false"}
      onValueChange={(next) => onChange(next === "true")}
    >
      <SelectTrigger className="h-10 w-full">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="true" disabled={disableTrue}>
          {trueLabel}
        </SelectItem>

        <SelectItem value="false" disabled={disableFalse}>
          {falseLabel}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}