import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Clock3, List, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { activeContraction } from "@/lib/contractions";
import { useCurrentSession } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "עכשיו", icon: Clock3 },
  { to: "/history", label: "היסטוריה", icon: List },
  { to: "/guide", label: "מדריך", icon: BookOpen },
  { to: "/settings", label: "הגדרות", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const session = useCurrentSession();
  const hideNav = pathname === "/" && Boolean(activeContraction(session));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden bg-bg text-fg md:border-x md:border-border">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      {hideNav ? null : (
        <nav
          className="z-30 shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
          aria-label="ניווט ראשי"
        >
          <ul className="grid grid-cols-4">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium tracking-wide transition-[color,opacity] duration-150",
                      active ? "text-accent" : "text-muted",
                    )}
                  >
                    {active ? (
                      <span className="absolute top-1.5 size-1 rounded-full bg-accent" aria-hidden="true" />
                    ) : null}
                    <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
