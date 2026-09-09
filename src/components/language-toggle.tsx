import type { Locale } from "@/lib/i18n";
import { hapticTap } from "@/lib/haptics";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useAppStore((state) => state.settings.locale ?? "he");
  const updateSettings = useAppStore((state) => state.updateSettings);

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    hapticTap();
    updateSettings({ locale: next });
  };

  return (
    <div className={cn("grid grid-cols-2 gap-1 rounded-full bg-elevated p-1 shadow-border", className)} role="group">
      <button
        type="button"
        onClick={() => setLocale("he")}
        className={cn(
          "h-12 rounded-full text-sm font-bold transition-[background-color,color] duration-150",
          locale === "he" ? "bg-primary-container text-on-primary-container" : "text-muted",
        )}
        aria-pressed={locale === "he"}
      >
        עברית
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "h-12 rounded-full text-sm font-bold transition-[background-color,color] duration-150",
          locale === "en" ? "bg-primary-container text-on-primary-container" : "text-muted",
        )}
        aria-pressed={locale === "en"}
      >
        English
      </button>
    </div>
  );
}
