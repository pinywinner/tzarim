import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <Sheet labelledBy="confirm-dialog-title" onDismiss={onCancel}>
      <p id="confirm-dialog-title" className="font-display text-headline font-bold text-fg">
        {title}
      </p>
      <p className="mt-2 text-body leading-relaxed text-muted">{body}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button size="lg" variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Sheet>,
    document.body,
  );
}
