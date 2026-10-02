import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/components/ui/utils";
import { WarningNote } from "@/features/security/components/assignment-editor";
import { MAX_BULK_PAIRS } from "@/features/security/schemas/assignment-limits";

export function WizardStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 items-center gap-2 last:flex-none"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                done && "border-[#f5841f] bg-[#f5841f] text-white",
                active && "border-[#f5841f] text-[#f5841f]",
                !done && !active && "border-gray-300 text-gray-400",
              )}
            >
              {done ? <Check size={12} aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden whitespace-nowrap font-['Inter',sans-serif] text-xs font-medium sm:inline",
                active ? "text-[#f5841f]" : done ? "text-gray-600" : "text-gray-400",
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("mx-1 h-px flex-1", done ? "bg-[#f5841f]" : "bg-gray-200")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export type BulkMode = "add" | "replace";

/**
 * Makes replaceExisting=false vs replaceExisting=true explicit before submit.
 */
export function BulkModeChooser({
  mode,
  onModeChange,
  addDescription,
  replaceDescription,
  replaceDisabledReason,
}: {
  mode: BulkMode;
  onModeChange: (mode: BulkMode) => void;
  addDescription: string;
  replaceDescription: string;
  replaceDisabledReason?: string;
}) {
  const { t } = useTranslation();

  const options: { value: BulkMode; title: string; description: string; disabled: boolean }[] = [
    { value: "add", title: t("security.bulk.modeAdd"), description: addDescription, disabled: false },
    {
      value: "replace",
      title: t("security.bulk.modeReplace"),
      description: replaceDisabledReason ?? replaceDescription,
      disabled: replaceDisabledReason != null,
    },
  ];

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
        {t("security.bulk.modeLegend")}
      </legend>

      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as BulkMode)}
        className="grid gap-2 sm:grid-cols-2"
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`bulk-mode-${option.value}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 font-normal transition-colors",
              mode === option.value ? "border-[#f5841f] bg-[#f5841f]/5" : "border-gray-200",
              option.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <RadioGroupItem
              id={`bulk-mode-${option.value}`}
              value={option.value}
              disabled={option.disabled}
              className="mt-0.5"
            />
            <span>
              <span className="block font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                {option.title}
              </span>
              <span className="mt-0.5 block font-['Inter',sans-serif] text-xs text-gray-500">
                {option.description}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>

      {mode === "replace" && <WarningNote>{t("security.bulk.replaceWarning")}</WarningNote>}
    </fieldset>
  );
}

export function BulkSummary({
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  pairs,
}: {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  pairs: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-[#f8f9fb] p-4">
      <p className="font-['Inter',sans-serif] text-sm text-gray-600">
        {t("security.bulk.pairs", { count: pairs })}
      </p>

      {pairs > MAX_BULK_PAIRS && (
        <p role="alert" className="font-['Inter',sans-serif] text-sm text-red-600">
          {t("security.bulk.tooManyPairs", { max: MAX_BULK_PAIRS })}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: leftTitle, items: leftItems },
          { title: rightTitle, items: rightItems },
        ].map((column) => (
          <div key={column.title} className="min-w-0">
            <p className="mb-1 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wider text-gray-400">
              {column.title} ({column.items.length})
            </p>
            <ul className="max-h-40 overflow-y-auto font-['Inter',sans-serif] text-sm text-gray-700">
              {column.items.map((item, index) => (
                <li key={`${item}-${index}`} className="truncate py-0.5">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
