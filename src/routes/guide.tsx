import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guide")({ component: GuidePage });

const SECTIONS = [
  {
    title: "איך מודדים",
    body: "משך — מתחילת הציר עד שהוא יורד. מרווח — מתחילת ציר עד תחילת הציר הבא, לא מהסוף. לכן לחצי כשהציר מתחיל, ושוב כשהוא יורד לגמרי.",
  },
  {
    title: "כלל 5-1-1",
    body: "לידה ראשונה: כל חמש דקות, כדקה, שעה ברצף — אז לחדר לידה. לידה חוזרת — מוקדם יותר, לרוב כל שבע דקות, כ־45 שניות, חצי שעה. אפשר לשנות בהגדרות לפי המיילדת.",
  },
  {
    title: "לידה או ברקסטון",
    body: "צירים של לידה מתחזקים, מתקרבים, ולא נעלמים במנוחה או במקלחת. ברקסטון לרוב לא סדירים, קצרים, ומשתנים בתנוחה. אם יש ספק — תתקשרי. אל תנחשי.",
  },
  {
    title: "מתי ללכת מיד",
    urgent: true,
    items: [
      "ירידת מים, גם בלי צירים סדירים",
      "דימום אדום טרי",
      "פחות תנועות של העובר",
      "כאב ראש חזק, טשטוש ראייה, כאב בבטן עליונה",
      "חום, צמרמורת, או תחושה ש״משהו לא בסדר״",
    ],
  },
  {
    title: "נשימה בציר",
    body: "בציר — נשימה איטית החוצה, כאילו מערפלים מראה. בין צירים — שחררי לסת וכתפיים. לא צריך שיטה. תנשמי.",
  },
  {
    title: "לא ייעוץ רפואי",
    body: "זה מעקב במכשיר שלך בלבד. לא תחליף למיילדת או לחדר לידה. במצב חירום — מד״א 101.",
  },
] as const;

function GuidePage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title="מדריך" subtitle="מתי נשארים בבית, ומתי יוצאים" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-8">
        {SECTIONS.map((section) => {
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
