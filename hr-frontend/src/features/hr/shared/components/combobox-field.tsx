import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";

export type ComboboxFieldOption = {
  value: string;
  label: string | null | undefined;
};

export function ComboboxField<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  disabled,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  options: ComboboxFieldOption[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((option) => option.value === field.value);

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className="h-10 w-full justify-between font-normal"
              >
                <span className={cn("truncate", !selected && "text-muted-foreground")}>
                  {selected ? (selected.label ?? selected.value) : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-(--radix-popover-trigger-width) p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder={searchPlaceholder ?? placeholder} />
                <CommandList>
                  <CommandEmpty>{emptyText ?? "—"}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={`${option.label ?? option.value} ${option.value}`}
                        onSelect={() => {
                          field.onChange(option.value === field.value ? "" : option.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            field.value === option.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {option.label ?? option.value}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    />
  );
}
