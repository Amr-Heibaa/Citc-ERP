import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectFieldOption = {
  value: string;
  label: string | null | undefined;
};

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder,
  options,
  disabled,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  placeholder: string;
  options: SelectFieldOption[];
  disabled?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          value={field.value || undefined}
          onValueChange={field.onChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label ?? option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
