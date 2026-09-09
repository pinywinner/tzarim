import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { useT } from "@/hooks/use-t";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

export function PrivacyPage() {
  const { t } = useT();
  const blocks = [
    t("privacyIntro"),
    t("privacyLocal"),
    t("privacyShare"),
    t("privacyPerms"),
    t("privacyNotMedical"),
  ];

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t("privacyTitle")} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8">
        {blocks.map((text) => (
          <p key={text} className="text-sm leading-relaxed text-muted">
            {text}
          </p>
        ))}
        <p className="text-xs text-subtle">{t("privacyUpdated")}</p>
        <Link to="/settings" className="text-sm font-medium text-primary">
          {t("navSettings")}
        </Link>
      </div>
    </main>
  );
}
