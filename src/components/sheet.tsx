import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Sheet({
  labelledBy,
  onDismiss,
  children,
  className,
}: {
  labelledBy: string;
  onDismiss: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    const shell = document.querySelector("[data-app-shell]");
    shell?.setAttribute("inert", "");
    return () => {
      window.removeEventListener("keydown", onKey);
      shell?.removeAttribute("inert");
    };
  }, [onDismiss]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 sm:items-center sm:px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={onDismiss}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-t-xl bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-float sm:rounded-xl sm:p-6",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-outline-variant sm:hidden" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body,
  );
}
