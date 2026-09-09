import { useEffect } from "react";
import { useLocale } from "@/hooks/use-t";

export function LanguageSync() {
  const locale = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = "rtl";
  }, [locale]);

  return null;
}
