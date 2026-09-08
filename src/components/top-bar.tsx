import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const theme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);

  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="min-w-0">
        <p className="font-display text-3xl font-semibold leading-none tracking-tight text-fg">{title}</p>
        {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <Button
        variant="secondary"
        size="icon"
        aria-label={theme === "dark" ? "מצב יום" : "מצב לילה"}
        onClick={() => updateSettings({ theme: theme === "dark" ? "light" : "dark" })}
      >
        {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    </header>
  );
}
