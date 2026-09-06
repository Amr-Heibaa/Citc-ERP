import { useTranslation } from "react-i18next";

export function WizardHeader({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 px-6 pb-3 pt-6">
      <h2 className="font-['Inter',sans-serif] text-[32px] font-semibold leading-none text-black">
        {t("employees.wizard.createEmployeeTitle")}
      </h2>

      <p className="mt-7 font-['Inter',sans-serif] text-[24px] font-semibold text-black">
        Step{step}: {title}
      </p>

      <p className="mt-1 font-['Inter',sans-serif] text-[16px] text-[#6b7280]">
        {description}
      </p>
    </div>
  );
}
