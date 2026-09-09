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
    <div className="relative mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden bg-bg text-fg md:border-x md:border-border">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      {hideNav ? null : (
        <>
          <div className="h-[var(--tabbar-offset)] shrink-0" aria-hidden="true" />
          <nav
            className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            aria-label="ניווט ראשי"
          >
            <ul className="grid grid-cols-4 rounded-full bg-elevated px-1.5 py-2 shadow-float">
              {NAV.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-14 flex-col items-center justify-center gap-1 text-xs leading-none tracking-wide transition-[color] duration-150",
                        active ? "font-semibold text-fg" : "font-medium text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full text-accent transition-[background-color] duration-150",
                          active && "bg-accent/20",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={active ? 2.15 : 1.8} />
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
