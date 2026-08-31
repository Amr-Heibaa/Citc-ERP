import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/i18n";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  function setLanguage(language: AppLanguage) {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 font-['Inter',sans-serif] text-[13px]">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`cursor-pointer transition-colors ${
          i18n.language === "en"
            ? "font-semibold text-[#1a2535]"
            : "text-[#9ca3af] hover:text-[#6b7280]"
        }`}
      >
        {t("language.english")}
      </button>

      <span className="text-[#e5e7eb]">|</span>

      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={`cursor-pointer transition-colors ${
          i18n.language === "ar"
            ? "font-semibold text-[#1a2535]"
            : "text-[#9ca3af] hover:text-[#6b7280]"
        }`}
      >
        {t("language.arabic")}
      </button>
    </div>
  );
}
