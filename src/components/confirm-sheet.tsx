import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { useT } from "@/hooks/use-t";

export function ConfirmSheet({
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useT();
  return (
    <Sheet labelledBy="confirm-title" onDismiss={onCancel}>
      <p id="confirm-title" className="font-display text-headline font-bold text-fg">
        {title}
      </p>
      <p className="mt-2 text-body leading-relaxed text-muted">{body}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button size="lg" variant="secondary" onClick={onCancel}>
          {cancelLabel ?? t("notNow")}
        </Button>
      </div>
    </Sheet>
  );
}
