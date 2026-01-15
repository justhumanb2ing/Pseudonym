import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePageAutoSaveState } from "@/components/page/use-page-auto-save-controller";
import { Spinner } from "../../ui/spinner";

interface SavingStatusIndicatorProps {
  className?: string;
}

export default function SavingStatusIndicator({
  className,
}: SavingStatusIndicatorProps) {
  const { status, statusLabel } = usePageAutoSaveState((state) => ({
    status: state.status,
    statusLabel: state.statusLabel,
  }));
  const isSavingStatus = status === "dirty" || status === "saving";

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-primary text-xs lg:text-sm font-medium",
        status === "error" && "text-destructive",
        className
      )}
    >
      {isSavingStatus && <Spinner className="size-4" />}
      {statusLabel}
    </div>
  );
}
