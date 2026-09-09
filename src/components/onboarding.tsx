import { useState } from "react";
import { Clock3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BirthType } from "@/lib/contractions";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const BIRTH: { id: Exclude<BirthType, "custom">; title: string; hint: string }[] = [
  { id: "first", title: "לידה ראשונה", hint: "כלל 5-1-1 · כל 5 דק׳, כדקה, שעה" },
  { id: "subsequent", title: "לידה חוזרת", hint: "כלל 7-0.75-0.5 · כל 7 דק׳, 45 שנ׳, חצי שעה" },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Exclude<BirthType, "custom"> | null>(null);
  const complete = useAppStore((state) => state.completeOnboarding);

  const finish = () => complete(picked ?? undefined);

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

        {step === 0 ? <WhoStep picked={picked} onPick={setPicked} /> : null}
        {step === 1 ? <MeasureStep /> : null}
        {step === 2 ? <DisclaimerStep /> : null}

        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-accent" : "bg-track"}`}
            />
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={finish}>
            דלגי
          </Button>
          <Button
            className="flex-[2]"
            disabled={step === 0 && !picked}
            onClick={() => {
              if (step === 0 && !picked) return;
              if (step === 2) finish();
              else setStep((value) => value + 1);
            }}
          >
            {step === 2 ? "בואי נתחיל" : "המשיכי"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function WhoStep({
  picked,
  onPick,
}: {
  picked: Exclude<BirthType, "custom"> | null;
  onPick: (id: Exclude<BirthType, "custom">) => void;
}) {
  return (
    <>
      <p id="onboarding-title" className="mt-8 font-display text-2xl font-semibold text-fg">
        מי את?
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        זה קובע מתי נגיד שהדפוס התמלא. אפשר לשנות אחר כך בהגדרות.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {BIRTH.map((option) => {
          const selected = picked === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPick(option.id)}
              className={cn(
                "rounded-xl px-4 py-4 text-right shadow-border transition-[background-color,box-shadow] duration-150",
                selected ? "bg-accent/10" : "bg-elevated",
              )}
            >
              <span className="block text-base font-semibold text-fg">{option.title}</span>
              <span className="mt-1 block text-xs text-muted">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function MeasureStep() {
  return (
    <>
      <div className="mt-8 flex size-12 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <Clock3 className="size-6" strokeWidth={1.8} />
      </div>
      <p id="onboarding-title" className="mt-5 font-display text-2xl font-semibold text-fg">
        את מודדת. אנחנו מחשבים.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        כשהציר מתחיל — לחצי ״התחיל״. כשהוא יורד — ״סיימתי״. משך ומרווח נמדדים לבד.
      </p>
    </>
  );
}

function DisclaimerStep() {
  return (
    <>
      <div className="mt-8 flex size-12 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <Shield className="size-6" strokeWidth={1.8} />
      </div>
      <p id="onboarding-title" className="mt-5 font-display text-2xl font-semibold text-fg">
        מעקב, לא ייעוץ רפואי
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        מים, דימום, פחות תנועות, או שאת לא מרגישה טוב — מיד לחדר לידה או למד״א 101. אל תחכי לכלל.
      </p>
    </>
  );
}
