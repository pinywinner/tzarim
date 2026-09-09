import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { LanguageToggle } from "@/components/language-toggle";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/hooks/use-t";
import { APP_VERSION } from "@/lib/app-version";
import { PRESETS, type BirthType } from "@/lib/contractions";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function Stepper({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const { t } = useT();
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="text-sm font-medium text-fg">{label}</p>
      <div className="flex items-center gap-2" dir="ltr">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md bg-surface text-lg text-fg shadow-border"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label={t("decreaseAria", { label })}
        >
          −
        </button>
        <p className="min-w-16 text-center text-sm font-bold tabular-nums text-fg">
          {value} {unit}
        </p>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md bg-surface text-lg text-fg shadow-border"
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label={t("increaseAria", { label })}
        >
          +
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function SettingsPage() {
  const { t } = useT();
  const settings = useAppStore((state) => state.settings);
  const setBirthType = useAppStore((state) => state.setBirthType);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetAll = useAppStore((state) => state.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);
  const birthOptions: { id: BirthType; title: string; hint: string }[] = [
    { id: "first", title: t("birthFirst"), hint: t("birthFirstHint") },
    { id: "subsequent", title: t("birthSubsequent"), hint: t("birthSubsequentHint") },
    { id: "custom", title: t("birthCustom"), hint: t("birthCustomHint") },
  ];

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t("settingsTitle")} subtitle={t("settingsSub")} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8">
        <section className="rounded-xl bg-elevated p-3 shadow-border">
          <p className="px-1 text-sm font-medium text-fg">{t("language")}</p>
          <p className="mb-3 px-1 text-xs text-muted">{t("languageHint")}</p>
          <LanguageToggle />
        </section>

        <section className="rounded-xl bg-elevated p-2 shadow-border">
          {birthOptions.map((option) => {
            const selected = settings.birthType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setBirthType(option.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-3 text-start transition-[background-color] duration-150",
                  selected ? "bg-accent/10" : "",
                )}
              >
                <span>
                  <span className="block text-sm font-bold text-fg">{option.title}</span>
                  <span className="block text-xs text-muted">{option.hint}</span>
                </span>
                <span className={cn("size-3 rounded-full", selected ? "bg-accent" : "bg-track")} />
              </button>
            );
          })}
        </section>

        <section className="rounded-xl bg-elevated px-4 py-2 shadow-border">
          <Stepper
            label={t("targetInterval")}
            value={settings.intervalMinutes}
            unit={t("unitMin")}
            min={2}
            max={15}
            step={1}
            onChange={(intervalMinutes) => {
              const preset =
                intervalMinutes === PRESETS.first.intervalMinutes &&
                settings.durationSeconds === PRESETS.first.durationSeconds &&
                settings.patternMinutes === PRESETS.first.patternMinutes
                  ? "first"
                  : intervalMinutes === PRESETS.subsequent.intervalMinutes &&
                      settings.durationSeconds === PRESETS.subsequent.durationSeconds &&
                      settings.patternMinutes === PRESETS.subsequent.patternMinutes
                    ? "subsequent"
                    : "custom";
              updateSettings({ intervalMinutes, birthType: preset });
            }}
          />
          <Stepper
            label={t("targetDuration")}
            value={settings.durationSeconds}
            unit={t("unitSec")}
            min={20}
            max={90}
            step={5}
            onChange={(durationSeconds) =>
              updateSettings({
                durationSeconds,
                birthType: "custom",
              })
            }
          />
          <Stepper
            label={t("targetWindow")}
            value={settings.patternMinutes}
            unit={t("unitMin")}
            min={15}
            max={120}
            step={5}
            onChange={(patternMinutes) =>
              updateSettings({
                patternMinutes,
                birthType: "custom",
              })
            }
          />
        </section>

        <section className="rounded-xl bg-elevated px-4 shadow-border">
          <ToggleRow
            label={t("darkMode")}
            hint={t("darkModeHint")}
            checked={settings.theme === "dark"}
            onCheckedChange={(checked) => updateSettings({ theme: checked ? "dark" : "light" })}
          />
          <ToggleRow
            label={t("keepAwake")}
            hint={t("keepAwakeHint")}
            checked={settings.keepAwake}
            onCheckedChange={(keepAwake) => updateSettings({ keepAwake })}
          />
          <ToggleRow
            label={t("vibration")}
            hint={t("vibrationHint")}
            checked={settings.vibration}
            onCheckedChange={(vibration) => updateSettings({ vibration })}
          />
          <ToggleRow
            label={t("sound")}
            hint={t("soundHint")}
            checked={settings.sound}
            onCheckedChange={(sound) => updateSettings({ sound })}
          />
        </section>

        <Button variant="outline" onClick={() => setConfirmReset(true)}>
          {t("resetData")}
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">{t("dataStay")}</p>
        <p className="text-center text-xs text-muted">{t("version", { v: APP_VERSION })}</p>
      </div>

      {confirmReset ? (
        <ConfirmSheet
          title={t("resetTitle")}
          body={t("resetBody")}
          confirmLabel={t("resetConfirm")}
          danger
          onConfirm={() => {
            resetAll();
            setConfirmReset(false);
            toast(t("resetToast"));
          }}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </main>
  );
}
