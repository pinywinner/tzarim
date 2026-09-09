import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, List, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { BrandWave } from "@/components/brand-wave";
import { useNow } from "@/hooks/use-now";
import { useT } from "@/hooks/use-t";
import { activeContraction, evaluatePhase } from "@/lib/contractions";
import { hapticTap } from "@/lib/haptics";
import { useAppStore, useCurrentSession } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useT();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const session = useCurrentSession();
  const settings = useAppStore((state) => state.settings);
  const active = activeContraction(session);
  const hideNav = pathname === "/" && Boolean(active);
  const ticking = Boolean(active) || session.contractions.length > 0;
  const now = useNow(ticking);
  const phase = evaluatePhase(session, settings, now);
  const mood = active ? "labor" : phase === "go" ? "go" : "rest";
  const nav = [
    { to: "/", label: t("navNow"), icon: "wave" as const },
    { to: "/history", label: t("navHistory"), icon: List },
    { to: "/guide", label: t("navGuide"), icon: BookOpen },
    { to: "/settings", label: t("navSettings"), icon: Settings2 },
  ];

  return (
    <div
      className={cn(
        "relative mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden text-fg transition-colors duration-300 md:border-x md:border-border",
        mood === "labor" ? "bg-labor-bg" : mood === "go" ? "bg-go-bg" : "bg-bg",
      )}
    >
      {mood === "labor" ? (
        <div className="labor-wash pointer-events-none absolute inset-0" aria-hidden="true" />
      ) : null}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      {hideNav ? null : (
        <>
          <div className="h-[var(--tabbar-offset)] shrink-0" aria-hidden="true" />
          <nav
            className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            aria-label={t("navAria")}
          >
            <ul className="grid grid-cols-4 rounded-full bg-elevated px-1.5 py-2 shadow-float">
              {nav.map((item) => {
                const current = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={current ? "page" : undefined}
                      onClick={() => hapticTap()}
                      className={cn(
                        "flex min-h-14 flex-col items-center justify-center gap-1 text-xs leading-none tracking-wide transition-[color] duration-150",
                        current ? "font-bold text-fg" : "font-medium text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full text-accent transition-[background-color] duration-150",
                          current && "bg-accent/20",
                        )}
                      >
                        {item.icon === "wave" ? (
                          <BrandWave className="w-7 text-current" />
                        ) : (
                          <item.icon className="size-5" strokeWidth={current ? 2.15 : 1.8} />
                        )}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
