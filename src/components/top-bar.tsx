import { Moon, Sun } from "lucide-react";
import { BrandWave } from "@/components/brand-wave";
import { Button } from "@/components/ui/button";
import { hapticTap } from "@/lib/haptics";
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
        <div className="flex items-center gap-2.5">
          <BrandWave className="w-11 shrink-0 text-active" />
          <p className="font-display text-3xl font-bold leading-none tracking-tight text-fg">{title}</p>
        </div>
        {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <Button
        variant="secondary"
        size="icon"
        aria-label={theme === "dark" ? "מצב יום" : "מצב לילה"}
        onClick={() => {
          hapticTap();
          updateSettings({ theme: theme === "dark" ? "light" : "dark" });
        }}
      >
        {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    </header>
  );
}
