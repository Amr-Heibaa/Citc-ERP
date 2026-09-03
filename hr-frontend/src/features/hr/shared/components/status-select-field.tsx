import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <BooleanSelectField
      value={active}
      onChange={onChange}
      trueLabel={t("common.active")}
      falseLabel={t("common.inactive")}
      disableFalse={disableInactive}
    />
  );
}