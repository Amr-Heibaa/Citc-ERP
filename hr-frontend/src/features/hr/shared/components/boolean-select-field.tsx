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
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  trueLabel: string;
  falseLabel: string;
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
        <SelectItem value="true">{trueLabel}</SelectItem>
        <SelectItem value="false">{falseLabel}</SelectItem>
      </SelectContent>
    </Select>
  );
}
