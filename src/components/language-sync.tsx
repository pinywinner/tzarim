import { useEffect } from "react";
import { dirOf } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-t";

export function LanguageSync() {
  const locale = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirOf(locale);
  }, [locale]);

  return null;
}
