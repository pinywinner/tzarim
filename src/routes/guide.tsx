import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guide")({ component: GuidePage });

function GuidePage() {
  const { t } = useT();
  const sections = [
    { title: t("guideHowTitle"), body: t("guideHowBody") },
    { title: t("guideRuleTitle"), body: t("guideRuleBody") },
    { title: t("guideLaborTitle"), body: t("guideLaborBody") },
    {
      title: t("guideGoTitle"),
      urgent: true,
      items: [t("guideGo1"), t("guideGo2"), t("guideGo3"), t("guideGo4"), t("guideGo5")],
    },
    { title: t("guideBreathTitle"), body: t("guideBreathBody") },
    { title: t("guideLegalTitle"), body: t("guideLegalBody") },
  ];

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t("guideTitle")} subtitle={t("guideSub")} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-8">
        {sections.map((section) => {
          const urgent = "urgent" in section && section.urgent;
          return (
            <article
              key={section.title}
              className={cn(
                "rounded-xl bg-elevated px-4 py-4 shadow-border",
                urgent && "border-s-4 border-s-danger",
              )}
            >
              <h2 className="font-display text-xl font-bold text-fg">{section.title}</h2>
              {"body" in section && section.body ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
              ) : null}
              {"items" in section && section.items ? (
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "flex gap-2 text-sm leading-relaxed",
                        urgent ? "text-fg" : "text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-2 size-1.5 shrink-0 rounded-full",
                          urgent ? "bg-danger" : "bg-accent",
                        )}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}
