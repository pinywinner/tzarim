import { Droplets } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-t";
import { useAppStore, useCurrentSession } from "@/lib/store";

export function WaterMark({ className }: { className?: string }) {
  const { t } = useT();
  const session = useCurrentSession();
  const setWaterBroke = useAppStore((state) => state.setWaterBroke);
  const [confirm, setConfirm] = useState(false);
  const broke = Boolean(session.waterBrokeAt);

  return (
    <>
      <Button
        variant={broke ? "danger" : "outline"}
        className={className}
        onClick={() => {
          if (broke) {
            setWaterBroke(false);
            toast(t("waterCleared"));
          } else {
            setConfirm(true);
          }
        }}
      >
        <Droplets className="size-4" />
        {broke ? t("waterNotBroke") : t("waterBroke")}
      </Button>
      {confirm ? (
        <ConfirmSheet
          title={t("waterTitle")}
          body={t("waterBody")}
          confirmLabel={t("waterConfirm")}
          danger
          onConfirm={() => {
            setWaterBroke(true);
            setConfirm(false);
          }}
          onCancel={() => setConfirm(false)}
        />
      ) : null}
    </>
  );
}
