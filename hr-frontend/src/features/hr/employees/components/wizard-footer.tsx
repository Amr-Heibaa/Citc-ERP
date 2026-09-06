import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export function WizardFooter({
  step,
  onBack,
  onSkip,
  pending,
  submitDisabled,
  final = false,
}: {
  step: number;
  onBack?: () => void;
  onSkip?: () => void;
  pending?: boolean;
  submitDisabled?: boolean;
  final?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 items-center justify-between px-6 py-4">
      <p className="text-sm text-[#6b7280]">
        {t("employees.wizard.stepOf", { step })}
      </p>

      <div className="flex gap-3">
        {onSkip && (
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="w-24"
          >
            {t("employees.wizard.skip")}
          </Button>
        )}

        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-24"
          >
            {t("employees.wizard.back")}
          </Button>
        )}

        <Button
          type="submit"
          disabled={pending || submitDisabled}
          className="w-24 bg-[#1f2c3e] text-white"
        >
          {pending
            ? t("employees.wizard.saving")
            : final
              ? t("employees.wizard.add")
              : t("employees.wizard.next")}
        </Button>
      </div>
    </div>
  );
}
