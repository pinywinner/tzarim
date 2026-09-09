import { cn } from "@/lib/utils";

export function BrandWave({
  breathing = false,
  className,
}: {
  breathing?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 168 72"
      className={cn("text-active", breathing && "wave-breathe", className)}
      fill="none"
      aria-hidden="true"
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
