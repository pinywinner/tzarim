import { useState } from "react";
import { Shield } from "lucide-react";
import { BrandWave } from "@/components/brand-wave";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-t";
import type { BirthType } from "@/lib/contractions";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Onboarding() {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Exclude<BirthType, "custom"> | null>(null);
  const complete = useAppStore((state) => state.completeOnboarding);

  const finish = () => complete(picked ?? undefined);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg px-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md">
        <div data-intro-chrome>
          <LanguageToggle className="mb-6" />
        </div>
        <BrandWave mark="onboarding" className="mb-4 w-20 text-active" />
        <p data-intro-chrome className="font-display text-3xl font-bold tracking-tight text-fg">{t("appName")}</p>
        <p data-intro-chrome className="mt-1 text-sm text-muted">{t("appTagline")}</p>

        <div data-intro-chrome>
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
            {t("skip")}
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
            {step === 2 ? t("letsStart") : t("continue")}
          </Button>
        </div>
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
  const { t } = useT();
  const birth = [
    { id: "first" as const, title: t("birthFirst"), hint: t("onboardingFirstHint") },
    { id: "subsequent" as const, title: t("birthSubsequent"), hint: t("onboardingSubsequentHint") },
  ];
  return (
    <>
      <p id="onboarding-title" className="mt-8 font-display text-2xl font-bold text-fg">
        {t("onboardingWho")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t("onboardingWhoBody")}</p>
      <div className="mt-6 flex flex-col gap-2">
        {birth.map((option) => {
          const selected = picked === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPick(option.id)}
              className={cn(
                "rounded-xl px-4 py-4 text-start shadow-border transition-[background-color,box-shadow] duration-150",
                selected ? "bg-accent/10" : "bg-elevated",
              )}
            >
              <span className="block text-base font-bold text-fg">{option.title}</span>
              <span className="mt-1 block text-xs text-muted">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function MeasureStep() {
  const { t } = useT();
  return (
    <>
      <div className="mt-8 flex h-12 w-20 items-center text-active">
        <BrandWave className="w-20" />
      </div>
      <p id="onboarding-title" className="mt-5 font-display text-2xl font-bold text-fg">
        {t("onboardingMeasure")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t("onboardingMeasureBody")}</p>
    </>
  );
}

function DisclaimerStep() {
  const { t } = useT();
  return (
    <>
      <div className="mt-8 flex size-12 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <Shield className="size-6" strokeWidth={1.8} />
      </div>
      <p id="onboarding-title" className="mt-5 font-display text-2xl font-bold text-fg">
        {t("onboardingDisclaimer")}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t("onboardingDisclaimerBody")}</p>
    </>
  );
}
