import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PRESETS, type BirthType } from "@/lib/contractions";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const BIRTH_OPTIONS: { id: BirthType; title: string; hint: string }[] = [
  { id: "first", title: "לידה ראשונה", hint: "כל 5 דק׳ · דקה · שעה" },
  { id: "subsequent", title: "לידה חוזרת", hint: "כל 7 דק׳ · 45 שנ׳ · חצי שעה" },
  { id: "custom", title: "מותאם אישית", hint: "את קובעת את היעד" },
];

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
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="text-sm font-medium text-fg">{label}</p>
      <div className="flex items-center gap-2" dir="ltr">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md bg-surface text-lg text-fg shadow-border"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label={`הקטיני ${label}`}
        >
          −
        </button>
        <p className="min-w-16 text-center text-sm font-semibold tabular-nums text-fg">
          {value} {unit}
        </p>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md bg-surface text-lg text-fg shadow-border"
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label={`הגדילי ${label}`}
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
  const settings = useAppStore((state) => state.settings);
  const setBirthType = useAppStore((state) => state.setBirthType);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetAll = useAppStore((state) => state.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title="הגדרות" subtitle="יעד, מסך ונתונים" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8">
        <section className="rounded-xl bg-elevated p-2 shadow-border">
          {BIRTH_OPTIONS.map((option) => {
            const selected = settings.birthType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setBirthType(option.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-3 text-right transition-[background-color] duration-150",
                  selected ? "bg-accent/10" : "",
                )}
              >
                <span>
                  <span className="block text-sm font-semibold text-fg">{option.title}</span>
                  <span className="block text-xs text-muted">{option.hint}</span>
                </span>
                <span className={cn("size-3 rounded-full", selected ? "bg-accent" : "bg-track")} />
              </button>
            );
          })}
        </section>

        <section className="rounded-xl bg-elevated px-4 py-2 shadow-border">
          <Stepper
            label="מרווח יעד"
            value={settings.intervalMinutes}
            unit="דק׳"
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
            label="משך יעד"
            value={settings.durationSeconds}
            unit="שנ׳"
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
            label="זמן ברצף"
            value={settings.patternMinutes}
            unit="דק׳"
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
            label="מצב לילה"
            hint="מסך כהה לחדר חשוך"
            checked={settings.theme === "dark"}
            onCheckedChange={(checked) => updateSettings({ theme: checked ? "dark" : "light" })}
          />
          <ToggleRow
            label="מסך דולק"
            hint="כשהמעקב פתוח המסך לא ייכבה"
            checked={settings.keepAwake}
            onCheckedChange={(keepAwake) => updateSettings({ keepAwake })}
          />
          <ToggleRow
            label="רטט"
            hint="רטט קצר כשהציר מתחיל ונגמר"
            checked={settings.vibration}
            onCheckedChange={(vibration) => updateSettings({ vibration })}
          />
          <ToggleRow
            label="צליל"
            hint="כבוי כברירת מחדל — לחדר שקט"
            checked={settings.sound}
            onCheckedChange={(sound) => updateSettings({ sound })}
          />
        </section>

        <Button variant="outline" onClick={() => setConfirmReset(true)}>
          מחקי את כל הנתונים במכשיר
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">
          הנתונים נשמרים רק במכשיר הזה. אין חשבון, אין ענן, אין שיתוף אוטומטי.
        </p>
      </div>

      {confirmReset ? (
        <ConfirmSheet
          title="למחוק הכול?"
          body="כל המעקבים והצירים במכשיר יימחקו. אין חזרה."
          confirmLabel="מחקי הכול"
          danger
          onConfirm={() => {
            resetAll();
            setConfirmReset(false);
            toast("הכול נמחק מהמכשיר");
          }}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </main>
  );
}
