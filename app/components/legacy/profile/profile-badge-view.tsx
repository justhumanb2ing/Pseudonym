import { OwnerGate } from "@/components/legacy/auth/owner-gate";
import { NumberTicker } from "@/components/legacy/effects/number-ticker";
import { Separator } from "@/components/ui/separator";
import SavingStatusIndicator from "@/components/legacy/page/saving-status-indicator";
import { cn } from "@/lib/utils";
import type { UmamiResponse } from "../../../service/umami";
import { Badge } from "../../ui/badge";

interface BadgeContentProps {
  isOwner: boolean;
  umamiResult: UmamiResponse | null;
  errorTextClassName?: string;
}

interface BadgeViewProps extends BadgeContentProps {
  className?: string;
}

interface BadgeVariantProps {
  isOwner: boolean;
  umamiResult: UmamiResponse | null;
  isMobilePreview: boolean;
}

function BadgeContent({
  isOwner,
  umamiResult,
  errorTextClassName,
}: BadgeContentProps) {
  return (
    <div className="flex items-center gap-2 justify-end shrink-0">
      {/* <OwnerGate isOwner={isOwner}>
        <div className="flex items-center gap-1">
          <SavingStatusIndicator />
        </div>
        <Separator
          orientation="vertical"
          className={
            "my-1 rounded-full data-[orientation=vertical]:bg-[#e5e5e5] data-[orientation=vertical]:w-0.5 dark:data-[orientation=vertical]:bg-[#505050]"
          }
        />
      </OwnerGate> */}
      {umamiResult && umamiResult.ok ? (
        <p className="text-xs">
          +
          <NumberTicker
            value={umamiResult.data!.visits || 0}
            className="text-foreground dark:text-foreground"
          />{" "}
          Viewer
        </p>
      ) : (
        <p className={errorTextClassName}>Error</p>
      )}
    </div>
  );
}

function BadgeView({
  isOwner,
  umamiResult,
  className,
  errorTextClassName,
}: BadgeViewProps) {
  return (
    <header
      className={cn(
        "rounded-lg absolute z-10 overflow-hidden w-fit shrink-0 px-4",
        className
      )}
    >
      <Badge
        variant={"secondary"}
        // className="px-3 py-3.5 rounded-sm! bg-secondary/70 backdrop-blur-sm"
      >
        <BadgeContent
          isOwner={isOwner}
          umamiResult={umamiResult}
          errorTextClassName={errorTextClassName}
        />
      </Badge>
    </header>
  );
}

export function DesktopBadgeView({
  isOwner,
  umamiResult,
  isMobilePreview,
}: BadgeVariantProps) {
  return (
    <BadgeView
      isOwner={isOwner}
      umamiResult={umamiResult}
      className={cn(
        "hidden",
        isMobilePreview ? "block top-4.5 left-0" : "left-2 top-4 xl:block"
      )}
    />
  );
}

export function MobileBadgeView({
  isOwner,
  umamiResult,
  isMobilePreview,
}: BadgeVariantProps) {
  return (
    <BadgeView
      isOwner={isOwner}
      umamiResult={umamiResult}
      className={cn(
        "block",
        isMobilePreview ? "hidden top-3.5 left-0" : "left-1 top-4.5 xl:hidden"
      )}
      errorTextClassName="text-xs"
    />
  );
}
