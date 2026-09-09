import { useState } from "react";
import { Clock3, HeartPulse, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const STEPS = [
  {
    icon: Clock3,
    title: "שתי לחיצות לכל ציר",
    body: "כשהציר מתחיל — לחצי ״התחיל״. כשהוא יורד — ״נגמר״. משך ומרווח נמדדים לבד.",
  },
  {
    icon: HeartPulse,
    title: "כלל 5-1-1",
    body: "לידה ראשונה: כל חמש דקות, כדקה, שעה ברצף — אז יוצאים לחדר לידה. לידה חוזרת — מוקדם יותר. אפשר לשנות בהגדרות.",
  },
  {
    icon: Shield,
    title: "מעקב, לא ייעוץ רפואי",
    body: "מים, דימום, פחות תנועות, או שאת לא מרגישה טוב — מיד לחדר לידה או למד״א 101. אל תחכי לכלל.",
  },
] as const;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const complete = useAppStore((state) => state.completeOnboarding);
  const current = STEPS[step];
  if (!current) return null;
  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md">
        <p className="font-display text-3xl font-semibold tracking-tight text-fg">מעקב צירים</p>
        <p className="mt-1 text-sm text-muted">מעקב בבית, עד שיוצאים</p>
        <div className="mt-8 flex size-12 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Icon className="size-6" strokeWidth={1.8} />
        </div>
        <p id="onboarding-title" className="mt-5 font-display text-2xl font-semibold text-fg">
          {current.title}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{current.body}</p>
        <div className="mt-8 flex gap-1.5">
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-accent" : "bg-track"}`}
            />
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={complete}>
            דלגי
          </Button>
          <Button
            className="flex-[2]"
            onClick={() => {
              if (last) complete();
              else setStep((value) => value + 1);
            }}
          >
            {last ? "בואי נתחיל" : "המשיכי"}
          </Button>
        </div>
      </div>
    </div>
  );
}
