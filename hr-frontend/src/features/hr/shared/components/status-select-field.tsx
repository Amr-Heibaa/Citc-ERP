import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StatusSelectField({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <Select
      value={active ? "active" : "inactive"}
      onValueChange={(value) => onChange(value === "active")}
    >
      <SelectTrigger className="h-10 w-full">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
}
