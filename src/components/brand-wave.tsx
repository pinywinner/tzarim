import { cn } from "@/lib/utils";

export function BrandWave({
  breathing = false,
  mark,
  className,
}: {
  breathing?: boolean;
  mark?: "home" | "onboarding";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 168 72"
      className={cn("text-active", breathing && "wave-breathe", className)}
      fill="none"
      aria-hidden="true"
      {...(mark === "home" ? { "data-home-wave": "" } : {})}
      {...(mark === "onboarding" ? { "data-onboarding-wave": "" } : {})}
    >
      <path
        d="M10 52c26 0 34 0 48-24C68 12 74 8 84 8s16 4 26 20c14 24 22 24 48 24"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyWave({
  title,
  body,
  className,
}: {
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
      <BrandWave mark="home" className="w-28" />
      <p data-intro-chrome className="mt-6 font-display text-2xl font-bold text-fg">{title}</p>
      {body ? <p data-intro-chrome className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{body}</p> : null}
    </div>
  );
}
