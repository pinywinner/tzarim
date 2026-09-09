import { dirOf, t, type Locale, type MessageKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function useLocale(): Locale {
  return useAppStore((state) => state.settings.locale ?? "he");
}

export function useT() {
  const locale = useLocale();
  return {
    locale,
    dir: dirOf(locale),
    t: (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars),
  };
}
